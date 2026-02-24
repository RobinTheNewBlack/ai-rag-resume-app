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
    degree: str = Field(description="Degree or qualification obtained (e.g. Bachelor's, Master's, PhD, Bootcamp Certificate)")
    field_of_study: Optional[str] = Field(default=None, description="Field or major (e.g. Computer Science, Business Administration)")
    institution: str = Field(description="Name of the university, school, or training provider")
    year: Optional[str] = Field(default=None, description="Graduation year or expected year (e.g. '2022' or '2022-06')")
    gpa: Optional[str] = Field(default=None, description="GPA or grade if explicitly stated (e.g. '3.8/4.0')")

class ExperienceSchema(BaseModel):
    position: str = Field(description="Job title or role (e.g. Software Engineer, Intern, Freelance Developer)")
    company: str = Field(description="Name of the employer or organization")
    start_date: Optional[str] = Field(default=None, description="Start date in ISO format when possible (e.g. '2020-01')")
    end_date: Optional[str] = Field(default=None, description="End date in ISO format or 'Present' if current (e.g. '2022-06' or 'Present')")
    duration: Optional[str] = Field(default=None, description="Human-readable duration if dates are not available (e.g. '2 years')")
    description: Optional[str] = Field(default=None, description="Key responsibilities and achievements in this role")
    technologies: List[str] = Field(default_factory=list, description="Technologies, tools, or frameworks used in this role")

class ResumeExtractionSchema(BaseModel):
    name: Optional[str] = Field(default=None, description="Full name of the candidate")
    email: Optional[str] = Field(default=None, description="Email address of the candidate")
    phone: Optional[str] = Field(default=None, description="Phone number of the candidate")
    linkedin: Optional[str] = Field(default=None, description="LinkedIn profile URL if present")
    location: Optional[str] = Field(default=None, description="City and/or country of the candidate (e.g. 'Bangkok, Thailand')")
    summary: Optional[str] = Field(default=None, description="Professional summary or objective statement if present")
    education: List[EducationSchema] = Field(default_factory=list, description="List of educational background, including certifications and bootcamps")
    experience: List[ExperienceSchema] = Field(default_factory=list, description="List of ALL work experiences including internships and part-time roles")
    skills: List[str] = Field(default_factory=list, description="List of technical and soft skills")
    languages: List[str] = Field(default_factory=list, description="List of spoken languages")
    certifications: List[str] = Field(default_factory=list, description="List of professional certifications or courses (e.g. 'AWS Certified Solutions Architect')")

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
