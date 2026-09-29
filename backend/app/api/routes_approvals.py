from fastapi import APIRouter, HTTPException
from typing import List
from ..models.models import Case, RejectRequest
from .routes_cases import CASES_STORE, init_default_cases
from ..audit.trace_logger import log_trace_step, TraceEvent

router = APIRouter(prefix="/api/approvals", tags=["approvals"])

@router.get("", response_model=List[Case])
def list_pending_approvals():
    if not CASES_STORE:
        init_default_cases()
    return [
        c for c in CASES_STORE.values()
        if c.status == "awaiting_approval" and c.proposed_action and c.proposed_action.status == "pending"
    ]

@router.post("/{case_id}/approve")
def approve_action(case_id: str):
    if not CASES_STORE:
        init_default_cases()
    if case_id not in CASES_STORE:
        raise HTTPException(status_code=404, detail="Case not found")

    target = CASES_STORE[case_id]
    target.status = "resolved"
    target.gap = 0.0
    if target.proposed_action:
        target.proposed_action.status = "approved"

    # Add verified step
    verify_step = TraceEvent(
        id=f"tr-appr-{case_id}",
        case_id=case_id,
        step="verification",
        state="done",
        summary="Action approved by human controller. Verified in ERP ledger.",
        payload={"status": "verified", "gap": 0.0},
        ts="Now"
    )
    target.trace.append(verify_step)
    log_trace_step(case_id, verify_step)

    return {"status": "approved", "case_id": case_id, "new_gap": 0.0}

@router.post("/{case_id}/reject")
def reject_action(case_id: str, req: RejectRequest):
    if not CASES_STORE:
        init_default_cases()
    if case_id not in CASES_STORE:
        raise HTTPException(status_code=404, detail="Case not found")

    target = CASES_STORE[case_id]
    target.status = "declined"
    if target.proposed_action:
        target.proposed_action.status = "rejected"
        target.proposed_action.rejection_reason = req.reason

    reject_step = TraceEvent(
        id=f"tr-rej-{case_id}",
        case_id=case_id,
        step="escalate",
        state="done",
        summary=f"Action rejected by human: '{req.reason}'. Marked human-declined.",
        payload={"status": "declined", "reason": req.reason},
        ts="Now"
    )
    target.trace.append(reject_step)
    log_trace_step(case_id, reject_step)

    return {"status": "rejected", "case_id": case_id, "reason": req.reason}
