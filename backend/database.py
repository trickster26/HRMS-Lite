from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# Get DATABASE_URL from environment variable (Railway provides this)
# Railway often names it MYSQL_URL for MySQL services
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL") or "sqlite:///./hrms.db"

# Handle "mysql://" to "mysql+pymysql://" fix for SQLAlchemy if needed
if SQLALCHEMY_DATABASE_URL.startswith("mysql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("mysql://", "mysql+pymysql://")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # check_same_thread is strictly for SQLite, so we remove it conditionally or just don't pass if not needed.
    # For simplicity in this hybrid setup:
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
