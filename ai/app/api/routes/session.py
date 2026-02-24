from fastapi import APIRouter, HTTPException
from app.memory.mongo_memory import session_service

router = APIRouter()

@router.get("/sessions")
def get_sessions():
    return session_service.get_all_sessions()

@router.get("/sessions/{session_id}")
def get_session_history(session_id: str):
    return session_service.get_session_history(session_id)

@router.delete("/sessions/{session_id}")
def clear_session(session_id: str):
    success = session_service.clear_session_history(session_id)
    if success:
         return {"message": "Session history cleared"}
    raise HTTPException(status_code=404, detail="Session not found")
