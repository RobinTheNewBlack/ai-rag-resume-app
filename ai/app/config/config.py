from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Optional

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    MONGO_INITDB_ROOT_USERNAME: Optional[str] = None
    MONGO_INITDB_ROOT_PASSWORD: Optional[str] = None
    MONGO_INITDB_DATABASE: str = "ai_rag_db"
    MONGODB_HOST: str = "localhost"
    MONGODB_PORT: int = 27017
    MONGODB_COLLECTION_CHAT_HISTORY: str = "chat_histories"
    MONGODB_URL: Optional[str] = None
    LOG_LEVEL: str = "INFO"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200    
    GEMINI_MODEL: str = "gemini-1.5-pro"
    DATABASE_URL: Optional[str] = None

    # If there are extra variables in .env that aren't defined in this class, 
    # they will be ignored instead of causing an error
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # validatoe method that runs after the fields are loaded.
    @model_validator(mode="after")
    def compute_mongodb_url(self):
        # if MONGODB_URL is not provided, compute it from the other fields
        if not self.MONGODB_URL:
            self.MONGODB_URL = (
                f"mongodb://{self.MONGO_INITDB_ROOT_USERNAME}:{self.MONGO_INITDB_ROOT_PASSWORD}"
                f"@{self.MONGODB_HOST}:{self.MONGODB_PORT}/{self.MONGO_INITDB_DATABASE}?authSource=admin"
            )
        # If present, It uses the one provided in .env file
        return self

settings = Settings()
