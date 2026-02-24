from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.vector_store import get_chroma_client
from app.config.config import settings

def get_vector_store():
    # Setup embeddings model
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Initialize Chroma connected to our persistent client
    vector_store = Chroma(
        client=get_chroma_client(),
        collection_name="resumes",
        embedding_function=embeddings,
    )
    return vector_store

async def add_resume_to_vector_store(text: str, metadata: dict, candidate_id: int):
    vector_store = get_vector_store()
    
    # Using candidate_id as the document ID ensures we don't duplicate
    vector_store.add_texts(
        texts=[text],
        metadatas=[metadata],
        ids=[f"candidate_{candidate_id}"]
    )

def get_rag_chain(job_id: int = None):
    vector_store = get_vector_store()
    
    # Optional metadata filtering by job_id if we only want to ask about candidates for a specific job
    search_kwargs = {"k": 5}
    if job_id:
        search_kwargs["filter"] = {"job_id": job_id}
        
    retriever = vector_store.as_retriever(search_kwargs=search_kwargs)
    
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=0.1
    )
    
    template = """You are an AI assistant for Human Resources. You are helping to answer questions about job candidates based on their resumes.
    Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer, just say that you don't know. 
    Always mention the candidate's name when you find a match.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:"""
    
    prompt = PromptTemplate.from_template(template)
    
    def format_docs(docs):
        # Format the retrieved docs to show candidate name from metadata alongside text
        formatted = []
        for d in docs:
            name = d.metadata.get('name', 'Unknown Candidate')
            formatted.append(f"[Candidate: {name}]\n{d.page_content}")
        return "\n\n".join(formatted)
        
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain

async def ask_hr_question(question: str, job_id: int = None) -> str:
    chain = get_rag_chain(job_id)
    response = await chain.ainvoke(question)
    return response
