from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import analytics, auth, journal, compat


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Journal API",
    description="AI-powered journal and mood analytics API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(analytics.router)
app.include_router(compat.router)


@app.get("/")
def root():
    return {
        "message": "Smart Journal API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }