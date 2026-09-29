import time
from .base import ToolResult

MOCK_BANK_RECORDS = [
    {
        "id": "HDFC-88213",
        "narration": "NEFT Cr: ₹60,000 from Acme Pvt Ltd Ref: INV-20418 INST1 OF 2 REF ACM-559",
        "amount": 60000.0,
        "date": "2026-09-04"
    },
    {
        "id": "ICICI-99120",
        "narration": "NEFT LogiTech Solutions India Ref INV-19042",
        "amount": 75000.0,
        "date": "2026-09-12"
    },
    {
        "id": "AXIS-40112",
        "narration": "RTGS LogiTech Solutions India Ref INV-19042-RETRY",
        "amount": 75000.0,
        "date": "2026-09-14"
    }
]

def query_bank_statements(ref: str) -> ToolResult:
    start = time.time()
    matches = [b for b in MOCK_BANK_RECORDS if ref.lower() in b["narration"].lower() or ref.lower() in b["id"].lower()]
    duration = int((time.time() - start) * 1000)
    return ToolResult(
        ok=True,
        data={"ref": ref, "matches": matches},
        duration_ms=max(duration, 180)
    )
