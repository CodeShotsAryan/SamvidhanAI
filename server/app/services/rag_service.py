import os
from typing import List, Dict
from langchain_mistralai import MistralAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain_community.chat_message_histories import ChatMessageHistory
from dotenv import load_dotenv
from groq import Groq
import re
import json
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

    def classify_query(self, query: str) -> str:
        classification_prompt = """You are a query classifier. Classify the user's query into ONE category only.

Categories:
- "legal" - Questions about laws, sections, acts, legal procedures, rights, crimes, penalties, court cases, legal advice
- "casual" - Greetings (hi, hello, hey), thanks, goodbye, general chat, acknowledgments
- "filter" - Questions about active filters, selected domains, current filter status

Examples:
"What is Section 420 IPC?" → legal
"Hi there!" → casual
"Thanks for the help" → casual
"What filter is active?" → filter
"Explain BNS Section 318" → legal
"Can I file an FIR online?" → legal

Query: {query}

Respond with ONLY ONE WORD: legal, casual, or filter"""

        try:
            response = self.chat.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                max_tokens=10,
                messages=[
                    {
                        "role": "user",
                        "content": classification_prompt.format(query=query),
                    }
                ],
            )

            classification = response.choices[0].message.content.strip().lower()

            if classification in ["legal", "casual", "filter"]:
                return classification
            return "legal"

        except Exception as e:
            print(f"Classification error: {e}")
            return "legal"

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

        query_type = self.classify_query(query)

        if len(chat_history.messages) > 14:
            chat_history.messages = chat_history.messages[-14:]

        history_text = ""
        for msg in chat_history.messages[-6:]:
            role = "User" if msg.type == "human" else "Assistant"
            history_text += f"{role}: {msg.content}\n"

        if query_type == "casual":
            system_prompt = """You are SamvidhanAI, a friendly and helpful legal assistant for Indian law.

Respond naturally and warmly to casual messages. Keep it brief and conversational.
Invite users to ask legal questions if appropriate."""

            user_prompt = f"""Conversation History:
{history_text}

User: {query}

Respond in a friendly, natural way."""

            try:
                chat_history.add_user_message(query)

                response = self.chat.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=100,
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
                    "casual": "Hello! I'm SamvidhanAI, your legal assistant. How can I help you today?"
                }

        if query_type == "filter":
            filter_status = (
                f"You currently have the **{domain}** filter active, so I'll focus on {domain} related queries."
                if domain
                else "You haven't selected any specific filter, so I can help with questions across all areas of Indian law."
            )

            chat_history.add_user_message(query)
            chat_history.add_ai_message(filter_status)

            return {"casual": filter_status}

        context_str = ""
        has_strong_context = bool(context and len(context) > 0)

        if context:
            for i, item in enumerate(context, 1):
                meta = item["metadata"]
                act_name = meta.get("act", "Unknown Act")
                section = meta.get("section", "N/A")
                context_str += f"\n[Source {i}: {act_name} | Section: {section}]\n{item['text']}\n{'=' * 50}\n"

        filter_info = f"The user has selected **{domain}** filter." if domain else ""

        system_prompt = f"""You are SamvidhanAI, a knowledgeable legal assistant for Indian law.

CRITICAL KNOWLEDGE:
- BNS (Bharatiya Nyaya Sanhita) replaced IPC in 2023
- BNSS (Bharatiya Nagarik Suraksha Sanhita) replaced CrPC in 2023
- BSA (Bharatiya Sakshya Adhiniyam) replaced Evidence Act in 2023

RESPONSE GUIDELINES:
1. Use simple, conversational language
2. Explain legal terms in plain English/Hindi
3. Provide detailed, thorough explanations
4. Include real-world examples and scenarios
5. Be accurate - if unsure, use general legal knowledge
6. Use **bold** for key terms

OUTPUT FORMAT (JSON):
{{
    "law": "State the relevant law/section clearly. Explain what it means in simple terms.",
    "examples": "Provide real-world examples, scenarios, or landmark cases that illustrate this law.",
    "simple_answer": "Give a complete, detailed explanation in everyday language. Include practical guidance and next steps if relevant."
}}

IMPORTANT:
- If user asks in Hindi, respond in Hindi
- Be thorough and detailed (not brief)
- Ground responses in provided legal documents when available
- Use general legal knowledge when specific documents aren't available
- Never say "I don't have information" - provide helpful general guidance instead

{filter_info}"""

        context_instruction = ""
        if has_strong_context:
            context_instruction = f"""Legal Documents Retrieved:
{context_str}

Use these documents as primary sources. Cite them in your response."""
        else:
            context_instruction = "No specific documents found in database. Use your general knowledge of Indian law to provide a helpful, accurate response."

        user_prompt = f"""{context_instruction}

Conversation History:
{history_text}

User's Question: {query}

Provide a detailed, comprehensive response in JSON format."""

        try:
            chat_history.add_user_message(query)

            response = self.chat.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.2,
                max_tokens=2000,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )

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

            ai_response = f"Law: {result.get('law', '')[:200]}...\nExamples: {result.get('examples', '')[:200]}..."
            chat_history.add_ai_message(ai_response)

            if comparison:
                result["comparison"] = comparison

            return result

        except Exception as e:
            print(f"Error generating answer: {e}")
            return {
                "law": "I encountered a technical issue processing your request.",
                "examples": "Please try rephrasing your question or ask about a specific law or section.",
                "simple_answer": "There was an error, but I'm here to help. Could you please rephrase your legal question?",
            }


rag_service = RAGService()
