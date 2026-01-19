from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    domain: Optional[str] = None  # "IT_LAW", "CRIMINAL_LAW", "CORPORATE_LAW"

class LawCitation(BaseModel):
    act: str
    section: str
    text: str
    source_link: Optional[str] = None

class SearchResponse(BaseModel):
    answer: str
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
