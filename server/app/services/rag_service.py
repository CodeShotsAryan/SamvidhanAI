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
        
        # Initialize FastEmbed (Same as Ingest)
        try:
            from fastembed import TextEmbedding
            class FastEmbedFunction:
                def __init__(self):
                    self.model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
                def __call__(self, input: List[str]) -> List[List[float]]:
                    return list(self.model.embed(input))
            self.embedding_fn = FastEmbedFunction()
        except ImportError:
            self.embedding_fn = None
        
        # Connect to the collection
        self.collection = self.client.get_collection(
            name="legal_docs",
            embedding_function=self.embedding_fn
        )

    def retrieve_context(self, query: str, domain: str = None, n_results: int = 3) -> List[Dict]:
        """
        Retrieves relevant legal chunks.
        """
        where_filter = {}
        if domain:
            where_filter = {"domain": domain}
            
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter
        )
        
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

    def find_related_cases(self, query: str) -> List[str]:
        """
        Feature 2: Automated Case Law Cross-Referencing.
        Specifically searches the 'CASE_LAW' domain.
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=2, # Top 2 relevant cases
            where={"domain": "CASE_LAW"}
        )
        
        cases = []
        if results['metadatas']:
            for meta in results['metadatas'][0]:
                # Assuming filename or act metadata holds the Case Name
                case_name = meta.get('act', 'Unknown Judgment')
                if case_name not in cases:
                    cases.append(case_name)
        return cases

    def generate_answer(self, query: str, context: List[Dict]) -> str:
        """
        Uses GrokAI to synthesize the answer.
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
        
        Feature Requirements:
        1. BILINGUAL: If the user asks in Hindi, YOU MUST ANSWER IN HINDI. If English, answer in English.
        2. CITATIONS: Use the provided context to cite Sections explicitly.
        3. TONE: Professional and authoritative.
        
        User Query: {query}
        
        Retrieved Legal Context:
        {context_str}
        
        Answer:
        """
        
        try:
            from openai import OpenAI
            # Using GrokAI (xAI)
            client = OpenAI(
                api_key=os.getenv("XAI_API_KEY"),
                base_url="https://api.x.ai/v1"
            )
            
            response = client.chat.completions.create(
                model="grok-2-latest", 
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Query: {query}"}
                ],
                temperature=0.1 
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating Answer with GrokAI: {str(e)}"

# Singleton instance
rag_service = RAGService()
