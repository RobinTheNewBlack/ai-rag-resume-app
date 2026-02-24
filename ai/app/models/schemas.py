from pydantic import BaseModel, Field
from typing import List, Optional, Any

# API Schemas (Pydantic BaseModels)
class JobBase(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    skill_weight: int = 50
    experience_weight: int = 30
    education_weight: int = 20

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    class Config:
        from_attributes = True

# LLM Output Schemas used with LangChain
class EducationSchema(BaseModel):
    degree: str
    institution: str
    year: Optional[str] = None

class ExperienceSchema(BaseModel):
    position: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None

class ResumeExtractionSchema(BaseModel):
    name: Optional[str] = Field(description="Full name of the candidate")
    email: Optional[str] = Field(description="Email address of the candidate")
    phone: Optional[str] = Field(description="Phone number of the candidate")
    education: List[EducationSchema] = Field(description="List of educational background", default_factory=list)
    experience: List[ExperienceSchema] = Field(description="List of past work experiences", default_factory=list)
    skills: List[str] = Field(description="List of technical and soft skills", default_factory=list)
    languages: List[str] = Field(description="List of spoken languages", default_factory=list)

class SkillEvaluation(BaseModel):
    score: float = Field(description="Score out of 100")
    reason: str = Field(description="Reason for giving this score (maximum 2 sentences)")

class CandidateStatusUpdate(BaseModel):
    status: str

class ResumeScoringSchema(BaseModel):
    skill_evaluation: SkillEvaluation = Field(description="Evaluation of candidate skills vs JD requirements")
    experience_evaluation: SkillEvaluation = Field(description="Evaluation of candidate work experience vs JD requirements")
    education_evaluation: SkillEvaluation = Field(description="Evaluation of candidate education vs JD requirements")
    overall_recommendation: str = Field(description="Pass / Review / Fail status recommendation")
