import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.analyze import router as analyze_router
from api.v1.analyze_full import router as analyze_full_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Product Discovery Platform",
    version="1.0.0",
    description="AI-powered customer feedback analysis and product opportunity prioritization"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8081",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_router)
app.include_router(analyze_full_router)

@app.get("/")
async def root():
    return {"status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    logger.info("AI Product Discovery Platform started successfully")