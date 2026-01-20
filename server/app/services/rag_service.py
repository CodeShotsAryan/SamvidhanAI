import os
from typing import List, Dict
from langchain_mistralai import MistralAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain_community.chat_message_histories import ChatMessageHistory
from dotenv import load_dotenv
from groq import Groq
import re
from app.data.legal_mapping import get_mapping

load_dotenv()


class RAGService:
    def __init__(self):
        pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        index_name = os.environ.get("PINECONE_INDEX", "samvidhan")
        self.index = pc.Index(index_name)

        self.embeddings = MistralAIEmbeddings(
            model="mistral-embed", mistral_api_key=os.environ.get("MISTRAL_API_KEY")
        )

        self.vector_store = PineconeVectorStore(
            index=self.index, embedding=self.embeddings
        )

        self.chat = Groq(api_key=os.environ.get("GROQ_API_KEY"))

        self.chat_histories = {}

    def get_chat_history(self, session_id: str = "default") -> ChatMessageHistory:
        if session_id not in self.chat_histories:
            self.chat_histories[session_id] = ChatMessageHistory()
        return self.chat_histories[session_id]

    def clear_chat_history(self, session_id: str = "default"):
        if session_id in self.chat_histories:
            self.chat_histories[session_id].clear()

    def is_legal_question(self, query: str) -> bool:
        query_lower = query.lower().strip()

        casual_patterns = [
            "hi",
            "hello",
            "hey",
            "thanks",
            "thank you",
            "ok",
            "okay",
            "yes",
            "no",
            "bye",
            "good",
            "great",
            "nice",
            "cool",
            "who are you",
            "what filter",
            "which filter",
            "current filter",
            "selected filter",
            "filter i",
        ]

        if any(
            p in query_lower
            for p in [
                "what filter",
                "which filter",
                "filter i",
                "filter have",
                "selected filter",
                "active filter",
                "current filter",
            ]
        ):
            return False

        if len(query_lower.split()) <= 3:
            if any(pattern in query_lower for pattern in casual_patterns):
                return False

        legal_keywords = [
            "section",
            "act",
            "law",
            "legal",
            "ipc",
            "bns",
            "bnss",
            "bsa",
            "court",
            "case",
            "rights",
            "crime",
            "punishment",
            "bail",
            "company",
            "contract",
            "property",
            "cyber",
            "data",
            "privacy",
            "how to",
            "can i",
            "is it",
            "explain",
            "difference",
            "compare",
            "penalty",
            "fine",
            "jail",
            "arrest",
            "fir",
            "previous",
            "earlier",
            "before",
            "last",
            "above",
            "context",
            "what did",
            "you said",
            "you mentioned",
        ]

        if any(keyword in query_lower for keyword in legal_keywords):
            if any(
                p in query_lower
                for p in ["what filter", "which filter", "current filter"]
            ):
                return False
            return True

        if "?" in query:
            return True

        if len(query_lower.split()) > 5:
            return True

        return False

    def retrieve_context(
        self, query: str, domain: str = None, n_results: int = 5
    ) -> List[Dict]:
        try:
            if domain:
                results = self.vector_store.similarity_search(
                    query, k=n_results, filter={"domain": domain}
                )
            else:
                results = self.vector_store.similarity_search(query, k=n_results)

            citations = []
            for doc in results:
                citations.append({"text": doc.page_content, "metadata": doc.metadata})
            return citations
        except Exception as e:
            print(f"[!] RAG Fallback: Vector store error: {e}")
            return []

    def generate_answer(
        self,
        query: str,
        context: List[Dict],
        session_id: str = "default",
        domain: str = None,
    ) -> Dict[str, str]:
        chat_history = self.get_chat_history(session_id)

        is_legal = self.is_legal_question(query)

        if len(chat_history.messages) > 14:
            chat_history.messages = chat_history.messages[-14:]

        history_text = ""
        for msg in chat_history.messages:
            role = "User" if msg.type == "human" else "SamvidhanAI"
            history_text += f"{role}: {msg.content}\n"

        if not is_legal:
            filter_status = f"You currently have the **{domain}** filter active." if domain else "You haven't selected any filter yet."
            
            system_prompt = f"""You are SamvidhanAI, a friendly legal assistant for Indian law.

CURRENT FILTER STATUS: {filter_status}

The user just sent a casual message. Respond naturally and warmly.

IMPORTANT: If the user asks about filters (like "what filter", "which filter", "current filter"), clearly tell them: "{filter_status}"

Keep responses brief and friendly. Invite them to ask legal questions."""

            user_prompt = f"""Previous Conversation:
{history_text}

User's Message: {query}

Respond warmly. If asking about filters, tell them clearly what filter is active."""

            try:
                chat_history.add_user_message(query)

                response = self.chat.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=150,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                )

                casual_response = response.choices[0].message.content
                chat_history.add_ai_message(casual_response)

                return {"casual": casual_response}

            except Exception as e:
                return {
                    "casual": f"{filter_status} I'm here to help with any legal questions you have. What would you like to know?"
                }

        context_str = ""
        if context:
            for i, item in enumerate(context, 1):
                meta = item["metadata"]
                act_name = meta.get("act", "Unknown Act")
                section = meta.get("section", "N/A")
                context_str += f"\n[Source {i}: {act_name} | Section: {section}]\n{item['text']}\n{'=' * 50}\n"
        else:
            context_str = (
                "No specific legal documents found in database for this query."
            )

        filter_context = f"ACTIVE FILTER: The user has selected the **{domain}** filter. Focus your response on this area of law." if domain else ""

        system_prompt = f"""You are SamvidhanAI, a friendly legal assistant for Indian law.

IMPORTANT KNOWLEDGE:
- Bharatiya Nyaya Sanhita (BNS) replaced Indian Penal Code (IPC) in 2023
- Bharatiya Nagarik Suraksha Sanhita (BNSS) replaced CrPC in 2023
- Bharatiya Sakshya Adhiniyam (BSA) replaced Indian Evidence Act in 2023
- Example: IPC Section 420 (Cheating) is now BNS Section 318

YOUR RESPONSE STYLE:
1. Use SIMPLE, EVERYDAY language - explain like talking to a friend
2. Avoid legal jargon - or explain it simply
3. Be DETAILED and IN-DEPTH - don't give short answers
4. Provide COMPLETE explanations with examples
5. Use short sentences and simple words
6. Be helpful and friendly

OUTPUT FORMAT (JSON ONLY):
{{
    "law": "The actual law/section. Quote it clearly. Explain what it means in simple words.",
    "examples": "Real examples or court cases. How does this work in real life? Give detailed scenarios.",
    "simple_answer": "Complete, detailed explanation in everyday language. What does this mean? What should the person do? Give step-by-step guidance if needed. Be thorough and helpful."
}}

RULES:
1. BILINGUAL: If user asks in Hindi, respond in Hindi
2. BE DETAILED: Give complete, in-depth answers (not just 1-2 lines)
3. USE EXAMPLES: Always include real-life examples
4. BE ACCURATE: Don't make up laws
5. USE **BOLD** for important terms
6. EXPLAIN FULLY: Don't assume user knows legal terms

{filter_context}"""

        user_prompt = f"""Legal Documents from Database:
{context_str}

Previous Conversation:
{history_text}

User's Question: {query}

Provide a DETAILED, IN-DEPTH response. Don't be brief - explain thoroughly."""

        try:
            chat_history.add_user_message(query)

            response = self.chat.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )

            import json

            content = response.choices[0].message.content
            result = json.loads(content)

            comparison = None
            section_matches = re.findall(
                r"(?:section|ipc|bns)\s*([0-9]+[a-zA-Z]*)", query.lower()
            )
            for sec in section_matches:
                mapping = get_mapping(sec.upper())
                if mapping:
                    comparison = mapping
                    break

            ai_response = f"Law: {result.get('law', '')[:200]}...\nExamples: {result.get('examples', '')[:200]}...\nAnswer: {result.get('simple_answer', '')[:200]}..."
            chat_history.add_ai_message(ai_response)

            if comparison:
                result["comparison"] = comparison

            return result

        except Exception as e:
            return {
                "law": "Sorry, I couldn't find the exact law for this.",
                "examples": "No examples available right now.",
                "simple_answer": f"There was a technical issue: {str(e)}. Please try asking again.",
            }


rag_service = RAGService()