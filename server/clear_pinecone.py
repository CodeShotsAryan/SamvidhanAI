import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

# Initialize Pinecone
pc = Pinecone(
    api_key="pcsk_6YQTwe_6LfpX2MihsDh7tcaAY6RpWgD1nxPybpRrVptvoeQno7nQF5wz3Z4Cm7RtxHHrmu"
)
index_name = "samvidhan"
index = pc.Index(index_name)

# Delete all vectors
print(f"Deleting all vectors from index '{index_name}'...")
index.delete(delete_all=True)
print("✅ All vectors deleted! Index is now empty and ready for fresh data.")
