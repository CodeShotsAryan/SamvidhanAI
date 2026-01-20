
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os
import time

load_dotenv()

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index_name = os.environ.get("PINECONE_INDEX", "samvidhan")

print(f"[*] Checking if index '{index_name}' exists...")

if index_name in pc.list_indexes().names():
    print(f"[!] Index '{index_name}' exists. Deleting old data...")
    pc.delete_index(index_name)
    print("[+] Old index deleted successfully")
    time.sleep(5)

print(f"\n[*] Creating new index '{index_name}' with 1024 dimensions (Mistral)...")
pc.create_index(
    name=index_name,
    dimension=1024,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
)

print("[*] Waiting for index to be ready...")
while not pc.describe_index(index_name).status["ready"]:
    time.sleep(1)

print(f"\n[+] Index '{index_name}' created successfully!")
print(f"[+] Dimension: 1024 (Mistral)")
print(f"[+] Metric: cosine")
print("\n[+] Ready for ingestion with Mistral embeddings!")
