import os
import uuid
import shutil
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from fastapi import UploadFile

# Define the local storage directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_uploaded_document(file: UploadFile) -> tuple[str, str]:
    """
    Saves an uploaded file to a local directory permanently, extracts its text using 
    LangChain loaders (PyPDFLoader or Docx2txtLoader), and returns the raw string and the saved file path.
    """
    # Create a unique filename
    suffix = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{suffix}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file permanently
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        if suffix == ".pdf":
            loader = PyPDFLoader(file_path)
            pages = loader.load()
        elif suffix in [".doc", ".docx"]:
            loader = Docx2txtLoader(file_path)
            pages = loader.load()
        else:
            raise ValueError(f"Unsupported file format: {suffix}")
        
        # Combine text from all pages
        full_text = "\n\n".join([page.page_content for page in pages])
        
        # Return both the text and the relative path we'll store in the DB
        relative_path = os.path.join("uploads", "resumes", unique_filename).replace("\\", "/")
        return full_text, relative_path
        
    except Exception as e:
        # Avoid leaving orphaned files if parsing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise e
