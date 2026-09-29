import time
from typing import List, Dict, Any
from .base import ToolResult

MOCK_EMAILS = [
    {
        "id": "EML-402",
        "vendor": "Acme Pvt Ltd",
        "subject": "Re: Payment schedule for invoice INV-20418",
        "snippet": "As agreed with your accounts lead, we are splitting invoice INV-20418 into two instalments: ₹60,000 immediately, and the remaining ₹40,000 by 3 October.",
        "date": "2026-09-03"
    },
    {
        "id": "EML-319",
        "vendor": "CloudScale Infra Services",
        "subject": "Discount voucher credit note for INV-18890",
        "snippet": "Due to the delayed setup, we will issue a credit note for ₹15,000 against invoice INV-18890 to align with your original PO limit.",
        "date": "2026-08-28"
    }
]

def search_emails(query: str) -> ToolResult:
    start = time.time()
    q_lower = query.lower()
    results = []
    for em in MOCK_EMAILS:
        if any(term in em["subject"].lower() or term in em["snippet"].lower() for term in q_lower.split()):
            results.append(em)

    duration = int((time.time() - start) * 1000)
    return ToolResult(
        ok=True,
        data={"query": query, "hits": len(results), "emails": results},
        duration_ms=max(duration, 140)
    )
