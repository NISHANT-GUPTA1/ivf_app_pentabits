from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Admin, Embryologist, Auditor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    audit_code = Column(String, unique=True, index=True, nullable=False)  # Anonymized code
    created_at = Column(DateTime, default=datetime.utcnow)

    cycles = relationship("Cycle", back_populates="patient")

class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    cycle_id = Column(String, nullable=False)  # Unique per patient
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="cycles")

class Embryo(Base):
    __tablename__ = "embryos"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("cycles.id"), nullable=False)
    embryo_id = Column(String, nullable=False)  # Unique per cycle
    created_at = Column(DateTime, default=datetime.utcnow)

    cycle = relationship("Cycle")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    patient_audit_code = Column(String, nullable=True)
    cycle_id = Column(String, nullable=True)
    embryo_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)  # For AI events, overrides, etc.

    user = relationship("User")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_audit_code = Column(String, nullable=True)
    cycle_id = Column(String, nullable=True)
    embryo_id = Column(String, nullable=True)
    note_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    # Note: These are not foreign keys to avoid coupling, just string references