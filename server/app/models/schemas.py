from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    domain: Optional[str] = None  # "IT_LAW", "CRIMINAL_LAW", "CORPORATE_LAW"

class LawCitation(BaseModel):
    id: str
    source: str # Act Name
    section: str
    text: str
    url: Optional[str] = None

# The "Green-Yellow-Red" Architecture
class StructuredAnswer(BaseModel):
    green_layer: str  # Statutory Law (The Truth)
    yellow_layer: str # Case Law & Precedents
    red_layer: str    # AI Simplification & Insight

class SearchResponse(BaseModel):
    structured_answer: StructuredAnswer
    citations: List[LawCitation]
    related_cases: List[str]
    legal_domain_detected: str

class SummarizeRequest(BaseModel):
    text: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]
    verdict: Optional[str] = None

class CompareRequest(BaseModel):
    ipc_section: Optional[str] = None

class CompareResponse(BaseModel):
    comparison_text: str
    key_changes: List[str]
