import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import ResumeScoringSchema
from app.config.config import settings

def get_scoring_chain():
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0.1,
        max_output_tokens=8192
    )
    
    structured_llm = llm.with_structured_output(ResumeScoringSchema)
    
    prompt = PromptTemplate.from_template(
        """You are an expert HR recruiter evaluating a candidate for a specific job.
        
        Job Title: {job_title}
        Job Description & Requirements:
        {job_requirements}
        
        Candidate's Extracted Information (JSON format):
        {resume_json}
        
        Evaluate the candidate strictly against the job requirements. Provide scores (0 to 100) for Skills, Experience, and Education individually.
        For each score, provide a CONCISE reason in Thai language (maximum 2 sentences).
        Finally, provide an overall recommendation choosing exactly one of: 'Pass', 'Review', or 'Fail'.
        """
    )
    
    chain = prompt | structured_llm
    return chain

async def score_resume(job_title: str, job_requirements: str, resume_json: dict) -> dict:
    chain = get_scoring_chain()
    result_schema = await chain.ainvoke({
        "job_title": job_title,
        "job_requirements": job_requirements,
        "resume_json": json.dumps(resume_json)
    })
    return result_schema.model_dump()
