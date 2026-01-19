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
        Uses OpenAI to synthesize the answer based on the retrieved context.
        """
        if not context:
            return "I could not find any specific legal sections related to your query in the database. Please consult a lawyer for more details."
            
        # Construct Context Block
        context_str = ""
        for item in context:
            meta = item['metadata']
            context_str += f"""
            [Source: {meta.get('act', 'Unknown Act')} | Section: {meta.get('section', 'N/A')}]
            {item['text']}
            --------------------------------------------------
            """
            
        system_prompt = """
        You are SamvidhanAI, a highly accurate Indian Legal Assistant.
        Your goal is to answer queries using ONLY the provided Legal Context.
        
        Rules:
        1. CITATIONS: When using information from a specific section, cite it explicitly (e.g., "According to Section 43A of the IT Act...").
        2. STRICTNESS: Do not invent laws. If the context doesn't mention something, say you don't know.
        3. TONE: Professional, authoritative, yet accessible to citizens.
        4. STRUCTURE: Use bullet points for clarity.
        """
        
        user_message = f"""
        User Query: {query}
        
        Retrieved Legal Context:
        {context_str}
        
        Please provide a comprehensive answer based on the above context.
        """
        
        try:
            from openai import OpenAI
            # Using GrokAI (xAI)
            # Documentation: https://docs.x.ai/docs
            client = OpenAI(
                api_key=os.getenv("XAI_API_KEY"),
                base_url="https://api.x.ai/v1"
            )
            
            response = client.chat.completions.create(
                model="grok-2-latest", 
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.1 
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating Answer with GrokAI: {str(e)}"

# Singleton instance
rag_service = RAGService()
