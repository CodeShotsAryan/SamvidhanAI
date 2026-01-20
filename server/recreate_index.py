import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(
    api_key="pcsk_6YQTwe_6LfpX2MihsDh7tcaAY6RpWgD1nxPybpRrVptvoeQno7nQF5wz3Z4Cm7RtxHHrmu"
)
index_name = "samvidhan"

print(f"Deleting old index '{index_name}'...")
try:
    pc.delete_index(index_name)
    print("Old index deleted!")
except Exception as e:
    print(f"Note: {e}")

print(f"Creating new index '{index_name}' with 768 dimensions...")
pc.create_index(
    name=index_name,
    dimension=768,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
)
print("SUCCESS! New index created with 768 dimensions for Google Gemini embeddings!")
