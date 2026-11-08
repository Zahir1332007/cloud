import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.seed import seed_database
from app.api.v1 import auth, products, categories, orders, stats, health

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("cloudstore")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context:
    Initializes database tables and executes seed script if database is fresh.
    """
    logger.info("Initializing database schema on startup...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified.")
        seed_database()
    except Exception as e:
        logger.error(f"Error during database startup initialization: {e}")
    yield
    logger.info("Shutting down CloudStore API...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## CloudStore E-Commerce Enterprise API
    
    API REST de nivel de producción diseñada para despliegue de alta disponibilidad en AWS (EC2 Free Tier, ECS o App Runner).
    
    ### Características principales:
    * **Autenticación Segura**: JWT (JSON Web Tokens) y cifrado Bcrypt.
    * **Catálogo & Inventario**: Búsquedas avanzadas, filtros por categoría/precio, control de stock concurrente.
    * **Órdenes & Checkout**: Transacciones atómicas seguras en base de datos PostgreSQL.
    * **Métricas Administrativas**: Endpoint de estadísticas de ventas y control de inventario.
    * **Cloud-Ready**: Endpoint `/health` compatible con AWS ALB y Route 53.
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for academic/demo AWS deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health & AWS Monitoring"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Autenticación & Usuarios"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["Productos & Catálogo"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["Categorías"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["Órdenes & Checkout"])
app.include_router(stats.router, prefix=f"{settings.API_V1_STR}/stats", tags=["Métricas de Administración"])


@app.get("/", tags=["Root"])
def root_redirect():
    """Welcome root endpoint."""
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "status": "online"
    }

