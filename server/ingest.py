import os
import re
from typing import List, Dict
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from dotenv import load_dotenv
from uuid import uuid4

# Load environment variables
load_dotenv()

# Check keys
print("Google API:", os.environ.get("GOOGLE_API_KEY"))
print("Pinecone API:", os.environ.get("PINECONE_API_KEY"))

# Define Paths
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")


def chunk_text_by_section(text: str, act_name: str, domain: str) -> List[Dict]:
    """
    Intelligent splitting by 'Section X' with size limits.
    """
    pattern = r"(Section\s+\d+[A-Z]*)"
    splits = re.split(pattern, text)
    chunks = []
    MAX_CHUNK_SIZE = 8000  # Keep well under 40KB metadata limit

    # Handle Preamble
    if splits[0].strip():
        preamble_text = splits[0].strip()[:MAX_CHUNK_SIZE]  # Truncate if too long
        chunks.append(
            {
                "text": preamble_text,
                "metadata": {"act": act_name, "section": "Preamble", "domain": domain},
            }
        )

    # Handle Sections
    for i in range(1, len(splits), 2):
        header = splits[i]
        body = splits[i + 1] if i + 1 < len(splits) else ""
        full_chunk = f"{header}\n{body}".strip()

        # Truncate if too long
        if len(full_chunk) > MAX_CHUNK_SIZE:
            full_chunk = full_chunk[:MAX_CHUNK_SIZE] + "... [truncated]"

        sec_num = header.replace("Section", "").strip()

        chunks.append(
            {
                "text": full_chunk,
                "metadata": {"act": act_name, "section": sec_num, "domain": domain},
            }
        )
    return chunks


def ingest_data():
    print("Starting SamvidhanAI Data Ingestion with Pinecone...")

    # Initialize Pinecone
    pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
    index_name = os.environ.get("PINECONE_INDEX", "samvidhan")
    index = pc.Index(index_name)

    # Initialize embeddings with Google Gemini (768 dimensions)
    print("Initializing Google Gemini embeddings...")
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=os.environ.get("GOOGLE_API_KEY"),
        task_type="retrieval_document",
        max_retries=1,
    )  # Initialize vector store
    vector_store = PineconeVectorStore(embedding=embeddings, index=index)

    domain_map = {
        "acts/it_law": "IT_LAW",
        "acts/criminal_law": "CRIMINAL_LAW",
        "acts/corporate_law": "CORPORATE_LAW",
        "policies": "POLICY",
        "cases": "CASE_LAW",
    }

    all_documents = []

    for subfolder, domain in domain_map.items():
        folder_path = os.path.join(DATA_DIR, subfolder)
        if not os.path.exists(folder_path):
            print(f"Folder not found: {folder_path}, skipping...")
            continue

        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)

            if filename.endswith(".pdf"):
                print(f"Processing PDF {filename} ({domain})...")

                # Load PDF using LangChain
                loader = PyPDFLoader(file_path)
                documents = loader.load()

                # Combine all pages into one text
                raw_text = "\n".join([doc.page_content for doc in documents])

                # Chunk by sections
                file_chunks = chunk_text_by_section(raw_text, filename, domain)

                for chunk in file_chunks:
                    # Create LangChain Document with metadata
                    from langchain_core.documents import Document

                    doc = Document(
                        page_content=chunk["text"], metadata=chunk["metadata"]
                    )
                    all_documents.append(doc)

            elif filename.endswith(".txt"):
                print(f"Processing TXT {filename} ({domain})...")
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        raw_text = f.read()

                    file_chunks = chunk_text_by_section(raw_text, filename, domain)

                    for chunk in file_chunks:
                        from langchain_core.documents import Document

                        doc = Document(
                            page_content=chunk["text"], metadata=chunk["metadata"]
                        )
                        all_documents.append(doc)
                except Exception as e:
                    print(f"Error reading {filename}: {e}")

    if all_documents:
        print(f"\nTotal chunks to upload: {len(all_documents)}")

        # Generate UUIDs for each chunk
        uuids = [str(uuid4()) for _ in range(len(all_documents))]

        # Upload chunks to Pinecone with Mistral embeddings
        print("Uploading to Pinecone...")
        vector_store.add_documents(documents=all_documents, ids=uuids)

        print(
            "SUCCESS: All chunks + metadata + embeddings uploaded to Pinecone successfully!"
        )
    else:
        print("No PDF/TXT data found. Please add files to 'server/data/acts/...'")


if __name__ == "__main__":
    try:
        ingest_data()
    except Exception as e:
        print(f"Ingestion Failed: {e}")
        import traceback

        traceback.print_exc()
