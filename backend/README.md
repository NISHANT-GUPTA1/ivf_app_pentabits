# Embryo Viability Analysis - Backend API with Clinical Explainability

FastAPI backend for ensemble prediction using 3 trained models with comprehensive clinical analysis and explainability features.

## 🚀 Features

- **Ensemble Prediction**: Uses 3 RandomForest models trained on different datasets
- **Morphological Feature Extraction**: Extracts 20 key features from embryo images
- **Clinical Grading Systems**:
  - Gardner blastocyst grading (expansion, ICM, TE)
  - Morphological analysis (fragmentation, circularity, symmetry)
  - Morphokinetics assessment (developmental timing)
- **Genetic Risk Assessment**: Chromosomal risk indicators and PGT-A recommendations
- **Clinical Recommendations**: Transfer/freeze/discard guidance with priority ranking
- **Explainability**: Feature importance, decision factors, and confidence scoring
- **Quality Metrics**: Model agreement rate, confusion matrix, performance metrics
- **Abnormality Detection**: Automatic flagging of concerning morphology
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **CORS Enabled**: Works seamlessly with frontend on different port

## 📋 Clinical Parameters Analyzed

### Morphological Analysis
1. **Fragmentation** - Level and percentage
2. **Circularity** - Cell shape regularity (0-1 score)
3. **Cell Symmetry** - Blastomere uniformity
4. **Boundary Definition** - Edge clarity and sharpness
5. **Zona Pellucida** - Thickness and integrity
6. **Cytoplasmic Granularity** - Texture quality
7. **Vacuolization** - Presence of fluid-filled spaces

### Blastocyst Grading (Gardner System)
- Expansion stage (1-6)
- Inner Cell Mass grade (A, B, C)
- Trophectoderm grade (A, B, C)
- Overall grade (e.g., "4AA", "5BB")

### Genetic Risk Indicators
- Chromosomal risk level (Low/Medium/High)
- Aneuploidy risk score (0-100)
- PGT-A recommendation
- Risk factors identified

### Clinical Recommendations
- Transfer recommendation (immediate/caution/freeze/discard)
- Transfer priority (1-5 ranking)
- Freeze/discard recommendations
- Detailed reasoning and clinical notes

## 🔬 Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Server**:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

   Or with Python module:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

## 📡 API Endpoints

### `GET /`
Health check endpoint
```json
{
  "status": "ok",
  "models_loaded": 3,
  "message": "Embryo Viability Analysis API"
}
```

### `GET /health`
Detailed health status
```json
{
  "status": "ok",
  "models": ["model_1", "model_2", "model_3"]
}
```

### `POST /predict`
Comprehensive embryo viability prediction with clinical explainability

**Request**: Multipart form-data with `file` field containing embryo image

**Response** (abbreviated - see full schema below):
```json
{
  "prediction": "good",
  "viability_score": 82.5,
  "confidence": 0.85,
  "confidence_level": "high",
  "model_predictions": [...],
  "features": {...},
  
  "morphological_analysis": {
    "fragmentation_level": "Moderate (10-25%)",
    "fragmentation_percentage": 12.5,
    "circularity_score": 0.873,
    "circularity_grade": "Excellent",
    "cell_symmetry": "Good - Adequate symmetry",
    "boundary_definition": "Sharp - Well-defined boundaries",
    "zona_pellucida_thickness": 15.2,
    "zona_pellucida_integrity": "Intact - Normal appearance",
    "cytoplasmic_granularity": "Minimal - Smooth cytoplasm",
    "vacuolization": "None - No vacuoles detected"
  },
  
  "blastocyst_grading": {
    "expansion_stage": 4,
    "expansion_description": "Expanded blastocyst",
    "inner_cell_mass_grade": "A",
    "trophectoderm_grade": "A",
    "overall_grade": "4AA",
    "quality_assessment": "Excellent - Top quality blastocyst"
  },
  
  "morphokinetics": {
    "estimated_developmental_stage": "Expanded Blastocyst (Day 5-6)",
    "timing_assessment": "Optimal - Expected developmental timing",
    "predicted_day": 5
  },
  
  "genetic_risk": {
    "chromosomal_risk_level": "Low",
    "aneuploidy_risk_score": 18.5,
    "pgt_a_recommendation": "Optional - Low risk profile",
    "risk_factors": ["No significant risk factors identified"]
  },
  
  "clinical_recommendation": {
    "transfer_recommendation": "Transfer immediately - Excellent candidate",
    "transfer_priority": 1,
    "freeze_recommendation": false,
    "discard_recommendation": false,
    "reasoning": [
      "High viability score (82.5) with low genetic risk",
      "Morphology: Good - Adequate symmetry",
      "Blastocyst grade: 4AA"
    ],
    "clinical_notes": "Embryo shows good - adequate symmetry with moderate (10-25%). Genetic risk assessment: Low. Gardner grade: 4AA."
  },
  
  "explainability": {
    "feature_importance": {
      "Circularity (cell shape)": 87.3,
      "Fragmentation indicator": 85.2,
      "Cell boundary definition": 75.0,
      ...
    },
    "top_positive_features": [
      {"feature": "Circularity (cell shape)", "contribution": 87.3},
      {"feature": "Fragmentation indicator", "contribution": 85.2}
    ],
    "top_negative_features": [],
    "decision_factors": [
      "✓ Excellent cell shape and symmetry",
      "✓ Low fragmentation - uniform appearance",
      "✓ Well-defined cell boundaries"
    ],
    "confidence_explanation": "High confidence (85.0%) - All 3 AI models strongly agree on this assessment"
  },
  
  "quality_metrics": {
    "agreement_rate": 1.0,
    "prediction_consistency": "High - Models strongly agree",
    "model_confidence_scores": [0.83, 0.85, 0.87],
    "uncertainty_level": "Low - Very confident prediction"
  },
  
  "abnormality_flags": {
    "has_abnormalities": false,
    "abnormality_types": ["No significant abnormalities detected"],
    "severity": "None - Normal morphology",
    "requires_manual_review": false
  },
  
  "analysis_timestamp": "2026-01-31T10:30:45.123456",
  "processing_time_ms": 285.42
}
```

## 🎯 Models

The backend loads 3 pre-trained RandomForest models from:
```
../Complete_training_pipeline/embryo_model_1.pkl
../Complete_training_pipeline/embryo_model_2.pkl
../Complete_training_pipeline/embryo_model_3.pkl
```

### Ensemble Strategy
- All 3 models make predictions independently
- Probabilities are averaged for final prediction
- Final prediction: "good" if avg probability > 0.5
- Confidence: max(probability_good, probability_not_good)

## Feature Extraction

The backend extracts 8 morphological features:

1. **std_dev**: Standard deviation (texture)
2. **mean_intensity**: Average pixel intensity
3. **contrast**: Max - Min intensity
4. **edge_density**: Proportion of edge pixels (Canny)
5. **entropy**: Shannon entropy of intensity histogram
6. **num_regions**: Connected components count
7. **circularity**: 4π × area / perimeter²
8. **gradient_magnitude**: Average Sobel gradient

## Development

### Test the API
Visit http://localhost:8000/docs for interactive Swagger UI

### Watch Logs
```bash
tail -f logs/app.log
```

### Debug Mode
Set logging level in main.py:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Production Deployment

For production, use gunicorn with multiple workers:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Dependencies

- fastapi: Web framework
- uvicorn: ASGI server
- scikit-learn: Model loading and prediction
- opencv-python-headless: Image processing
- Pillow: Image loading
- numpy: Numerical operations
- joblib: Model serialization
- python-multipart: File upload handling

## Notes

- Models were trained with scikit-learn 1.6-1.8, backend uses 1.5.1 (compatible)
- Image preprocessing: Resize to 224×224, RGB conversion
- Supports common image formats: JPG, PNG, BMP, TIFF
