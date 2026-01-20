import os
from groq import Groq
from pypdf import PdfReader
from io import BytesIO
from typing import Dict, Any

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text from PDF file bytes"""
    try:
        pdf_reader = PdfReader(BytesIO(pdf_file))
        text = ""

        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def summarize_legal_document(text: str) -> Dict[str, Any]:
    """Summarize legal document using Groq AI"""

    system_prompt = """You are a legal document analyzer specializing in Indian law. 
Analyze the provided legal document and create a comprehensive, well-structured summary.

CRITICAL: Return ONLY valid JSON in this exact format:
{
    "document_overview": {
        "title": "Document title or case name",
        "type": "Type of document (e.g., Court Judgment, Legal Notice, Contract)",
        "parties": "Parties involved (if applicable)",
        "date": "Date of document (if mentioned)"
    },
    "core_arguments": [
        "First main argument or claim",
        "Second main argument or claim",
        "Third main argument or claim"
    ],
    "final_verdict": {
        "decision": "The court's decision or document conclusion",
        "reasoning": "Key reasoning behind the decision"
    },
    "acts_cited": [
        {
            "act": "Name of the Act",
            "sections": ["Section 1", "Section 2"],
            "relevance": "Why this act was cited"
        }
    ],
    "key_timeline": [
        {
            "date": "Date",
            "event": "What happened"
        }
    ],
    "key_points": [
        "Important point 1",
        "Important point 2",
        "Important point 3"
    ]
}

IMPORTANT:
- Extract ALL acts and sections mentioned
- Be thorough but concise
- Use clear, simple language
- If any section is not applicable, use empty arrays [] or "Not specified"
- Return ONLY the JSON, no additional text"""

    user_prompt = f"""Analyze this legal document and provide a structured summary:

{text[:15000]}

Remember: Return ONLY valid JSON in the specified format."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=4000,
        )

        summary_text = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if summary_text.startswith("```json"):
            summary_text = (
                summary_text.replace("```json", "").replace("```", "").strip()
            )
        elif summary_text.startswith("```"):
            summary_text = summary_text.replace("```", "").strip()

        # Try to parse JSON
        import json

        try:
            summary = json.loads(summary_text)

            # Validate required fields exist
            if not isinstance(summary.get("document_overview"), dict):
                raise ValueError("Invalid document_overview")
            if not isinstance(summary.get("core_arguments"), list):
                raise ValueError("Invalid core_arguments")
            if not isinstance(summary.get("final_verdict"), dict):
                raise ValueError("Invalid final_verdict")

            return summary

        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON parsing error: {e}")
            print(f"Response text: {summary_text[:500]}")

            # Return a basic structure with the raw text
            return {
                "document_overview": {
                    "title": "Legal Document Analysis",
                    "type": "Legal Document",
                    "parties": "See summary below",
                    "date": "Not specified",
                },
                "core_arguments": [
                    "Please see the detailed summary below for core arguments and analysis."
                ],
                "final_verdict": {
                    "decision": "Analysis Complete",
                    "reasoning": summary_text[:1000]
                    if len(summary_text) > 1000
                    else summary_text,
                },
                "acts_cited": [],
                "key_timeline": [],
                "key_points": [
                    "The AI generated a response but it could not be parsed into the expected format.",
                    "Please review the reasoning section in Final Verdict for the complete analysis.",
                ],
            }

    except Exception as e:
        raise Exception(f"Error generating summary: {str(e)}")


def process_pdf_document(pdf_file: bytes) -> Dict[str, Any]:
    """Main function to process PDF and return summary"""

    # Extract text from PDF
    text = extract_text_from_pdf(pdf_file)

    if not text or len(text) < 100:
        raise Exception(
            "Could not extract sufficient text from PDF. Please ensure the PDF contains readable text."
        )

    # Generate summary using Groq
    summary = summarize_legal_document(text)

    return {"success": True, "summary": summary, "extracted_text_length": len(text)}
