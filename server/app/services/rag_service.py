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
        # Initialize Pinecone and other services silently
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

        except Exception:
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
        except Exception:
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

            except Exception as _e:
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
7. MANDATORY: Add citation markers [1], [2], [3] etc. throughout your response when referencing ANY law, section, or case

OUTPUT FORMAT (JSON):
{{
    "law": "State the relevant law/section clearly with citation markers [1]. Explain what it means in simple terms. Reference specific sections with markers.",
    "examples": "Provide real-world examples, scenarios, or landmark cases [2] that illustrate this law. Add citation markers for any case or law mentioned.",
    "simple_answer": "Give a complete, detailed explanation in everyday language. Include practical guidance and next steps if relevant. Use citation markers [3] for any legal reference.",
    "citations": [
        {{
            "id": 1,
            "title": "BNS Section 318 - Cheating and dishonestly inducing delivery of property",
            "source": "Bharatiya Nyaya Sanhita, 2023",
            "section": "Section 318",
            "url": "https://indiankanoon.org/search/?formInput=BNS%20Section%20318"
        }},
        {{
            "id": 2,
            "title": "State of Maharashtra v. Ramdas Shrinivas Nayak",
            "source": "Supreme Court of India",
            "section": "Landmark Case",
            "url": "https://indiankanoon.org/search/?formInput=State%20of%20Maharashtra%20v%20Ramdas%20Shrinivas%20Nayak"
        }},
        {{
            "id": 3,
            "title": "IPC Section 420 - Cheating and dishonestly inducing delivery of property",
            "source": "Indian Penal Code, 1860",
            "section": "Section 420",
            "url": "https://indiankanoon.org/search/?formInput=IPC%20Section%20420"
        }}
    ]
}}

CITATION RULES - CRITICAL:
- ALWAYS include citations array with at least 2-5 citations for every legal query
- Generate reliable, clickable URLs using Indian Kanoon search
- URL Format: https://indiankanoon.org/search/?formInput=<SEARCH_TERM>
- For BNS sections: https://indiankanoon.org/search/?formInput=BNS%20Section%20<NUMBER>
- For IPC sections: https://indiankanoon.org/search/?formInput=IPC%20Section%20<NUMBER>
- For BNSS sections: https://indiankanoon.org/search/?formInput=BNSS%20Section%20<NUMBER>
- For BSA sections: https://indiankanoon.org/search/?formInput=BSA%20Section%20<NUMBER>
- For CrPC sections: https://indiankanoon.org/search/?formInput=CrPC%20Section%20<NUMBER>
- For court cases: https://indiankanoon.org/search/?formInput=<CASE_NAME_WITH_SPACES_AS_%20>
- For acts: https://indiankanoon.org/search/?formInput=<ACT_NAME>
- Citation IDs MUST match the inline markers [1], [2], [3] in your text
- Each citation must have: id, title, source, section (or "N/A"), and a valid URL
- URLs must be properly encoded (spaces as %20)

IMPORTANT:
- If user asks in Hindi, respond in Hindi
- Be thorough and detailed (not brief)
- Ground responses in provided legal documents when available
- Use general legal knowledge when specific documents aren't available
- Never say "I don't have information" - provide helpful general guidance instead
- MANDATORY: Every legal response MUST include citations array with proper URLs
- Place citation markers [1], [2] naturally throughout your response text

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

            if "citations" not in result or not result["citations"]:
                result["citations"] = []

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

        except Exception:
            return {
                "law": "I encountered a technical issue processing your request.",
                "examples": "Please try rephrasing your question or ask about a specific law or section.",
                "simple_answer": "There was an error, but I'm here to help. Could you please rephrase your legal question?",
                "citations": [],
            }

    def find_related_cases(self, query: str) -> List[str]:
        """
        Dynamically identifies landmark Supreme Court and High Court judgments related to the query.
        """
        prompt = f"""Identify 3 landmark Supreme Court or High Court judgments of India related to this legal query: "{query}".
        
        For each case, provide:
        - Case Name
        - Brief significance (1 sentence)
        
        Format: "Case Name (Significance)"
        Respond only with a JSON list of strings.
        Example: ["Kesavananda Bharati v. State of Kerala (Basic Structure Doctrine)", "Maneka Gandhi v. Union of India (Right to Travel Abroad)"]
        """

        try:
            response = self.chat.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                max_tokens=400,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": "You are a legal research expert specialized in Indian Case Law.",
                    },
                    {"role": "user", "content": prompt},
                ],
            )

            # The model might return a JSON object with a list inside, or just a list.
            # Using response_format={"type": "json_object"} usually yields {"cases": [...]} or similar.
            result = json.loads(response.choices[0].message.content)

            # Flexible parsing
            if isinstance(result, list):
                return result[:3]
            if isinstance(result, dict):
                # Look for common keys
                for key in ["cases", "judgments", "result", "landmark_cases"]:
                    if key in result and isinstance(result[key], list):
                        return result[key][:3]
                # If it's a dict but no obvious list key, take first list found
                for val in result.values():
                    if isinstance(val, list):
                        return val[:3]

            return []
        except Exception:
            return []


rag_service = RAGService()
