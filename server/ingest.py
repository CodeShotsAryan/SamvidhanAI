import os
import re
from typing import List, Dict
from pypdf import PdfReader
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

# Load environment variables (expecting OPENAI_API_KEY)
load_dotenv()

# Define Paths
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_DIR = os.path.join(BASE_DIR, "chroma_db")

# Initialize Chroma Client
# Check if running in Docker mode
CHROMA_HOST = os.getenv("CHROMA_SERVER_HOST")
CHROMA_PORT = os.getenv("CHROMA_SERVER_PORT", "8000")

if CHROMA_HOST:
    print(f"Connecting to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}...")
    client = chromadb.HttpClient(host=CHROMA_HOST, port=int(CHROMA_PORT))
else:
    # Local Persistence
    print("Using Local ChromaDB Persistence...")
    client = chromadb.PersistentClient(path=DB_DIR)

# Use FastEmbed (Local, Lightweight, No GPU/Key needed)
# This solves the "Only Grok Key" constraint by handling embeddings locally without Torch.
try:
    from fastembed import TextEmbedding
    
    class FastEmbedFunction:
        def __init__(self):
            self.model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
            
        def __call__(self, input: List[str]) -> List[List[float]]:
            return [x.tolist() if hasattr(x, "tolist") else list(x) for x in self.model.embed(input)]

        def embed_documents(self, input: List[str]) -> List[List[float]]:
            return [x.tolist() if hasattr(x, "tolist") else list(x) for x in self.model.embed(input)]


        def name(self):
            return "fastembed_bge_small" # Required by ChromaDB validation
            
    embedding_fn = FastEmbedFunction()
    
except ImportError:
    print("FastEmbed not found. Please run: pip install fastembed")
    embedding_fn = None # Will crash if run, but warns user

def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def chunk_text_by_section(text: str, act_name: str, domain: str) -> List[Dict]:
    """
    Intelligent splitting by 'Section X'.
    """
    pattern = r"(Section\s+\d+[A-Z]*)"
    splits = re.split(pattern, text)
    chunks = []
    
    # Handle Preamble
    if splits[0].strip():
        chunks.append({
            "text": splits[0].strip(),
            "metadata": {"act": act_name, "section": "Preamble", "domain": domain}
        })
    
    # Handle Sections
    for i in range(1, len(splits), 2):
        header = splits[i]
        body = splits[i+1] if i+1 < len(splits) else ""
        full_chunk = f"{header}\n{body}".strip()
        sec_num = header.replace("Section", "").strip()
        
        chunks.append({
            "text": full_chunk,
            "metadata": {"act": act_name, "section": sec_num, "domain": domain}
        })
    return chunks

def ingest_data():
    print("Starting SamvidhanAI Data Ingestion...")
    
    # Collection Name: legal_docs
    collection = client.get_or_create_collection(
        name="legal_docs",
        embedding_function=embedding_fn
    )
    
    domain_map = {
        "acts/it_law": "IT_LAW",
        "acts/criminal_law": "CRIMINAL_LAW",
        "acts/corporate_law": "CORPORATE_LAW",
        "policies": "POLICY",
        "cases": "CASE_LAW"
    }
    
    total_chunks = 0
    ids = []
    documents = []
    metadatas = []
    
    for subfolder, domain in domain_map.items():
        folder_path = os.path.join(DATA_DIR, subfolder)
        if not os.path.exists(folder_path):
            continue
            
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            raw_text = ""
            
            if filename.endswith(".pdf"):
                print(f"Processing PDF {filename} ({domain})...")
                raw_text = extract_text_from_pdf(file_path)
            elif filename.endswith(".txt"):
                print(f"Processing TXT {filename} ({domain})...")
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        raw_text = f.read()
                except Exception as e:
                    print(f"Error reading {filename}: {e}")
            
            if not raw_text: continue
            
            file_chunks = chunk_text_by_section(raw_text, filename, domain)
            
            for idx, chunk in enumerate(file_chunks):
                # Unique ID: filename_section_idx
                    doc_id = f"{filename}_{chunk['metadata']['section']}_{idx}"
                    
                    ids.append(doc_id)
                    documents.append(chunk["text"])
                    metadatas.append(chunk["metadata"])
                    total_chunks += 1

    if documents:
        print(f"Upserting {len(documents)} chunks into ChromaDB...")
        # Batching for stability
        batch_size = 50
        for i in range(0, len(documents), batch_size):
            collection.upsert(
                ids=ids[i:i+batch_size],
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size]
            )
        print("Ingestion Complete.")
    else:
        print("No PDF data found. Please add PDFs to 'server/data/acts/...'")

if __name__ == "__main__":
    try:
        ingest_data()
    except Exception as e:
        print(f"Ingestion Failed: {e}")
        print("Ensure OPENAI_API_KEY is set in .env")
