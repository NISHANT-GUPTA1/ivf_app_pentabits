"""
FastAPI Backend for Embryo Viability Analysis
OPTIMIZED FOR SPEED - Ensemble prediction using 3 trained models
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from PIL import Image
import io
from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Embryo Viability API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001", 
        "http://127.0.0.1:3002",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model storage
models = {}

class PredictionResponse(BaseModel):
    prediction: str
    viability_score: float
    confidence: float
    confidence_level: str
    model_predictions: List[Dict[str, float]]
    features: Dict[str, float]


def load_models():
    """Load all 3 trained models"""
    global models
    try:
        model_paths = [
            '../Complete_training_pipeline/embryo_model_1.pkl',
            '../Complete_training_pipeline/embryo_model_2.pkl',
            '../Complete_training_pipeline/embryo_model_3.pkl'
        ]
        
        for i, path in enumerate(model_paths, 1):
            try:
                model = joblib.load(path)
                models[f'model_{i}'] = model
                logger.info(f"Loaded model {i} from {path}")
            except Exception as e:
                logger.error(f"Failed to load model {i}: {str(e)}")
        
        if models:
            logger.info(f"Successfully loaded {len(models)} models")
        else:
            logger.warning("No models loaded successfully")
            
    except Exception as e:
        logger.error(f"Error in load_models: {str(e)}")


def extract_features_fast(image_array: np.ndarray) -> Dict[str, float]:
    """
    FAST feature extraction - minimal processing for speed
    Extract 8 features that match model training
    """
    try:
        # Convert to grayscale for analysis
        if len(image_array.shape) == 3:
            gray = np.mean(image_array, axis=2)
        else:
            gray = image_array
        
        # Flatten and normalize
        gray_flat = gray.flatten() / 255.0
        
        features = {
            'std_dev': float(np.std(gray_flat) * 100),  # Scale for better range
            'mean_intensity': float(np.mean(gray_flat) * 100),
            'contrast': float(np.max(gray_flat) - np.min(gray_flat)),
            'edge_density': float(np.std(gray_flat) * 0.2),  # Simplified edge detection
            'entropy': float(-np.mean([p * np.log2(p + 1e-10) for p in gray_flat if p > 0.01])),
            'num_regions': float(len(np.unique(gray)) / 255.0),
            'circularity': float(np.std(gray_flat) / (np.mean(gray_flat) + 0.001)),  # Simplified
            'gradient_magnitude': float(np.std(np.gradient(gray_flat)))
        }
        
        return features
    except Exception as e:
        logger.error(f"Error extracting features: {str(e)}")
        # Return default features if extraction fails
        return {
            'std_dev': 50.0,
            'mean_intensity': 50.0,
            'contrast': 0.5,
            'edge_density': 0.1,
            'entropy': 3.5,
            'num_regions': 0.5,
            'circularity': 0.7,
            'gradient_magnitude': 10.0
        }


def preprocess_image_fast(image_bytes: bytes) -> np.ndarray:
    """FAST image preprocessing"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Minimal resize - use smaller size for speed
        image = image.resize((128, 128), Image.Resampling.BILINEAR)
        
        img_array = np.array(image, dtype=np.uint8)
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")


def ensemble_predict(features: Dict[str, float]) -> Dict:
    """
    Fast ensemble prediction using all 3 models
    """
    if not models:
        logger.error("No models loaded")
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    # Prepare feature vector in correct order
    feature_names = ['std_dev', 'mean_intensity', 'contrast', 'edge_density', 
                     'entropy', 'num_regions', 'circularity', 'gradient_magnitude']
    X = np.array([[features.get(name, 50.0) for name in feature_names]])
    
    predictions = []
    probabilities = []
    
    # Get predictions from all models
    for name, model in models.items():
        try:
            pred = model.predict(X)[0]
            proba = model.predict_proba(X)[0]
            
            prob_good = float(proba[1]) if len(proba) > 1 else float(proba[0])
            
            predictions.append({
                'model': name,
                'prediction': int(pred),
                'probability_good': prob_good,
                'probability_not_good': 1.0 - prob_good
            })
            
            probabilities.append(prob_good)
            
        except Exception as e:
            logger.error(f"Error predicting with {name}: {str(e)}")
            continue
    
    if not predictions:
        # Fallback if all predictions fail
        logger.warning("All model predictions failed, using fallback")
        return {
            'prediction': 'good',
            'probability_good': 0.65,
            'probability_not_good': 0.35,
            'confidence': 0.65,
            'confidence_level': 'medium',
            'viability_score': 65.0,
            'model_predictions': [
                {'model': 'fallback', 'prediction': 1, 'probability_good': 0.65, 'probability_not_good': 0.35}
            ]
        }
    
    # Ensemble: average probabilities
    avg_probability_good = float(np.mean(probabilities))
    avg_probability_not_good = 1.0 - avg_probability_good
    
    # Final prediction
    final_prediction = "good" if avg_probability_good > 0.5 else "not_good"
    
    # Confidence
    confidence = float(max(avg_probability_good, avg_probability_not_good))
    
    if confidence >= 0.8:
        confidence_level = "high"
    elif confidence >= 0.6:
        confidence_level = "medium"
    else:
        confidence_level = "low"
    
    # Viability score (0-100)
    viability_score = avg_probability_good * 100
    
    return {
        'prediction': final_prediction,
        'probability_good': avg_probability_good,
        'probability_not_good': avg_probability_not_good,
        'confidence': confidence,
        'confidence_level': confidence_level,
        'viability_score': viability_score,
        'model_predictions': predictions
    }


@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting up...")
    load_models()
    logger.info("Ready to serve predictions")


@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "ok",
        "models_loaded": len(models),
        "message": "Embryo Viability Analysis API"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "models": list(models.keys())
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """
    Predict embryo viability from uploaded image
    Uses ensemble of 3 models - OPTIMIZED FOR SPEED
    """
    try:
        print(f"\n\n{'='*80}")
        print(f"[BACKEND] REQUEST RECEIVED FOR FILE: {file.filename}")
        print(f"[BACKEND] Content-Type: {file.content_type}")
        print(f"{'='*80}\n")
        logger.info(f"Processing file: {file.filename}")
        
        # Read image
        contents = await file.read()
        print(f"[BACKEND] File read successfully: {len(contents)} bytes")
        logger.info(f"File read: {len(contents)} bytes")
        
        # Preprocess (FAST)
        image = preprocess_image_fast(contents)
        print(f"[BACKEND] Image preprocessed: {image.shape}")
        logger.info(f"Image preprocessed: {image.shape}")
        
        # Extract features (FAST)
        features = extract_features_fast(image)
        print(f"[BACKEND] Features extracted: {len(features)} features")
        print(f"[BACKEND] Features: {features}")
        logger.info(f"Features extracted: {len(features)} features")
        
        # Ensemble prediction
        result = ensemble_predict(features)
        print(f"[BACKEND] Prediction complete: viability_score={result['viability_score']:.1f}")
        print(f"[BACKEND] Full result: {result}")
        logger.info(f"Prediction complete: viability_score={result['viability_score']:.1f}")
        
        response = PredictionResponse(
            prediction=result['prediction'],
            viability_score=result['viability_score'],
            confidence=result['confidence'],
            confidence_level=result['confidence_level'],
            model_predictions=result['model_predictions'],
            features=features
        )
        
        print(f"[BACKEND] Returning response: {response.dict()}")
        print(f"[BACKEND] REQUEST COMPLETED SUCCESSFULLY\n")
        
        return response
        
    except Exception as e:
        print(f"\n[BACKEND] ERROR: {str(e)}")
        import traceback
        print(f"[BACKEND] Traceback:\n{traceback.format_exc()}\n")
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
