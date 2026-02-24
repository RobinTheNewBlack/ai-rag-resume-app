import logging
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.services.document_parser import process_uploaded_document
from app.core.extraction_chain import extract_resume_data
from app.core.scoring_chain import score_resume
from app.core.summary_chain import summarize_resume
from app.core.design_chain import evaluate_resume_design
from app.core.rag_chain import add_resume_to_vector_store
from app.models.domain import Candidate, Job, CandidateScore, CandidateStatus

logger = logging.getLogger(__name__)

async def process_resume_pipeline(db: Session, job_id: int, file: UploadFile) -> Candidate:
    """
    Coordinates the execution of extracting, scoring, summarizing and storing a resume.
    """
    # 1. Fetch Job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise ValueError(f"Job with ID {job_id} not found")

    # 2. Extract Raw Text (Step 2)
    logger.info(f"Processing document {file.filename}")
    raw_text, file_path = process_uploaded_document(file)
    
    # 3. Extract JSON Data (Step 4)
    logger.info("Extracting structured JSON")
    extracted_data = await extract_resume_data(raw_text)
    
    name = extracted_data.get("name", "Unknown")
    email = extracted_data.get("email", "")
    phone = extracted_data.get("phone", "")

    # 4. Score against JD (Step 5)
    logger.info("Scoring resume against Job Description")
    score_result = await score_resume(
        job_title=job.title,
        job_requirements=job.requirements,
        resume_json=extracted_data
    )
    
    # 5. Evaluate Design (Vision)
    logger.info("Evaluating resume design")
    design_result = await evaluate_resume_design(file_path)
    s_design = design_result.get("score", 50.0)

    # Calculate weighted overall score
    s_skill = score_result["skill_evaluation"]["score"]
    s_exp = score_result["experience_evaluation"]["score"]
    s_edu = score_result["education_evaluation"]["score"]

    weighted_score = (
        (s_skill  * job.skill_weight) +
        (s_exp    * job.experience_weight) +
        (s_edu    * job.education_weight) +
        (s_design * job.design_weight)
    ) / 100.0

    recommendation = score_result["overall_recommendation"]

    # Map recommendation to Status
    status_map = {
        "Pass": CandidateStatus.SHORTLISTED,
        "Review": CandidateStatus.PENDING,
        "Fail": CandidateStatus.REJECTED
    }
    candidate_status = status_map.get(recommendation, CandidateStatus.PENDING)

    # 6. Summarize (Step 6)
    logger.info("Summarizing profile")
    summary_text = await summarize_resume(extracted_data)
    print("Summary:", summary_text)
    # 7. Save to DB (PostgreSQL)
    candidate = Candidate(
        job_id=job.id,
        name=name,
        email=email,
        phone=phone,
        extracted_data=extracted_data,
        summary=summary_text,
        status=candidate_status,
        resume_file_path=file_path
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Save Score
    reasoning = score_result.copy()
    reasoning["design_evaluation"] = design_result

    candidate_score = CandidateScore(
        candidate_id=candidate.id,
        skill_score=s_skill,
        experience_score=s_exp,
        education_score=s_edu,
        design_score=s_design,
        overall_score=weighted_score,
        reasoning=reasoning
    )
    db.add(candidate_score)
    
    # 8. Add to Vector Store (Chroma) for HR Q&A (Step 7)
    logger.info("Adding to Chroma Vector Store")
    metadata = {
        "candidate_id": candidate.id,
        "job_id": job.id,
        "name": name
    }
    await add_resume_to_vector_store(text=raw_text, metadata=metadata, candidate_id=candidate.id)
    
    # Update Vector ID in DB
    candidate.vector_id = f"candidate_{candidate.id}"
    db.commit()
    db.refresh(candidate)

    return candidate
