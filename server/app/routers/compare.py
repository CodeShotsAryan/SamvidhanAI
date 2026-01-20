from fastapi import APIRouter
from app.models.schemas import CompareRequest, CompareResponse
from app.data.legal_mapping import get_mapping
from app.services.rag_service import rag_service
import json
import re

router = APIRouter(prefix="/api/compare", tags=["Compare"])


@router.post("/", response_model=CompareResponse)
async def compare_laws(request: CompareRequest):
    input_sec_raw = str(request.ipc_section).strip().upper()

    # Improved extraction: "Sec 463" -> "463", "BNS 103" -> "103"
    # Find the first sequence of numbers (possibly followed by letters like 124A)
    num_match = re.search(r"\d+[A-Z]*", input_sec_raw)
    search_key = (
        num_match.group() if num_match else re.sub(r"[^0-9A-Z]", "", input_sec_raw)
    )

    # Try hardcoded mapping first
    match = get_mapping(search_key)

    if match:
        response_text = f"IPC Section {match['ipc_section']} ({match['title']}) corresponds to BNS Section {match['bns_section']}.\n\n"
        response_text += f"LEGAL MEANING:\n{match['meaning']}\n\n"
        response_text += f"PUNISHMENT:\n{match['punishment']}"

        return {
            "comparison_text": response_text,
            "key_changes": [match["key_changes"]],
        }

    # Fallback to LLM if mapping not found
    try:
        prompt = f"""Compare Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS) for Section: {input_sec_raw}.
        
        Mandatory Guidelines:
        1. Identify the specific BNS section number that replaces this IPC section.
        2. Provide a 'LEGAL MEANING' and 'PUNISHMENT' breakdown.
        3. No conversational filler. Statutory focus only.
        
        Format your response as a JSON object:
        {{
            "comparison_text": "Comparison summary...\\n\\nLEGAL MEANING:\\n...\\n\\nPUNISHMENT:\\n...",
            "key_changes": ["Specifically mention renumbering", "Note any significant changes"]
        }}
        """

        response = rag_service.chat.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=800,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise legal renumbering expert for Indian Law (IPC vs BNS). You always provide correct BNS section numbers.",
                },
                {"role": "user", "content": prompt},
            ],
        )

        llm_result = json.loads(response.choices[0].message.content)
        return llm_result

    except Exception as e:
        print(f"Comparison Fallback Error: {e}")
        return {
            "comparison_text": f"IPC Section {input_sec_raw} was not found in our curated list, and automated lookup failed. Please verify the section number.",
            "key_changes": ["Mapping not available for this specific section."],
        }
