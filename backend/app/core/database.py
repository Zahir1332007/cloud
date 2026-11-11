import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)


def create_db_engine():
    """Attempts to connect to PostgreSQL. If unavailable (e.g. native local dev), falls back to SQLite."""
    if "sqlite" in database_url:
        return create_engine(database_url, connect_args={"check_same_thread": False})
    
    safe_target = database_url.split("@")[-1]
    try:
        eng = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 5},
        )
        # Test connection with a short timeout
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Conectado exitosamente a PostgreSQL: {safe_target}")
        return eng
    except Exception as e:
        logger.warning(
            f"PostgreSQL no está activo en {safe_target}. "
            f"Activando base de datos SQLite ({settings.SQLITE_FALLBACK_URL}) para desarrollo local sin Docker: {e}"
        )
        return create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False}
        )


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


