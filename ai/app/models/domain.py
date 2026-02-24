import datetime
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, JSON, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class CandidateStatus(str, enum.Enum):
    PENDING = "Pending"
    SHORTLISTED = "Shortlisted"
    REJECTED = "Rejected"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    
    # Weights for scoring (must sum to 100)
    skill_weight = Column(Integer, default=45)
    experience_weight = Column(Integer, default=30)
    education_weight = Column(Integer, default=15)
    design_weight = Column(Integer, default=10)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    # Basic extracted info
    name = Column(String(255), index=True)
    email = Column(String(255), index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    
    # Store complete extracted JSON from LLM
    extracted_data = Column(JSON, nullable=True)
    
    # 3-5 sentence summary from LLM
    summary = Column(Text, nullable=True)
    
    status = Column(Enum(CandidateStatus, native_enum=False, length=50), default=CandidateStatus.PENDING)
    hr_note = Column(Text, nullable=True)
    
    # Local path to saved PDF
    resume_file_path = Column(String(500), nullable=True)
    
    # Vector store reference (usually candidate_{id})
    vector_id = Column(String(255), unique=True, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    job = relationship("Job", back_populates="candidates")
    score = relationship("CandidateScore", back_populates="candidate", uselist=False, cascade="all, delete-orphan")

class CandidateScore(Base):
    __tablename__ = "candidate_scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), unique=True, nullable=False)
    
    skill_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    design_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    
    # Reasoning from LLM
    reasoning = Column(JSON, nullable=True)
    
    candidate = relationship("Candidate", back_populates="score")
