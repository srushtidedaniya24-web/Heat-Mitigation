import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import unquote

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASE_URL = unquote(DATABASE_URL)

engine = create_engine(DATABASE_URL) if DATABASE_URL else None

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
) if engine else None
