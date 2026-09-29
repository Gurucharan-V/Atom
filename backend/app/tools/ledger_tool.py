import time
from .base import ToolResult

def query_ledger(account_or_ref: str, simulate_retry: bool = False) -> ToolResult:
    start = time.time()
    if simulate_retry:
        # Tool failure and retry simulation as required by Phase 8 & Scenario 5
        duration = int((time.time() - start) * 1000)
        return ToolResult(
            ok=False,
            data=None,
            error="Mock ERP connection timed out (504 Gateway Timeout). Retrying with replica...",
            duration_ms=duration + 350
        )

    duration = int((time.time() - start) * 1000)
    return ToolResult(
        ok=True,
        data={
            "account": "2010_AP",
            "matched_entries": [
                {"id": "JE-901", "ref": account_or_ref, "status": "POSTED"}
            ]
        },
        duration_ms=max(duration, 190)
    )
