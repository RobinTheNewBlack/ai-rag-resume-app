from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from typing import List
import os
from app.ingestion.embedder import get_embedder
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

INDEX_PATH = "faiss_index"

def get_vector_store():
    try:
        embedder = get_embedder()
        if os.path.exists(INDEX_PATH):
            return FAISS.load_local(INDEX_PATH, embedder, allow_dangerous_deserialization=True)
        return None
    except Exception as e:
        logger.error(f"Error getting vector store: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def create_vector_store(documents: List[Document]):
    try:
        embedder = get_embedder()
        vector_store = FAISS.from_documents(documents, embedder)
        vector_store.save_local(INDEX_PATH)
        return vector_store
    except Exception as e:
        logger.error(f"Error creating vector store: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def add_documents_to_vector_store(documents: List[Document]):
    try:
        vector_store = get_vector_store()
        if vector_store:
            vector_store.add_documents(documents)
            vector_store.save_local(INDEX_PATH)
        else:
            create_vector_store(documents)
    except Exception as e:
        logger.error(f"Error adding documents to vector store: {e}")
        raise HTTPException(status_code=500, detail=str(e))
