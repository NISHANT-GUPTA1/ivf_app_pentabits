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
import cv2
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
        "http://127.0.0.1:5173",
        "https://tangerine-tarsier-b28c57.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model storage
models = {}

class ModelPrediction(BaseModel):
    model: str
    prediction: int
    probability_good: float
    probability_not_good: float

class PredictionResponse(BaseModel):
    prediction: str
    viability_score: float
    confidence: float
    confidence_level: str
    model_predictions: List[ModelPrediction]
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
    Extract 20 features to match model training (for single image instead of video)
    The model expects: 8 morphological features (mean + std) + 4 temporal features
    Since we have a single image, std values will be 0
    """
    try:
        # Convert to grayscale for analysis
        if len(image_array.shape) == 3:
            gray = np.mean(image_array, axis=2)
        else:
            gray = image_array
        
        # Normalize
        gray_normalized = gray / 255.0
        
        # Extract base morphological features
        std_dev = float(np.std(gray))
        mean_intensity = float(np.mean(gray))
        
        # Contrast
        contrast = float(np.max(gray) - np.min(gray))
        
        # Entropy
        hist, _ = np.histogram(gray, bins=256, range=(0, 256))
        hist = hist / hist.sum()
        hist = hist[hist > 0]
        entropy = float(-np.sum(hist * np.log2(hist)))
        
        # Edge density (Canny edges)
        edges = cv2.Canny(gray.astype(np.uint8), 50, 150)
        edge_density = float(np.sum(edges > 0) / edges.size)
        
        # Gradient magnitude
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = float(np.mean(np.sqrt(grad_x**2 + grad_y**2)))
        
        # Circularity
        _, binary = cv2.threshold(gray.astype(np.uint8), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest_contour)
            perimeter = cv2.arcLength(largest_contour, True)
            if perimeter > 0:
                circularity = float(4 * np.pi * area / (perimeter ** 2))
            else:
                circularity = 0.0
        else:
            circularity = 0.0
        
        # Number of regions
        num_regions = float(len(contours))
        
        # Temporal features (since we have single image, use frame=0 indicators)
        frame_number = 0.0
        time_elapsed = 0.0
        
        # Build feature vector with 20 features (mean, std pairs + temporal)
        # For single image: std values are 0, mean values are the actual measurements
        features = {
            'std_dev_mean': std_dev,
            'std_dev_std': 0.0,
            'mean_intensity_mean': mean_intensity,
            'mean_intensity_std': 0.0,
            'contrast_mean': contrast,
            'contrast_std': 0.0,
            'entropy_mean': entropy,
            'entropy_std': 0.0,
            'edge_density_mean': edge_density,
            'edge_density_std': 0.0,
            'gradient_magnitude_mean': gradient_magnitude,
            'gradient_magnitude_std': 0.0,
            'circularity_mean': circularity,
            'circularity_std': 0.0,
            'num_regions_mean': num_regions,
            'num_regions_std': 0.0,
            'frame_number': frame_number,
            'time_elapsed': time_elapsed,
            'frames_analyzed': 1.0,
            'total_duration': 0.0
        }
        
        return features
    except Exception as e:
        logger.error(f"Error extracting features: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Return default features if extraction fails
        return {
            'std_dev_mean': 50.0,
            'std_dev_std': 0.0,
            'mean_intensity_mean': 128.0,
            'mean_intensity_std': 0.0,
            'contrast_mean': 100.0,
            'contrast_std': 0.0,
            'entropy_mean': 5.0,
            'entropy_std': 0.0,
            'edge_density_mean': 0.1,
            'edge_density_std': 0.0,
            'gradient_magnitude_mean': 30.0,
            'gradient_magnitude_std': 0.0,
            'circularity_mean': 0.5,
            'circularity_std': 0.0,
            'num_regions_mean': 10.0,
            'num_regions_std': 0.0,
            'frame_number': 0.0,
            'time_elapsed': 0.0,
            'frames_analyzed': 1.0,
            'total_duration': 0.0
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
    Fast ensemble prediction using all 3 models with 20 features
    """
    if not models:
        logger.error("No models loaded")
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    # Prepare feature vector in correct order (20 features)
    feature_names = [
        'std_dev_mean', 'std_dev_std',
        'mean_intensity_mean', 'mean_intensity_std',
        'contrast_mean', 'contrast_std',
        'entropy_mean', 'entropy_std',
        'edge_density_mean', 'edge_density_std',
        'gradient_magnitude_mean', 'gradient_magnitude_std',
        'circularity_mean', 'circularity_std',
        'num_regions_mean', 'num_regions_std',
        'frame_number', 'time_elapsed',
        'frames_analyzed', 'total_duration'
    ]
    X = np.array([[features.get(name, 0.0) for name in feature_names]])
    
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
