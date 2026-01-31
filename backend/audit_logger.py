from sqlalchemy.orm import Session
from typing import Optional
from models import AuditLog, User
from schemas import AuditLogCreate, AIPredictionLog, AIOverrideLog
from datetime import datetime

def log_user_action(db: Session, user: Optional[User], log_data: AuditLogCreate):
    """Log a user action to the audit trail. `user` may be None for anonymous events."""
    user_id = user.id if user else None
    audit_log = AuditLog(
        user_id=user_id,
        action=log_data.action,
        patient_audit_code=log_data.patient_audit_code,
        cycle_id=log_data.cycle_id,
        embryo_id=log_data.embryo_id,
        details=log_data.details
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log

def log_ai_prediction(db: Session, user: Optional[User], ai_log: AIPredictionLog):
    """Log AI prediction event"""
    details = {
        "model_version": ai_log.model_version,
        "confidence_score": ai_log.confidence_score,
        "risk_indicators": ai_log.risk_indicators,
        "abnormal_flags": ai_log.abnormal_flags,
        "event_type": "ai_prediction"
    }
    log_data = AuditLogCreate(
        action="AI_PREDICTION",
        patient_audit_code=ai_log.patient_audit_code,
        cycle_id=ai_log.cycle_id,
        embryo_id=ai_log.embryo_id,
        details=details
    )
    return log_user_action(db, user, log_data)

def log_ai_override(db: Session, user: Optional[User], override_log: AIOverrideLog):
    """Log AI override event"""
    details = {
        "original_prediction": override_log.original_prediction,
        "overridden_prediction": override_log.overridden_prediction,
        "reason": override_log.reason,
        "event_type": "ai_override"
    }
    log_data = AuditLogCreate(
        action="AI_OVERRIDE",
        patient_audit_code=override_log.patient_audit_code,
        cycle_id=override_log.cycle_id,
        embryo_id=override_log.embryo_id,
        details=details
    )
    return log_user_action(db, user, log_data)

def log_login(db: Session, user: Optional[User]):
    """Log user login"""
    log_data = AuditLogCreate(
        action="LOGIN",
        details={"event_type": "login"}
    )
    return log_user_action(db, user, log_data)

def log_logout(db: Session, user: Optional[User]):
    """Log user logout"""
    log_data = AuditLogCreate(
        action="LOGOUT",
        details={"event_type": "logout"}
    )
    return log_user_action(db, user, log_data)

def log_prediction_viewed(db: Session, user: Optional[User], patient_code: str, cycle_id: str, embryo_id: str):
    """Log when AI prediction is viewed"""
    log_data = AuditLogCreate(
        action="PREDICTION_VIEWED",
        patient_audit_code=patient_code,
        cycle_id=cycle_id,
        embryo_id=embryo_id,
        details={"event_type": "prediction_viewed"}
    )
    return log_user_action(db, user, log_data)