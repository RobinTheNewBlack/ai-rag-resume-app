from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import ResumeExtractionSchema
from app.config.config import settings

MAX_RESUME_CHARS = 12000

def get_extraction_chain():
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0,
        max_output_tokens=8192
    )

    structured_llm = llm.with_structured_output(ResumeExtractionSchema)

    prompt = PromptTemplate.from_template(
        """You are an expert HR data extraction assistant. Extract ALL requested fields from the resume below.

        Follow these rules strictly:
        - name/email/phone/linkedin/location: extract exactly as written; do not guess if not present
        - summary: copy the professional summary or objective section verbatim if it exists
        - skills: include technical skills (Python, SQL, Docker etc.); extract every skill mentioned anywhere in the resume
        - experience: extract EVERY role including internships, part-time, freelance, and contract jobs; for dates use ISO format "YYYY-MM" when possible, use "Present" for current roles; list technologies used per role
        - education: include university degrees, diplomas, bootcamps, and online courses; extract GPA only if explicitly stated
        - certifications: list standalone certifications and professional courses separately from education (e.g. AWS Certified, Google Analytics)
        - languages: include all spoken/written languages mentioned
        - If a field is not present in the resume, return null or an empty list — do NOT invent or infer data

        Resume Text:
        {resume_text}
        """
    )

    chain = prompt | structured_llm
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
