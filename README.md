# SamvidhanAI - AI-Powered Legal Intelligence System

SamvidhanAI is an advanced **Retrieval-Augmented Generation (RAG)** framework designed to demystify the Indian Justice System. It empowers legal professionals and citizens with precise, context-aware answers grounded in official statutory law.

> **Project Structure:**
> *   `server/`: The Python FastAPI Backend (Handled by Backend Team).
> *   `client/`: The Frontend Application (To be added by Frontend Team).

## 🚀 Key Features

### 1. Multi-Jurisdictional Regulatory Filtering
Intelligent routing of queries to specific legal domains (IT Law, Criminal Law, Corporate Law) ensures authoritative answers without cross-domain hallucinations.

### 2. The "Green-Yellow-Red" Confidence System
*   🟢 **Green Layer (Statutory Law):** Verified text directly from Acts (e.g., IT Act 2000).
*   🟡 **Yellow Layer (Case Law):** Relevant landmark Supreme Court/High Court judgments.
*   🔴 **Red Layer (AI Insights):** Pattern recognition and general legal observations (clearly marked as non-binding).

### 3. Verifiable Source Footnoting
Every claim is backed by click-through citations to the exact section of the Act, ensuring 100% traceability.

## 🛠️ Architecture

### Server (Your Workspace)
*   **Framework:** FastAPI (Python) - High-performance async API.
*   **RAG Engine:** LangChain + Vector Search (ChromaDB).
*   **Ingestion:** Custom PDF Parser -> Semantic Chunking -> Metadata Tagging.
*   **Embeddings:** OpenAI / Multilingual Sentence Transformers.

### Client (Collab Workspace)
*   **Status:** Reserved for Frontend Team implementation.

## 📂 Project Structure

```
SamvidhanAI/
├── server/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── routers/       # API Endpoints (Search, Summarize, Compare)
│   │   ├── services/      # RAG & Synthesis Logic
│   │   └── models/        # Pydantic Schemas
│   ├── data/              # Curated Legal Datasets (PDFs/Chunks)
│   ├── ingest.py          # ETL Pipeline for Legal Docs
│   └── main.py            # Server Entry Point
```

## 🚀 Getting Started

### Prerequisites
*   Python 3.10+
*   OpenAI API Key (for RAG Embeddings & Generation)

### Running the Server
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file with your GrokAI API Key
echo "XAI_API_KEY=xai-..." > .env

# Note: Embeddings are now handled LOCALLY via FastEmbed. 
# NO OpenAI Key is required anymore.

# Index the Data (Place PDFs in server/data/acts/...)
python3 ingest.py

# Start the API
uvicorn main:app --reload
```

## 📄 License
Private use only. Built for RUBIX'26.
