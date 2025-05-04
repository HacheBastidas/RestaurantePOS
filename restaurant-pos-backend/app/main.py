from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .users.router import router as users_router
from .products.router import router as products_router
from .orders.router import router as orders_router
from .tables.router import router as tables_router

app = FastAPI(
    title=settings.app_name,
    description="API para sistema POS de restaurantes",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, deberías limitar esto a tu dominio frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])
app.include_router(tables_router, prefix="/api/tables", tags=["Tables"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Bienvenido a la API del Restaurant POS"}