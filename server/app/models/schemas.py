from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    domain: Optional[str] = None

class LawCitation(BaseModel):
    id: str
    source: str
    section: str
    text: str
    url: Optional[str] = None

class StructuredAnswer(BaseModel):
    green_layer: str
    yellow_layer: str
    red_layer: str

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
