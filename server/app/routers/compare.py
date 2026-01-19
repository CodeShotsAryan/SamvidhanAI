from fastapi import APIRouter
from app.models.schemas import CompareRequest, CompareResponse
import json
import os

router = APIRouter(prefix="/api/compare", tags=["Compare"])

# Load Mapping Data
DATA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data/ipc_bns_mapping.json",
)


def load_mappings():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return []


MAPPINGS = load_mappings()


@router.post("/", response_model=CompareResponse)
async def compare_laws(request: CompareRequest):
    # Find mapping
    input_sec = str(request.ipc_section).strip()

    match = next((item for item in MAPPINGS if item["ipc_section"] == input_sec), None)

    if match:
        return {
            "comparison_text": f"IPC Section {match['ipc_section']} ({match['topic']}) corresponds to BNS Section {match['bns_section']}. \n\nAnalysis: {match['description']}",
            "key_changes": match["key_changes"],
        }
    else:
        return {
            "comparison_text": f"IPC Section {input_sec} was not found in our curated Top Changes list. Please check the section number or browse the full BNS document.",
            "key_changes": ["Mapping not available for this specific section."],
        }
