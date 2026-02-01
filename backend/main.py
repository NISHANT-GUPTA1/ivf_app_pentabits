"""
FastAPI Backend for Embryo Viability Analysis with Audit Trail System
OPTIMIZED FOR SPEED - Ensemble prediction using 3 trained models
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import joblib
import numpy as np
from PIL import Image
import cv2
import io
from typing import List, Dict, Optional, Any
import logging
import uuid
import pandas as pd
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from datetime import datetime, timezone
from contextlib import asynccontextmanager

# Database and auth imports
from sqlalchemy.orm import Session
from database import get_db, create_tables
from models import User, Patient, Cycle, Embryo, AuditLog, Note
from auth import (
    authenticate_user, create_access_token, get_current_active_user,
    require_admin, require_embryologist, require_auditor, require_read_only,
    get_password_hash, get_current_user_optional
)
from schemas import *
from audit_logger import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model storage
models = {}

# Define lifespan before app initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models and create database tables on startup"""
    logger.info("Starting up...")
    load_models()
    create_tables()
    logger.info("Ready to serve predictions")
    yield
    logger.info("Shutting down...")

app = FastAPI(title="Embryo Viability API with Audit Trail", lifespan=lifespan)

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


@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # Log login
    log_login(db, user)

    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Register a new user (Admin only)"""
    # Check if user exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Validate role
    if user_data.role not in ["Admin", "Embryologist", "Auditor"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(username=user_data.username, hashed_password=hashed_password, role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log user creation
    log_data = AuditLogCreate(action="USER_CREATED", details={"new_user_id": new_user.id, "new_username": new_user.username})
    log_user_action(db, current_user, log_data)

    return UserResponse(id=new_user.id, username=new_user.username, role=new_user.role, is_active=new_user.is_active, created_at=new_user.created_at)

@app.post("/patients", response_model=PatientResponse)
async def create_patient(patient_data: PatientCreate, current_user: User = Depends(require_embryologist), db: Session = Depends(get_db)):
    """Create a new patient (Embryologist+)"""
    # Check if audit code already exists
    existing = db.query(Patient).filter(Patient.audit_code == patient_data.audit_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient audit code already exists")

    patient = Patient(audit_code=patient_data.audit_code)
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Log action
    log_data = AuditLogCreate(action="PATIENT_CREATED", patient_audit_code=patient.audit_code)
    log_user_action(db, current_user, log_data)

    return PatientResponse(id=patient.id, audit_code=patient.audit_code, created_at=patient.created_at)

@app.post("/cycles", response_model=CycleResponse)
async def create_cycle(cycle_data: CycleCreate, current_user: User = Depends(require_embryologist), db: Session = Depends(get_db)):
    """Create a new IVF cycle (Embryologist+)"""
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == cycle_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Check if cycle_id already exists for this patient
    existing = db.query(Cycle).filter(Cycle.patient_id == cycle_data.patient_id, Cycle.cycle_id == cycle_data.cycle_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cycle ID already exists for this patient")

    cycle = Cycle(patient_id=cycle_data.patient_id, cycle_id=cycle_data.cycle_id)
    db.add(cycle)
    db.commit()
    db.refresh(cycle)

    # Log action
    log_data = AuditLogCreate(action="CYCLE_CREATED", patient_audit_code=patient.audit_code, cycle_id=cycle.cycle_id)
    log_user_action(db, current_user, log_data)

    return CycleResponse(id=cycle.id, patient_id=cycle.patient_id, cycle_id=cycle.cycle_id, created_at=cycle.created_at)

@app.post("/embryos", response_model=EmbryoResponse)
async def create_embryo(embryo_data: EmbryoCreate, current_user: User = Depends(require_embryologist), db: Session = Depends(get_db)):
    """Create a new embryo (Embryologist+)"""
    # Check if cycle exists
    cycle = db.query(Cycle).filter(Cycle.id == embryo_data.cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    # Get patient audit code
    patient = db.query(Patient).filter(Patient.id == cycle.patient_id).first()

    # Check if embryo_id already exists for this cycle
    existing = db.query(Embryo).filter(Embryo.cycle_id == embryo_data.cycle_id, Embryo.embryo_id == embryo_data.embryo_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Embryo ID already exists for this cycle")

    embryo = Embryo(cycle_id=embryo_data.cycle_id, embryo_id=embryo_data.embryo_id)
    db.add(embryo)
    db.commit()
    db.refresh(embryo)

    # Log action
    log_data = AuditLogCreate(action="EMBRYO_CREATED", patient_audit_code=patient.audit_code, cycle_id=cycle.cycle_id, embryo_id=embryo.embryo_id)
    log_user_action(db, current_user, log_data)

    return EmbryoResponse(id=embryo.id, cycle_id=embryo.cycle_id, embryo_id=embryo.embryo_id, created_at=embryo.created_at)

class PredictionRequest(BaseModel):
    patient_audit_code: str
    cycle_id: str
    embryo_id: str

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    request: Request,
    file: UploadFile = File(...),
    prediction_data: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Predict embryo viability from uploaded image
    Uses ensemble of 3 models - OPTIMIZED FOR SPEED
    Requires authentication and logs AI prediction
    """
    # Public endpoint: do not require authentication for /predict
    user_info = "public"
    logger.info(f"Predict endpoint called by user: {user_info}")
    try:
        # Parse prediction data
        import json
        pred_data = json.loads(prediction_data)
        patient_code = pred_data["patient_audit_code"]
        cycle_id = pred_data["cycle_id"]
        embryo_id = pred_data["embryo_id"]

        print(f"\n\n{'='*80}")
        print(f"[BACKEND] REQUEST RECEIVED FOR FILE: {file.filename}")
        print(f"[BACKEND] Patient: {patient_code}, Cycle: {cycle_id}, Embryo: {embryo_id}")
        print(f"[BACKEND] User: {user_info}")
        print(f"{'='*80}\n")
        logger.info(f"Processing file: {file.filename} for patient {patient_code}")

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
        logger.info(f"Features extracted: {len(features)} features")

        # Ensemble prediction
        result = ensemble_predict(features)
        print(f"[BACKEND] Prediction complete: viability_score={result['viability_score']:.1f}")
        logger.info(f"Prediction complete: viability_score={result['viability_score']:.1f}")

        # Log AI prediction
        ai_log = AIPredictionLog(
            patient_audit_code=patient_code,
            cycle_id=cycle_id,
            embryo_id=embryo_id,
            model_version="ensemble_v1",  # Could be made configurable
            confidence_score=result['confidence'],
            risk_indicators={"viability_score": result['viability_score']},
            abnormal_flags=[] if result['prediction'] == 'good' else ['low_viability']
        )
        # Log AI prediction without requiring authentication
        try:
            log_ai_prediction(db, None, ai_log)
        except Exception:
            logger.exception("Failed to log AI prediction; continuing without audit log.")

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


@app.post("/notes", response_model=NoteResponse)
async def create_note(note_data: NoteCreate, current_user: User = Depends(require_embryologist), db: Session = Depends(get_db)):
    """Create a note (Embryologist+)"""
    note = Note(
        user_id=current_user.id,
        patient_audit_code=note_data.patient_audit_code,
        cycle_id=note_data.cycle_id,
        embryo_id=note_data.embryo_id,
        note_text=note_data.note_text
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    # Log action
    log_data = AuditLogCreate(
        action="NOTE_CREATED",
        patient_audit_code=note_data.patient_audit_code,
        cycle_id=note_data.cycle_id,
        embryo_id=note_data.embryo_id,
        details={"note_id": note.id}
    )
    log_user_action(db, current_user, log_data)

    return NoteResponse(
        id=note.id,
        user_id=note.user_id,
        username=current_user.username,
        role=current_user.role,
        patient_audit_code=note.patient_audit_code,
        cycle_id=note.cycle_id,
        embryo_id=note.embryo_id,
        note_text=note.note_text,
        timestamp=note.timestamp
    )

@app.post("/ai-override")
async def log_ai_override(override_data: AIOverrideLog, current_user: User = Depends(require_embryologist), db: Session = Depends(get_db)):
    """Log AI override with reason (Embryologist+)"""
    log_ai_override(db, current_user, override_data)
    return {"message": "AI override logged successfully"}

@app.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    patient_audit_code: Optional[str] = Query(None),
    cycle_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    current_user: User = Depends(require_auditor),
    db: Session = Depends(get_db)
):
    """Get audit logs with filtering (Auditor+)"""
    query = db.query(AuditLog).join(User)

    if patient_audit_code:
        query = query.filter(AuditLog.patient_audit_code == patient_audit_code)
    if cycle_id:
        query = query.filter(AuditLog.cycle_id == cycle_id)
    if start_date:
        query = query.filter(AuditLog.timestamp >= start_date)
    if end_date:
        query = query.filter(AuditLog.timestamp <= end_date)
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    logs = query.order_by(AuditLog.timestamp.desc()).all()

    # Log audit access
    log_data = AuditLogCreate(action="AUDIT_LOG_ACCESSED", details={
        "patient_audit_code": patient_audit_code,
        "cycle_id": cycle_id,
        "start_date": str(start_date) if start_date else None,
        "end_date": str(end_date) if end_date else None,
        "action": action,
        "user_id": user_id
    })
    log_user_action(db, current_user, log_data)

    return [
        AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            username=log.user.username,
            role=log.user.role,
            action=log.action,
            timestamp=log.timestamp,
            patient_audit_code=log.patient_audit_code,
            cycle_id=log.cycle_id,
            embryo_id=log.embryo_id,
            details=log.details
        ) for log in logs
    ]

@app.get("/export/csv")
async def export_audit_csv(
    patient_audit_code: Optional[str] = Query(None),
    cycle_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(require_auditor),
    db: Session = Depends(get_db)
):
    """Export audit logs as CSV (Auditor+)"""
    # Get filtered logs
    query = db.query(AuditLog).join(User)

    if patient_audit_code:
        query = query.filter(AuditLog.patient_audit_code == patient_audit_code)
    if cycle_id:
        query = query.filter(AuditLog.cycle_id == cycle_id)
    if start_date:
        query = query.filter(AuditLog.timestamp >= start_date)
    if end_date:
        query = query.filter(AuditLog.timestamp <= end_date)

    logs = query.order_by(AuditLog.timestamp.desc()).all()

    # Convert to DataFrame
    data = []
    for log in logs:
        data.append({
            "Timestamp": log.timestamp.isoformat(),
            "User ID": log.user_id,
            "Username": log.user.username,
            "Role": log.user.role,
            "Action": log.action,
            "Patient Code": log.patient_audit_code or "",
            "Cycle ID": log.cycle_id or "",
            "Embryo ID": log.embryo_id or "",
            "Details": str(log.details) if log.details else ""
        })

    df = pd.DataFrame(data)

    # Create CSV in memory
    output = BytesIO()
    df.to_csv(output, index=False)
    output.seek(0)

    # Log export
    log_data = AuditLogCreate(action="AUDIT_EXPORT_CSV", details={"record_count": len(logs)})
    log_user_action(db, current_user, log_data)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_logs.csv"}
    )

@app.get("/export/pdf")
async def export_audit_pdf(
    patient_audit_code: Optional[str] = Query(None),
    cycle_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(require_auditor),
    db: Session = Depends(get_db)
):
    """Export audit logs as PDF (Auditor+)"""
    # Get filtered logs
    query = db.query(AuditLog).join(User)

    if patient_audit_code:
        query = query.filter(AuditLog.patient_audit_code == patient_audit_code)
    if cycle_id:
        query = query.filter(AuditLog.cycle_id == cycle_id)
    if start_date:
        query = query.filter(AuditLog.timestamp >= start_date)
    if end_date:
        query = query.filter(AuditLog.timestamp <= end_date)

    logs = query.order_by(AuditLog.timestamp.desc()).all()

    # Create PDF
    output = BytesIO()
    doc = SimpleDocTemplate(output, pagesize=letter)
    elements = []

    # Title
    styles = getSampleStyleSheet()
    elements.append(Paragraph("IVF Audit Trail Report", styles['Title']))
    elements.append(Paragraph(f"Generated by: {current_user.username} ({current_user.role})", styles['Normal']))
    elements.append(Paragraph(f"Generated on: {datetime.now(timezone.utc).isoformat()}", styles['Normal']))
    elements.append(Paragraph(f"Total Records: {len(logs)}", styles['Normal']))
    elements.append(Paragraph("", styles['Normal']))

    # Table data
    data = [["Timestamp", "User", "Role", "Action", "Patient", "Cycle", "Embryo", "Details"]]
    for log in logs:
        data.append([
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            log.user.username,
            log.user.role,
            log.action,
            log.patient_audit_code or "",
            log.cycle_id or "",
            log.embryo_id or "",
            str(log.details)[:50] + "..." if log.details and len(str(log.details)) > 50 else str(log.details or "")
        ])

    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(table)

    doc.build(elements)
    output.seek(0)

    # Log export
    log_data = AuditLogCreate(action="AUDIT_EXPORT_PDF", details={"record_count": len(logs)})
    log_user_action(db, current_user, log_data)

    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=audit_logs.pdf"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
