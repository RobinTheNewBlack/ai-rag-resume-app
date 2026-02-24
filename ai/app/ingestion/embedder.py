from langchain_huggingface import HuggingFaceEmbeddings
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def get_embedder():
    """
    Get the embedding model.
    """
    try:
        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': False}
        logger.info(f"Loading embedding model: {model_name}")
        embedder = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        logger.info("Embedding model loaded successfully")
        return embedder
    except Exception as e:
        logger.error(f"Error loading embedder: {e}")
        raise HTTPException(status_code=500, detail=str(e))
