import os
from typing import List, Dict
from langchain_mistralai import MistralAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain_community.chat_message_histories import ChatMessageHistory
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


class RAGService:
    def __init__(self):
        # Initialize Pinecone
        pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        index_name = os.environ.get("PINECONE_INDEX", "samvidhan")
        self.index = pc.Index(index_name)

        # Initialize embeddings
        self.embeddings = MistralAIEmbeddings(model="mistral-embed")

        # Initialize vector store
        self.vector_store = PineconeVectorStore(
            index=self.index, embedding=self.embeddings
        )

        # Initialize Groq for LLM
        self.chat = Groq(api_key=os.environ.get("GROQ_API_KEY"))

        # Chat history management (per session)
        self.chat_histories = {}

    def get_chat_history(self, session_id: str = "default") -> ChatMessageHistory:
        """Get or create chat history for a session"""
        if session_id not in self.chat_histories:
            self.chat_histories[session_id] = ChatMessageHistory()
        return self.chat_histories[session_id]

    def clear_chat_history(self, session_id: str = "default"):
        """Clear chat history for a session"""
        if session_id in self.chat_histories:
            self.chat_histories[session_id].clear()

    def retrieve_context(
        self, query: str, domain: str = None, n_results: int = 3
    ) -> List[Dict]:
        """
        Retrieves relevant legal chunks from Pinecone.
        """
        # Perform similarity search
        if domain:
            # Filter by domain metadata
            results = self.vector_store.similarity_search(
                query, k=n_results, filter={"domain": domain}
            )
        else:
            results = self.vector_store.similarity_search(query, k=n_results)

        # Format results
        citations = []
        for doc in results:
            citations.append({"text": doc.page_content, "metadata": doc.metadata})
        return citations

    def find_related_cases(self, query: str) -> List[str]:
        """
        Feature 2: Automated Case Law Cross-Referencing.
        Specifically searches the 'CASE_LAW' domain.
        """
        results = self.vector_store.similarity_search(
            query, k=2, filter={"domain": "CASE_LAW"}
        )

        cases = []
        for doc in results:
            case_name = doc.metadata.get("act", "Unknown Judgment")
            if case_name not in cases:
                cases.append(case_name)
        return cases

    def generate_answer(
        self, query: str, context: List[Dict], session_id: str = "default"
    ) -> Dict[str, str]:
        """
        Uses Groq AI to synthesize the answer in Green-Yellow-Red format with chat history.
        """
        if not context:
            return {
                "green_layer": "No specific statutory law found in database.",
                "yellow_layer": "No related judgments found.",
                "red_layer": "Please consult a legal expert.",
            }

        # Get chat history for this session
        chat_history = self.get_chat_history(session_id)

        # Keep only last 14 messages to avoid token limits
        if len(chat_history.messages) > 14:
            chat_history.messages = chat_history.messages[-14:]

        # Build history text
        history_text = ""
        for msg in chat_history.messages:
            role = "User" if msg.type == "human" else "SamvidhanAI"
            history_text += f"{role}: {msg.content}\n"

        # Construct Context Block
        context_str = ""
        for item in context:
            meta = item["metadata"]
            context_str += f"""
            [Source: {meta.get("act", "Unknown Act")} | Section: {meta.get("section", "N/A")}]
            {item["text"]}
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
        4. CONTEXT AWARE: Use previous conversation history to provide better answers.
        """

        user_prompt = f"""
Context from Legal Database:
{context_str}

Previous Conversation:
{history_text}

Current Query: {query}

Respond following all rules and considering the conversation history.
"""

        try:
            # Add user message to history
            chat_history.add_user_message(query)

            response = self.chat.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                max_tokens=1024,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )

            import json

            content = response.choices[0].message.content
            result = json.loads(content)

            # Add AI response to history
            ai_response = f"Green: {result.get('green_layer', '')}\nYellow: {result.get('yellow_layer', '')}\nRed: {result.get('red_layer', '')}"
            chat_history.add_ai_message(ai_response)

            return result

        except Exception as e:
            return {
                "green_layer": "Error parsing statutory data.",
                "yellow_layer": "Error retrieving cases.",
                "red_layer": f"AI Generation Failed: {str(e)}",
            }


# Singleton instance
rag_service = RAGService()
