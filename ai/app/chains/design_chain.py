import io
import os
import fitz # PyMuPDF
from PIL import Image
import base64
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import SkillEvaluation
from app.config.config import settings

def get_design_chain():
    # Use a vision-capable model
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0.1,
        max_output_tokens=2048
    )
    
    structured_llm = llm.with_structured_output(SkillEvaluation)
    return structured_llm

def encode_image(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode('utf-8')

async def evaluate_resume_design(pdf_path: str) -> dict:
    try:
        # Resolve relative path to absolute (relative paths are relative to ai/app/)
        if not os.path.isabs(pdf_path):
            app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            pdf_path = os.path.join(app_dir, pdf_path)

        # 1. Convert First Page of PDF to Image
        doc = fitz.open(pdf_path)
        if len(doc) == 0:
            return {"score": 50, "reason": "ไม่สามารถแปลงไฟล์ PDF เป็นรูปภาพเพื่อประเมินได้"}
            
        page = doc.load_page(0)
        zoom = 2.0 # Increase resolution
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert to PNG bytes
        img_bytes = pix.tobytes("png")
        base64_image = encode_image(img_bytes)
        
        # 2. Prompt Gemini
        prompt_text = """You are an expert HR Professional and ATS (Applicant Tracking System) Specialist. 
        Task: Evaluate the attached resume for professionalism and ATS-friendliness.
        Scoring Guidelines (0-100):
        - High Score: Simple, clean, single-column layout, standard text-based skills, and high readability for both humans and machines.
        - Low Score: 'Fantasy' or over-designed resumes with graphics, photos, complex multi-column layouts, and visual 'skill bars' or 'energy bars'
        Provide a score from 0 to 100.
        Provide a CONCISE reason in Thai language (maximum 2 sentences)."""
        
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt_text},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{base64_image}"}
                }
            ]
        )
        
        # 3. Call model
        chain = get_design_chain()
        result = await chain.ainvoke([message])
        return result.model_dump()
        
    except Exception as e:
        import logging
        import traceback
        logger = logging.getLogger(__name__)
        logger.error(f"Design evaluation failed: {e}\n{traceback.format_exc()}")
        return {"score": 50, "reason": "เกิดข้อผิดพลาดในการประเมินความสวยงามของเรซูเม่"}
