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

# Initialize Chroma Client with persistence
# This creates a folder 'chroma_db' in the server directory
client = chromadb.PersistentClient(path=DB_DIR)

# Use OpenAI Embeddings
# We use a try-except or default because if the user hasn't set the key, it will crash.
# For the demo, we assume the key is present in .env
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENAI_API_KEY", ""),
    model_name="text-embedding-3-small"
)

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
        embedding_function=openai_ef
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
            if filename.endswith(".pdf"):
                print(f"Processing {filename} ({domain})...")
                file_path = os.path.join(folder_path, filename)
                raw_text = extract_text_from_pdf(file_path)
                
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
