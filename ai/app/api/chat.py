from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.core.rag_chain import ask_hr_question

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    job_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str

@router.post("/", response_model=ChatResponse)
async def chat_with_hr_bot(request: ChatRequest):
    answer = await ask_hr_question(
        question=request.message,
        job_id=request.job_id
    )
    return ChatResponse(answer=answer)
