from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_core.documents import Document
from app.config.config import settings
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def split_documents(documents: List[Document]) -> List[Document]:
    """
    Split documents into smaller chunks.
    """
    try:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            is_separator_regex=False,
        )
        chunks = text_splitter.split_documents(documents)   
        logger.info(f"Split {len(documents)} documents into {len(chunks)} chunks")
        return chunks
    except Exception as e:
        logger.error(f"Error splitting documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))
