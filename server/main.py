from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import search, summarize, compare

app = FastAPI(
    title="SamvidhanAI Server",
    description="Advanced RAG Framework for Indian Legal Code",
    version="1.0.0"
)

# CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SamvidhanAI Server is running. RAG System Ready."}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Include routers
app.include_router(search.router)
app.include_router(summarize.router)
app.include_router(compare.router)
