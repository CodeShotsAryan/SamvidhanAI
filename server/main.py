from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import search, summarize, compare, auth, conversations, chat, speech
from app.database import engine, Base, SessionLocal
from app.models.conversation import LegalDomain

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SamvidhanAI Server",
    description="Advanced RAG Framework for Indian Legal Code",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_legal_domains():
    db = SessionLocal()
    try:
        existing = db.query(LegalDomain).first()
        if existing:
            print("✅ Legal domains already seeded")
            return

        domains = [
            {
                "name": "Criminal Law",
                "description": "IPC, BNS, and criminal procedure codes",
                "icon": "Gavel",
            },
            {
                "name": "Corporate & Commercial Law",
                "description": "Companies Act, contracts, and business regulations",
                "icon": "Building2",
            },
            {
                "name": "Cyber & IT Law",
                "description": "Information Technology Act and cyber regulations",
                "icon": "Globe",
            },
            {
                "name": "Constitutional Law",
                "description": "Indian Constitution and fundamental rights",
                "icon": "Book",
            },
            {
                "name": "Civil Law",
                "description": "Civil procedure, property, and family law",
                "icon": "Scale",
            },
            {
                "name": "Environmental Law",
                "description": "Environmental protection and regulations",
                "icon": "Globe",
            },
            {
                "name": "Labour & Employment Law",
                "description": "Labor laws, employment rights, and workplace regulations",
                "icon": "Briefcase",
            },
            {
                "name": "Taxation Law",
                "description": "Income tax, GST, and tax regulations",
                "icon": "FileText",
            },
        ]

        for domain_data in domains:
            domain = LegalDomain(**domain_data)
            db.add(domain)

        db.commit()
        print(f"✅ Successfully seeded {len(domains)} legal domains!")
    except Exception as e:
        print(f"❌ Error seeding domains: {e}")
        db.rollback()
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "SamvidhanAI Server is running. RAG System Ready with Pinecone."}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(search.router)
app.include_router(summarize.router)
app.include_router(compare.router)
app.include_router(auth.router)
app.include_router(conversations.router)
app.include_router(chat.router)
app.include_router(speech.router)
