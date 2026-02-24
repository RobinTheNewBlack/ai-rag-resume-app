import chromadb
import os

# Using persistent client instead of ephemeral
CHROMA_DB_DIR = os.path.join(os.getcwd(), "chroma_data")
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

def get_chroma_client():
    return chroma_client

def get_collection(collection_name: str = "resumes"):
    return chroma_client.get_or_create_collection(name=collection_name)
