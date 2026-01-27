# Embryo Viability Analysis - Backend API

FastAPI backend for ensemble prediction using 3 trained models.

## Features

- **Ensemble Prediction**: Uses 3 RandomForest models trained on different datasets
- **Morphological Feature Extraction**: Extracts 8 key features from embryo images
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **CORS Enabled**: Works seamlessly with frontend on different port

## Setup

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

## API Endpoints

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
Predict embryo viability from image

**Request**: Multipart form-data with `file` field containing image

**Response**:
```json
{
  "prediction": "good",
  "viability_score": 82.5,
  "confidence": 0.85,
  "confidence_level": "high",
  "model_predictions": [
    {
      "model": "model_1",
      "prediction": 1,
      "probability_good": 0.83,
      "probability_not_good": 0.17
    },
    {
      "model": "model_2",
      "prediction": 1,
      "probability_good": 0.85,
      "probability_not_good": 0.15
    },
    {
      "model": "model_3",
      "prediction": 1,
      "probability_good": 0.80,
      "probability_not_good": 0.20
    }
  ],
  "features": {
    "std_dev": 42.3,
    "mean_intensity": 128.5,
    "contrast": 180.2,
    "edge_density": 0.15,
    "entropy": 5.8,
    "num_regions": 12.0,
    "circularity": 0.87,
    "gradient_magnitude": 35.6
  }
}
```

## Models

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
