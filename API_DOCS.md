# SamvidhanAI Backend API Documentation

Base URL: `http://localhost:8000` (or Docker Service URL)

## 1. Legal Search (Core RAG)
**Endpoint:** `POST /search/`
**Purpose:** Answers legal queries using the "Green-Yellow-Red" Confidence Architecture.

### Request Body
```json
{
  "query": "What is the punishment for mob lynching under BNS?",
  "domain": "CRIMINAL_LAW",  // Optional: "IT_LAW", "CORPORATE_LAW"
  "language": "en"           // Optional: "en" or "hi" (Bilingual Support)
}
```

### Response Body
```json
{
  "structured_answer": {
    "green_layer": "Section 103(2) of BNS states punishment is death or life imprisonment...",
    "yellow_layer": "Relevant Case: Tehseen Poonawalla vs Union of India (2018)...",
    "red_layer": "Mob lynching is now a specific distinct offense unlike in IPC..."
  },
  "citations": [
    {
      "id": "BNS_103",
      "source": "Bhartiya Nyaya Sanhita",
      "section": "103",
      "text": "When a group of five or more persons acting in concert...",
      "url": "https://indiankanoon.org/..."
    }
  ],
  "related_cases": [
    "Tehseen Poonawalla v. UOI",
    "State vs. Example Mob"
  ],
  "legal_domain_detected": "CRIMINAL_LAW"
}
```

---

## 2. Document Summarization
**Endpoint:** `POST /summarize/`
**Purpose:** Upload a PDF (e.g., Court Order, FIR) and get key insights.

### Request
*   **Content-Type:** `multipart/form-data`
*   **File:** `document.pdf` (Binary)

### Response Body
```json
{
  "summary": "The Supreme Court dismissed the appeal regarding...",
  "key_points": [
    "- FIR delay was unjustified.",
    "- Evidence was circumstantial."
  ],
  "verdict": "Appeal Dismissed"
}
```

---

## 3. Law Comparison (IPC vs BNS)
**Endpoint:** `POST /compare/`
**Purpose:** Compare old IPC section with new BNS section.

### Request Body
```json
{
  "ipc_section": "302"
}
```

### Response Body
```json
{
  "comparison_text": "IPC Section 302 (Murder) corresponds to BNS Section 103...",
  "key_changes": [
    "Section number changed to 103",
    "Added specific provision for mob lynching"
  ]
}
```
