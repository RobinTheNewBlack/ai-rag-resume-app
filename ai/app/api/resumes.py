from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.resume_pipeline import process_resume_pipeline
from app.models.domain import Candidate, CandidateScore, Job, CandidateStatus
from app.models.schemas import CandidateStatusUpdate
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload")
async def upload_resume(
    job_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        candidate = await process_resume_pipeline(db, job_id, file)
        return {
            "status": "success",
            "candidate_id": candidate.id,
            "name": candidate.name,
            "message": "Resume uploaded and processed successfully"
        }
    except ValueError as e:
        logger.error(f"Value Error during processing: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing resume: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/candidates")
def get_candidates(job_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Candidate).join(CandidateScore)
    if job_id:
        query = query.filter(Candidate.job_id == job_id)
    
    candidates = query.all()
    # Build custom response
    result = []
    for c in candidates:
        result.append({
            "id": c.id,
            "job_id": c.job_id,
            "job_title": c.job.title,
            "name": c.name,
            "email": c.email,
            "status": c.status.value,
            "summary": c.summary,
            "overall_score": c.score.overall_score if c.score else 0,
            "created_at": c.created_at
        })
        
    # Sort by overall score descending
    result.sort(key=lambda x: x["overall_score"], reverse=True)
    return result

@router.get("/candidates/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    return {
        "id": candidate.id,
        "job_id": candidate.job_id,
        "name": candidate.name,
        "email": candidate.email,
        "phone": candidate.phone,
        "status": candidate.status.value,
        "summary": candidate.summary,
        "resume_file_path": candidate.resume_file_path,
        "extracted_data": candidate.extracted_data,
        "score": {
            "skill_score": candidate.score.skill_score,
            "experience_score": candidate.score.experience_score,
            "education_score": candidate.score.education_score,
            "overall_score": candidate.score.overall_score,
            "reasoning": candidate.score.reasoning
        } if candidate.score else None
    }

import os
from fastapi.responses import FileResponse
from app.chains.rag_chain import get_vector_store

@router.patch("/candidates/{candidate_id}/status")
def update_candidate_status(candidate_id: int, body: CandidateStatusUpdate, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    try:
        candidate.status = CandidateStatus(body.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")
    db.commit()
    return {"status": "success", "candidate_id": candidate_id, "new_status": candidate.status.value}

@router.delete("/candidates/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 1. Delete PDF file from disk
    if candidate.resume_file_path:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        file_path = os.path.join(base_dir, candidate.resume_file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")

    # 2. Delete from Chroma vector store
    if candidate.vector_id:
        try:
            vector_store = get_vector_store()
            vector_store.delete(ids=[candidate.vector_id])
            logger.info(f"Deleted vector: {candidate.vector_id}")
        except Exception as e:
            logger.warning(f"Could not delete vector {candidate.vector_id}: {e}")

    # 3. Delete from DB (CandidateScore cascades automatically)
    db.delete(candidate)
    db.commit()

    return {"status": "success", "deleted_id": candidate_id}

@router.get("/download/{candidate_id}")
def download_resume(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate or not candidate.resume_file_path:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Construct absolute path safely
    base_dir = os.path.dirname(os.path.dirname(__file__)) # points to app/
    file_path = os.path.join(base_dir, candidate.resume_file_path)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    filename = os.path.basename(file_path)
    return FileResponse(
        path=file_path, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )
