---
title: SamvidhanAI
emoji: ⚖️
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_port: 7860
---

# SamvidhanAI - AI-Powered Legal Intelligence System

SamvidhanAI is an advanced **Retrieval-Augmented Generation (RAG)** framework designed to demystify the Indian Justice System. It empowers legal professionals and citizens with precise, context-aware answers grounded in official statutory law.

> **Project Structure:**
> *   `server/`: The Python FastAPI Backend (Handled by Backend Team).
> *   `client/`: The Frontend Application (To be added by Frontend Team).

## 🚀 Key Features

### 1. Bilingual Statutory Querying
Enables users to submit queries in both **English and Hindi**, retrieving corresponding sections from the BNS and IPC with cross-linguistic accuracy using GrokAI.

### 2. Automated Case Law Cross-Referencing
Identifies and presents landmark **Supreme Court and High Court judgments** relevant to the specific legal sections retrieved during the query process.

### 3. Interactive Clause Comparison
Provides a seamless lookup to compare old **IPC sections** (e.g., Section 302) with their updated counterparts in the new **BNS** (e.g., Section 103), tracking legislative changes.

### 4. Multi-Jurisdictional Regulatory Filtering
Allows users to refine legal searches by specific domains, such as **Corporate Law, IT Acts, or Criminal Law**, ensuring domain-specific precision and reducing hallucinations.

### 5. Verifiable Source Footnoting
Generates precise, **clickable citations** for every statement in the AI's response, linking directly to the specific Act and Section to ensure 100% traceability.

### 6. Legal Document Summarization Tool
A utility to process uploaded legal documents (PDFs), extracting core arguments, verdicts, and key points using the advanced context window of **Grok-2**.

## 🐳 Docker Infrastructure
The project is fully dockerized with a microservices architecture:

1.  **`server`**: The FastAPI Backend (Python 3.10).
2.  **`chromadb`**: Vector Database (Chroma) running locally on port 8001.
    *   *Role:* persistent storage for Legal Embeddings.
    *   *No API Key Required*.
3.  **`postgres`**: Relational Database (PostgreSQL 15).

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
