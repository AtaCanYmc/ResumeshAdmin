from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config.settings import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL or "sqlite:///./test.db"

# Normalize postgres:// scheme
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

engine_kwargs = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    if SQLALCHEMY_DATABASE_URL.endswith(":memory:"):
        engine_kwargs["poolclass"] = StaticPool
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    engine_kwargs.update({"pool_pre_ping": True})

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
