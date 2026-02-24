from langchain_community.document_loaders import PyPDFLoader
from typing import List
from langchain_core.documents import Document
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def load_pdf(file_path: str) -> List[Document]:
    """
    Load a PDF file and return a list of documents.
    """
    try:
        logger.info(f"Loading PDF from {file_path}")
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        logger.info(f"Loaded {len(documents)} documents from {file_path}")
        return documents
    except Exception as e:
        logger.error(f"Error loading PDF from {file_path}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
