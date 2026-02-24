from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from app.ingestion.loader import load_pdf
from app.ingestion.splitter import split_documents
from app.vector_store.faiss_store import add_documents_to_vector_store

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        documents = load_pdf(temp_file_path)
        chunks = split_documents(documents)
        add_documents_to_vector_store(chunks)

        os.remove(temp_file_path)

        return {"message": "File processed and added to vector store", "chunks": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
