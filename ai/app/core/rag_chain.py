from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from app.vector_store.faiss_store import get_vector_store
from app.config.config import settings
from app.memory.mongo_memory import session_service
from app.core.prompt import contextualize_q_prompt, qa_prompt

def get_rag_chain():
    """
    Create and return the RAG chain with history.
    """
    vector_store = get_vector_store()
    if not vector_store:
        return None

    retriever = vector_store.as_retriever()
    
    llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=settings.GOOGLE_API_KEY)

    contextualize_q_chain = contextualize_q_prompt | llm | StrOutputParser()

    def contextualized_question(input: dict):
        if input.get("chat_history"):
            return contextualize_q_chain
        else:
            return input["input"]

    rag_chain = (
        RunnablePassthrough.assign(
            context=contextualized_question | retriever
        )
        | qa_prompt
        | llm
        | StrOutputParser()
    )

    rag_chain_with_history = RunnableWithMessageHistory(
        rag_chain,
        get_session_history=session_service.get_or_create_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )

    return rag_chain_with_history
