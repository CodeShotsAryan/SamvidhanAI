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
        # Initialize connection (Environment aware)
        chroma_host = os.getenv("CHROMA_SERVER_HOST")
        chroma_port = os.getenv("CHROMA_SERVER_PORT", "8000")
        
        if chroma_host:
            self.client = chromadb.HttpClient(host=chroma_host, port=int(chroma_port))
        else:
            self.client = chromadb.PersistentClient(path=DB_DIR)
        
        # Initialize FastEmbed (Same as Ingest)
        try:
            from fastembed import TextEmbedding
            class FastEmbedFunction:
                def __init__(self):
                    self.model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
                def __call__(self, input: List[str]) -> List[List[float]]:
                    return [x.tolist() if hasattr(x, "tolist") else list(x) for x in self.model.embed(input)]

                def embed_query(self, input: str) -> List[float]:
                    # Handle potential list wrapping by Chroma
                    if isinstance(input, list):
                        res = list(self.model.embed(input))[0]
                    else:
                        res = list(self.model.embed([input]))[0]
                    
                    if hasattr(res, "tolist"):
                        res = res.tolist()
                    else:
                        res = list(res)
                    
                    # CAST TO FLOAT AND WRAP IN LIST (Batch of 1)
                    # Solves "float object cannot be converted to Sequence"
                    return [[float(x) for x in res]]
                def embed_documents(self, input: List[str]) -> List[List[float]]:
                    return [x.tolist() if hasattr(x, "tolist") else list(x) for x in self.model.embed(input)]
                def name(self):
                    return "fastembed_bge_small"
            self.embedding_fn = FastEmbedFunction()
        except ImportError:
            self.embedding_fn = None
        
        # Connect to the collection (Create if empty to avoid startup crash)
        self.collection = self.client.get_or_create_collection(
            name="legal_docs",
            embedding_function=self.embedding_fn
        )

    def retrieve_context(self, query: str, domain: str = None, n_results: int = 3) -> List[Dict]:
        """
        Retrieves relevant legal chunks.
        """
        where_filter = None  # ChromaDB requires None, not {}
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

    def generate_answer(self, query: str, context: List[Dict]) -> Dict[str, str]:
        """
        Uses GrokAI to synthesize the answer in Green-Yellow-Red format.
        """
        if not context:
            return {
                "green_layer": "No specific statutory law found in database.",
                "yellow_layer": "No related judgments found.",
                "red_layer": "Please consult a legal expert."
            }
            
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
        You are SamvidhanAI, an advanced Legal Intelligence System.
        Your output must be strictly structured into three distinct layers (Green, Yellow, Red).
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "green_layer": "Quote the exact Statutory Law / Act / Section from the context. Be precise.",
            "yellow_layer": "Mention relevant Case Laws or Judgments given in context or from your general knowledge if highly relevant.",
            "red_layer": "Provide a simplified, plain-English (or Hindi if asked) explanation and practical insight."
        }
        
        RULES:
        1. BILINGUAL: If query is Hindi, all layers must be Hindi.
        2. NO HALLUCINATION: If Green/Yellow details aren't in context, admit it.
        3. CITATIONS: Use section numbers explicitly.
        """
        
        try:
            from openai import OpenAI
            # Using GrokAI (Groq)
            # Documentation: https://console.groq.com/docs/openai
            client = OpenAI(
                api_key=os.getenv("GROQ_API_KEY"),
                base_url="https://api.groq.com/openai/v1"
            )
            
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile", # High performance model on Groq
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Query: {query}\n\nContext:\n{context_str}"}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            import json
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            return {
                "green_layer": "Error parsing statutory data.",
                "yellow_layer": "Error retrieving cases.",
                "red_layer": f"AI Generation Failed: {str(e)}"
            }

# Singleton instance
rag_service = RAGService()
