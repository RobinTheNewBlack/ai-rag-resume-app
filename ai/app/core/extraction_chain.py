from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import ResumeExtractionSchema
from app.config.config import settings
from app.core.prompt import extraction_prompt

MAX_RESUME_CHARS = 12000

def get_extraction_chain():
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0,
        max_output_tokens=8192
    )

    structured_llm = llm.with_structured_output(ResumeExtractionSchema)
    chain = extraction_prompt | structured_llm
    return chain

async def extract_resume_data(text: str) -> dict:
    # Truncate very long resumes to stay within model context limits
    if len(text) > MAX_RESUME_CHARS:
        text = text[:MAX_RESUME_CHARS]

    chain = get_extraction_chain()
    result_schema = await chain.ainvoke({"resume_text": text})
    data = result_schema.model_dump()

    # Normalize email to lowercase
    if data.get("email"):
        data["email"] = data["email"].lower().strip()

    # Deduplicate and clean skills list
    if data.get("skills"):
        seen = set()
        cleaned = []
        for skill in data["skills"]:
            normalized = skill.strip()
            if normalized and normalized.lower() not in seen:
                seen.add(normalized.lower())
                cleaned.append(normalized)
        data["skills"] = cleaned

    # Deduplicate certifications
    if data.get("certifications"):
        data["certifications"] = list(dict.fromkeys(c.strip() for c in data["certifications"] if c.strip()))

    return data
