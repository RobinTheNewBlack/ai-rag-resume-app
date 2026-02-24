from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config.config import settings
from app.core.prompt import summary_prompt

def get_summary_chain():
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0.3,
        max_output_tokens=8192
    )

    chain = summary_prompt | llm | StrOutputParser()
    return chain

async def summarize_resume(resume_json: dict) -> str:
    chain = get_summary_chain()
    summary = await chain.ainvoke({"resume_json": str(resume_json)})
    return summary
