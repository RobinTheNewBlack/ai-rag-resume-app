from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

# ---------------------------------------------------------------------------
# RAG chain (session-based, used by app/api/routes/chat.py)
# ---------------------------------------------------------------------------

contextualize_q_system_prompt = (
    "Given a chat history and the latest user question "
    "which might reference context in the chat history, "
    "formulate a standalone question which can be understood "
    "without the chat history. Do NOT answer the question, "
    "just reformulate it if needed and otherwise return it as is."
)
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
    ]
)

system_prompt = (
    "You are an assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise."
    "\n\n"
    "{context}"
)
qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
    ]
)

# ---------------------------------------------------------------------------
# HR Q&A RAG chain (Chroma-based, used by app/api/chat.py)
# ---------------------------------------------------------------------------

rag_prompt = PromptTemplate.from_template(
    """You are an AI assistant for Human Resources. You are helping to answer questions about job candidates based on their resumes.
    Use the following pieces of retrieved context to answer the question.
    If you don't know the answer, just say that you don't know.
    Always mention the candidate's name when you find a match.

    Context:
    {context}

    Question: {question}

    Answer:"""
)

# ---------------------------------------------------------------------------
# Extraction chain
# ---------------------------------------------------------------------------

extraction_prompt = PromptTemplate.from_template(
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

# ---------------------------------------------------------------------------
# Scoring chain
# ---------------------------------------------------------------------------

scoring_prompt = PromptTemplate.from_template(
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

# ---------------------------------------------------------------------------
# Summary chain
# ---------------------------------------------------------------------------

summary_prompt = PromptTemplate.from_template(
    """You are an expert HR assistant. Read the candidate's extracted information and write a detailed, human-readable summary about their profile in 8-10 sentences.
        Focus on their core strengths, most relevant experience, and any notable observations that an HR recruiter should know at a glance.
        Do not use bullet points, just write a fluent paragraph. Write in Thai.

        Candidate Information:
        {resume_json}

        Summary:"""
)

# ---------------------------------------------------------------------------
# Design chain
# ---------------------------------------------------------------------------

DESIGN_PROMPT_TEXT = """You are an expert HR Professional and ATS (Applicant Tracking System) Specialist.
        Task: Evaluate the attached resume for professionalism and ATS-friendliness.
        Scoring Guidelines (0-100):
        - High Score: Simple, clean, single-column layout, standard text-based skills, and high readability for both humans and machines.
        - Low Score: 'Fantasy' or over-designed resumes with graphics, photos, complex multi-column layouts, and visual 'skill bars' or 'energy bars'
        Provide a score from 0 to 100.
        Provide a CONCISE reason in Thai language (maximum 2 sentences)."""
