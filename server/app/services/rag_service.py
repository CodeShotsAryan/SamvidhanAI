import os
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__))) # server directory
DB_DIR = os.path.join(BASE_DIR, "chroma_db")

class RAGService:
    def __init__(self):
        # Initialize connection to the persistent DB created by ingest.py
        self.client = chromadb.PersistentClient(path=DB_DIR)
        
        self.openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=os.getenv("OPENAI_API_KEY", ""),
            model_name="text-embedding-3-small"
        )
        
        # Connect to the collection
        self.collection = self.client.get_collection(
            name="legal_docs",
            embedding_function=self.openai_ef
        )

    def retrieve_context(self, query: str, domain: str = None, n_results: int = 3) -> List[Dict]:
        """
        Retrieves relevant legal chunks based on query and domain filter.
        """
        where_filter = {}
        if domain:
            where_filter = {"domain": domain}
            
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter
        )
        
        # Parse Chroma results into a cleaner format
        # results['documents'][0] is the list of docs for the first query
        citations = []
        if results['documents']:
            docs = results['documents'][0]
            metas = results['metadatas'][0]
            
            for i in range(len(docs)):
                citations.append({
                    "text": docs[i],
                    "metadata": metas[i]
                })
                
        return citations

    def generate_answer(self, query: str, context: List[Dict]) -> str:
        """
        Uses an LLM (OpenAI/Gemini) to synthesize the answer.
        Placeholder implementation for now using formatted string.
        Real implementation would call client.chat.completions.create
        """
        if not context:
            return "I could not find any specific legal sections related to your query in the database."
            
        # Construct Prompt
        context_str = ""
        for item in context:
            meta = item['metadata']
            context_str += f"Source: {meta['act']} (Section {meta['section']})\nContent: {item['text']}\n\n"
            
        prompt = f"""
        You are SamvidhanAI, an expert Indian Legal Assistant.
        Answer the user's question based ONLY on the following legal context.
        If the answer is not in the context, say "I don't have enough information."
        
        Context:
        {context_str}
        
        User Question: {query}
        
        Answer:
        """
        
        # In a real app, we would make the API call here.
        # For this stage, we return the prompt to prove the RAG pipeline constructed it.
        # return call_llm(prompt) 
        
        return f"[Simulated LLM Output based on {len(context)} retrieved chunks]\n\nBased on {context[0]['metadata']['act']}, Section {context[0]['metadata']['section']}..."

# Singleton instance
rag_service = RAGService()
