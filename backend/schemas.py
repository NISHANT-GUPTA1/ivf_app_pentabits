from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from datetime import datetime

# Auth schemas
class UserCreate(BaseModel):
    username: str
    password: str
    role: str  # Admin, Embryologist, Auditor

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime

# Patient schemas
class PatientCreate(BaseModel):
    audit_code: str

class PatientResponse(BaseModel):
    id: int
    audit_code: str
    created_at: datetime

# Cycle schemas
class CycleCreate(BaseModel):
    patient_id: int
    cycle_id: str

class CycleResponse(BaseModel):
    id: int
    patient_id: int
    cycle_id: str
    created_at: datetime

# Embryo schemas
class EmbryoCreate(BaseModel):
    cycle_id: int
    embryo_id: str

class EmbryoResponse(BaseModel):
    id: int
    cycle_id: int
    embryo_id: str
    created_at: datetime

# Audit log schemas
class AuditLogCreate(BaseModel):
    action: str
    patient_audit_code: Optional[str] = None
    cycle_id: Optional[str] = None
    embryo_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    username: str
    role: str
    action: str
    timestamp: datetime
    patient_audit_code: Optional[str] = None
    cycle_id: Optional[str] = None
    embryo_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

# Note schemas
class NoteCreate(BaseModel):
    patient_audit_code: Optional[str] = None
    cycle_id: Optional[str] = None
    embryo_id: Optional[str] = None
    note_text: str

class NoteResponse(BaseModel):
    id: int
    user_id: int
    username: str
    role: str
    patient_audit_code: Optional[str] = None
    cycle_id: Optional[str] = None
    embryo_id: Optional[str] = None
    note_text: str
    timestamp: datetime

# Search schemas
class AuditSearch(BaseModel):
    patient_audit_code: Optional[str] = None
    cycle_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    action: Optional[str] = None
    user_id: Optional[int] = None

# AI prediction logging
class AIPredictionLog(BaseModel):
    patient_audit_code: str
    cycle_id: str
    embryo_id: str
    model_version: str
    confidence_score: float
    risk_indicators: Optional[Dict[str, Any]] = None
    abnormal_flags: Optional[List[str]] = None

class AIOverrideLog(BaseModel):
    patient_audit_code: str
    cycle_id: str
    embryo_id: str
    original_prediction: str
    overridden_prediction: str
    reason: str