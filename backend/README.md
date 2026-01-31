# IVF AI Audit Trail System - Backend

This backend provides a comprehensive audit trail system for a clinical IVF AI application with secure authentication, role-based access control, and detailed logging capabilities.

## Features

### Security & Authentication
- JWT-based authentication
- Role-based access control (Admin, Embryologist, Auditor)
- Secure password hashing
- Session management with login/logout tracking

### Patient Tracking
- Anonymized patient audit codes
- Multiple IVF cycles per patient
- Unique cycle and embryo identifiers
- No personally identifiable information in audit logs

### Audit Logging
- Comprehensive logging of all user actions
- AI prediction events with model versions and confidence scores
- Risk indicators and abnormal morphology flags
- AI suggestion overrides with required reasons
- Immutable audit trail with timestamps

### Audit Features
- Read-only audit dashboard for auditors
- Advanced filtering by patient code, cycle ID, date range
- CSV and PDF export capabilities
- Full traceability of embryo analysis decisions

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database:
```bash
python init_db.py
```

3. Start the server:
```bash
python main.py
```

## Default Users

The system comes with three default users (change passwords in production):

- **Admin**: username: `admin`, password: `admin123`
- **Embryologist**: username: `embryologist1`, password: `embryo123`
- **Auditor**: username: `auditor1`, password: `audit123`

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Register new user (Admin only)

### Patient Management
- `POST /patients` - Create patient (Embryologist+)
- `POST /cycles` - Create IVF cycle (Embryologist+)
- `POST /embryos` - Create embryo (Embryologist+)

### AI Prediction
- `POST /predict` - Analyze embryo viability (Embryologist+)

### Notes & Overrides
- `POST /notes` - Add notes (Embryologist+)
- `POST /ai-override` - Log AI override with reason (Embryologist+)

### Audit Trail
- `GET /audit-logs` - View audit logs with filtering (Auditor+)
- `GET /export/csv` - Export audit logs as CSV (Auditor+)
- `GET /export/pdf` - Export audit logs as PDF (Auditor+)

## Usage Examples

### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "embryologist1", "password": "embryo123"}'
```

### Create Patient
```bash
curl -X POST "http://localhost:8000/patients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"audit_code": "PAT001"}'
```

### AI Prediction
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@embryo_image.jpg" \
  -F "prediction_data={\"patient_audit_code\": \"PAT001\", \"cycle_id\": \"CYCLE001\", \"embryo_id\": \"EMB001\"}"
```

### View Audit Logs
```bash
curl -X GET "http://localhost:8000/audit-logs?patient_audit_code=PAT001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Considerations

- Change default passwords immediately
- Use HTTPS in production
- Implement proper session timeouts
- Regular security audits
- Backup audit logs regularly
- Monitor for unauthorized access attempts

## Database Schema

The system uses SQLAlchemy with SQLite (easily configurable for PostgreSQL):

- `users` - User accounts and roles
- `patients` - Anonymized patient records
- `cycles` - IVF cycle information
- `embryos` - Embryo records
- `audit_logs` - All audit events
- `notes` - User notes and comments

## Compliance

This system is designed to help maintain compliance with:
- HIPAA (Health Insurance Portability and Accountability Act)
- GDPR (General Data Protection Regulation)
- Clinical trial data integrity requirements
- Medical device regulatory requirements

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
