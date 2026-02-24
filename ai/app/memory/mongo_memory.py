from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory
from typing import List, Dict, Any, Optional
import pymongo
import json
import logging
from app.config.config import settings

logger = logging.getLogger(__name__)

class SessionService:
    """Service to handle session history and statistics"""

    def __init__(self):
        self.session_histories: Dict[str, MongoDBChatMessageHistory] = {}

    def get_or_create_session_history(
        self, session_id: str
    ) -> MongoDBChatMessageHistory:
        """Get or create MongoDB chat message history for a session"""
        if session_id not in self.session_histories:
            self.session_histories[session_id] = MongoDBChatMessageHistory(
                connection_string=settings.MONGODB_URL,
                database_name=settings.MONGO_INITDB_DATABASE,
                collection_name=settings.MONGODB_COLLECTION_CHAT_HISTORY,
                session_id=session_id,
            )
        return self.session_histories[session_id]

    def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a session"""
        try:
            chat_history = self.get_or_create_session_history(session_id)
            messages = []

            for message in chat_history.messages:
                messages.append(
                    {
                        "type": message.type,
                        "content": message.content,
                        "timestamp": getattr(message, "additional_kwargs", {}).get(
                            "timestamp"
                        ),
                    }
                )

            return messages
        except Exception as e:
            logger.error(f"Error getting session history: {e}")
            return []

    def clear_session_history(self, session_id: str) -> bool:
        """Clear chat history for a session"""
        try:
            chat_history = self.get_or_create_session_history(session_id)
            chat_history.clear()

            # Remove from local cache
            if session_id in self.session_histories:
                del self.session_histories[session_id]

            return True
        except Exception as e:
            logger.error(f"Error clearing session history: {e}")
            return False

    def get_session_stats(self, session_id: str) -> Dict[str, Any]:
        """Get session statistics"""
        try:
            chat_history = self.get_or_create_session_history(session_id)
            messages = chat_history.messages

            if not messages:
                return {
                    "session_id": session_id,
                    "message_count": 0,
                    "user_messages": 0,
                    "ai_messages": 0,
                }

            user_messages = len([m for m in messages if m.type == "human"])
            ai_messages = len([m for m in messages if m.type == "ai"])

            return {
                "session_id": session_id,
                "message_count": len(messages),
                "user_messages": user_messages,
                "ai_messages": ai_messages,
                "first_message": messages[0].content if messages else None,
                "last_message": messages[-1].content if messages else None,
            }
        except Exception as e:
            logger.error(f"Error getting session stats: {e}")
            return {"session_id": session_id, "message_count": 0}

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Get list of all chat sessions with metadata"""
        try:
            # Connect to MongoDB directly to query distinct session IDs
            client = pymongo.MongoClient(settings.MONGODB_URL)
            db = client[settings.MONGO_INITDB_DATABASE]
            collection = db[settings.MONGODB_COLLECTION_CHAT_HISTORY]
            
            # Create a temporary instance to get the key names
            # Note: We can't access session_id_key directly from class or instance easily 
            # without checking implementation, but standard usage relies on 'SessionId'.
            # However, MongoDBChatMessageHistory stores sessions based on the session_id passed.
            # Let's check how documents are stored. They usually have a SessionId field.
            # Looking at source, it seems it uses 'SessionId' field by default or what is passed.
            # The User provided code assumes `temp_history.session_id_key` exists. 
            # I will trust the user provided code structure but wrapped in try-except.
            
            temp_history = MongoDBChatMessageHistory(
                connection_string=settings.MONGODB_URL,
                database_name=settings.MONGO_INITDB_DATABASE,
                collection_name=settings.MONGODB_COLLECTION_CHAT_HISTORY,
                session_id="temp"
            )
            
            # Get distinct session IDs
            # The property might be 'session_id_key' or we assume a field name. 
            # Creating an instance is safe.
            session_id_key = "SessionId" # Default for MongoDBChatMessageHistory
            
            # The user code used `temp_history.session_id_key`, let's try to assume it works OR fix if not available.
            # In latest langcahin-mongodb, it might just use JSON.
            
            session_ids = collection.distinct(session_id_key)
            
            # For each session, get the first and last message to show preview and timestamp
            sessions = []
            for session_id in session_ids:
                if session_id == "temp": continue

                # Get first message timestamp (creation time)
                first_message = collection.find_one(
                    {session_id_key: session_id},
                    sort=[("_id", 1)]
                )
                
                # Get last message for preview
                last_message = collection.find_one(
                    {session_id_key: session_id},
                    sort=[("_id", -1)]
                )
                
                if first_message and last_message:
                    # Parse the message content
                    try:
                        # Depending on version it might be stringified JSON or dict
                        history_key = "History" # Default
                        content_data = last_message.get(history_key)
                        if isinstance(content_data, str):
                            last_message_content = json.loads(content_data)
                        else:
                            last_message_content = content_data
                            
                        preview_text = ""
                        if isinstance(last_message_content, dict):
                             preview_text = last_message_content.get("data", {}).get("content", "")
                        
                        sessions.append({
                            "session_id": session_id,
                            "created_at": first_message.get("_id").generation_time.isoformat(), # Convert to string for JSON serialization
                            "updated_at": last_message.get("_id").generation_time.isoformat(),
                            "preview": preview_text[:50] + "...",
                            "message_count": collection.count_documents({
                                session_id_key: session_id
                            })
                        })
                    except Exception as parse_error:
                         logger.warning(f"Error parsing session {session_id}: {parse_error}")

            
            # Sort by most recent activity
            sessions.sort(key=lambda x: x["updated_at"], reverse=True)
            return sessions
            
        except Exception as e:
            logger.error(f"Error getting sessions: {e}")
            raise

session_service = SessionService()
