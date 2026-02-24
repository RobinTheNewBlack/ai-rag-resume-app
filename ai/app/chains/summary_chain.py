from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config.config import settings

def get_summary_chain():
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0.3,
        max_tokens=2048
    )

    prompt = PromptTemplate.from_template(
        """You are an expert HR assistant. Read the candidate's extracted information and write a detailed, human-readable summary about their profile in 8-10 sentences.
        Focus on their core strengths, most relevant experience, and any notable observations that an HR recruiter should know at a glance.
        Do not use bullet points, just write a fluent paragraph. Write in Thai.
        
        Candidate Information:
        {resume_json}
        
        Summary:"""
    )
    
    chain = prompt | llm | StrOutputParser()
    return chain

async def summarize_resume(resume_json: dict) -> str:
    chain = get_summary_chain()
    summary = await chain.ainvoke({"resume_json": str(resume_json)})
    return summary
