from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.rag_chain import get_rag_chain

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: str

class ChatResponse(BaseModel):
    answer: str
    session_id: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        rag_chain = get_rag_chain()
        if not rag_chain:
             raise HTTPException(status_code=400, detail="Vector store not initialized. Please upload a document first.")
        
        response = rag_chain.invoke(
            {"input": request.query},
            config={"configurable": {"session_id": request.session_id}}
        )
        
        return ChatResponse(answer=response, session_id=request.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
