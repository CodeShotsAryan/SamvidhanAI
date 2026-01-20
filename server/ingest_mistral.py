"""
Complete ingestion script for legal documents using Mistral embeddings.
Processes all PDFs in server/data/acts/ and uploads to Pinecone with proper metadata.
"""

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_mistralai import MistralAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from dotenv import load_dotenv
from uuid import uuid4
import os
import glob

load_dotenv()

# Verify API keys
print("[*] Checking API Keys...")
mistral_key = os.environ.get("MISTRAL_API_KEY")
pinecone_key = os.environ.get("PINECONE_API_KEY")

if not mistral_key:
    raise ValueError("[!] MISTRAL_API_KEY not found in .env")
if not pinecone_key:
    raise ValueError("[!] PINECONE_API_KEY not found in .env")

print(f"[+] Mistral API Key: {mistral_key[:10]}...")
print(f"[+] Pinecone API Key: {pinecone_key[:10]}...")

# Initialize Mistral embeddings (1024 dimensions)
print("\n[*] Initializing Mistral Embeddings...")
embeddings = MistralAIEmbeddings(model="mistral-embed", mistral_api_key=mistral_key)

# Initialize Pinecone
print("[*] Connecting to Pinecone...")
pc = Pinecone(api_key=pinecone_key)
index_name = os.environ.get("PINECONE_INDEX", "samvidhan")
index = pc.Index(index_name)

# Create vector store
vector_store = PineconeVectorStore(embedding=embeddings, index=index)

# Text splitter configuration (matching your Gita project)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=900, chunk_overlap=10, separators=["\n\n", "\n", " ", ""]
)

# Find all PDF files
pdf_pattern = "./data/acts/**/*.pdf"
pdf_files = glob.glob(pdf_pattern, recursive=True)

if not pdf_files:
    print(f"[!] No PDF files found matching pattern: {pdf_pattern}")
    exit(1)

print(f"\n[*] Found {len(pdf_files)} PDF files to process:")
for pdf in pdf_files:
    print(f"  - {pdf}")

# Process each PDF
total_chunks = 0
all_documents = []

for pdf_path in pdf_files:
    print(f"\n[*] Processing: {pdf_path}")

    # Extract metadata from path
    # Example: ./data/acts/criminal_law/Bharatiya Nyaya Sanhita.pdf
    parts = pdf_path.replace("\\", "/").split("/")
    domain = parts[-2] if len(parts) >= 2 else "general"
    filename = parts[-1].replace(".pdf", "")

    # Map domain to user-friendly names
    domain_map = {
        "criminal_law": "Criminal Law",
        "corporate_law": "Corporate & Commercial Law",
        "it_law": "Cyber & IT Law",
    }
    domain_name = domain_map.get(domain, domain.replace("_", " ").title())

    try:
        # Load PDF
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()

        # Split into chunks
        chunks = text_splitter.split_documents(documents)

        # Add metadata to each chunk
        for i, chunk in enumerate(chunks):
            chunk.metadata.update(
                {
                    "act": filename,
                    "domain": domain_name,
                    "source_file": pdf_path,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                }
            )

            # Try to extract section number from content
            content_lower = chunk.page_content.lower()
            if "section" in content_lower:
                # Simple extraction - can be improved
                import re

                section_match = re.search(r"section\s+(\d+[a-z]?)", content_lower)
                if section_match:
                    chunk.metadata["section"] = section_match.group(1)

        all_documents.extend(chunks)
        total_chunks += len(chunks)
        print(f"  [+] Created {len(chunks)} chunks from {filename}")

    except Exception as e:
        print(f"  [!] Error processing {pdf_path}: {str(e)}")
        continue

print(f"\n[*] Total chunks created: {total_chunks}")

if total_chunks == 0:
    print("[!] No chunks to upload. Exiting.")
    exit(1)

# Generate UUIDs for each chunk
print("\n[*] Generating UUIDs...")
uuids = [str(uuid4()) for _ in range(len(all_documents))]

# Upload to Pinecone in batches
print("\n[*] Uploading to Pinecone...")
batch_size = 100
for i in range(0, len(all_documents), batch_size):
    batch_docs = all_documents[i : i + batch_size]
    batch_ids = uuids[i : i + batch_size]

    try:
        vector_store.add_documents(documents=batch_docs, ids=batch_ids)
        print(
            f"  [+] Uploaded batch {i // batch_size + 1}/{(len(all_documents) - 1) // batch_size + 1}"
        )
    except Exception as e:
        print(f"  [!] Error uploading batch: {str(e)}")

# Verify upload
print("\n[*] Verifying upload...")
stats = index.describe_index_stats()
print(f"  [+] Total vectors in Pinecone: {stats.total_vector_count}")
print(f"  [+] Expected vectors: {total_chunks}")

if stats.total_vector_count >= total_chunks:
    print("\n[+] All chunks + metadata + embeddings uploaded successfully!")
else:
    print(
        f"\n[!] Warning: Expected {total_chunks} vectors but found {stats.total_vector_count}"
    )

print("\n[+] Ingestion complete!")
