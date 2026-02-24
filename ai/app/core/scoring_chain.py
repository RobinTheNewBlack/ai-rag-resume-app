import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import ResumeScoringSchema
from app.config.config import settings
from app.core.prompt import scoring_prompt

def get_scoring_chain():
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0.1,
        max_output_tokens=8192
    )

    structured_llm = llm.with_structured_output(ResumeScoringSchema)
    chain = scoring_prompt | structured_llm
    return chain

async def score_resume(job_title: str, job_requirements: str, resume_json: dict) -> dict:
    chain = get_scoring_chain()
    result_schema = await chain.ainvoke({
        "job_title": job_title,
        "job_requirements": job_requirements,
        "resume_json": json.dumps(resume_json)
    })
    return result_schema.model_dump()
