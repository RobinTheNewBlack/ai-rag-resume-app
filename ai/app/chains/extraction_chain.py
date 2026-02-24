import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import ResumeExtractionSchema
from app.config.config import settings

def get_extraction_chain():
    # Inizialize Gemini Model that supports structured output
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0.1,
        max_tokens=2048
    )
    
    # Use LangChain's structured output capability
    structured_llm = llm.with_structured_output(ResumeExtractionSchema)
    
    prompt = PromptTemplate.from_template(
        """You are an expert HR assistant. Extact exactly the requested fields from the following resume text.
        If a field is not found in the text, leave it empty or omit it depending on the schema requirements.
        
        Resume Text:
        {resume_text}
        """
    )
    
    # Create the extraction chain
    chain = prompt | structured_llm
    
    return chain

async def extract_resume_data(text: str) -> dict:
    chain = get_extraction_chain()
    # It returns a Pydantic model
    result_schema = await chain.ainvoke({"resume_text": text})
    return result_schema.model_dump()
