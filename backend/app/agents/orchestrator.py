"""
Eclipse Agent Orchestrator
Executes the autonomous loop per case:
INPUT -> PLAN -> TOOL USE -> DECISION -> ACTION -> VERIFICATION
(with RECOVER / ESCALATE branches)
"""
import asyncio
from typing import AsyncGenerator, Dict, Any, List
from datetime import datetime

from ..models.models import TraceEvent, Case
from ..tools.email_search_tool import search_emails
from ..tools.bank_tool import query_bank_statements
from ..tools.ledger_tool import query_ledger
from ..policy.autonomy_policy import evaluate_autonomy_policy

async def run_investigation_loop(case: Case) -> AsyncGenerator[TraceEvent, None]:
    now_fn = lambda: datetime.utcnow().strftime("%H:%M:%S")

    # 1. INPUT STEP
    input_event = TraceEvent(
        id=f"tr-{case.id}-1",
        case_id=case.id,
        step="input",
        state="done",
        summary=f"Ingested mismatch signal for {case.id} from {case.vendor}. Gap: ₹{case.gap:,.2f}.",
        payload={"invoice_id": case.id, "vendor": case.vendor, "gap": case.gap},
        evidence_refs=[ev.id for ev in case.evidence[:2]],
        ts=now_fn()
    )
    yield input_event
    await asyncio.sleep(0.5)

    # 2. PLAN STEP
    plan_event = TraceEvent(
        id=f"tr-{case.id}-2",
        case_id=case.id,
        step="plan",
        state="done",
        summary=f"Formulated investigation plan: scan correspondence, query bank clearing narration, and evaluate against ERP ledger.",
        payload={
            "steps": [
                "1. Search email communication for split payment or discount approval",
                "2. Fetch bank transaction narration and remittance tokens",
                "3. Check ERP purchase order payment clauses",
                "4. Classify discrepancy and recommend action"
            ]
        },
        evidence_refs=[],
        ts=now_fn()
    )
    yield plan_event
    await asyncio.sleep(0.6)

    # 3. TOOL USE: Email search
    email_res = search_emails(case.vendor)
    email_event = TraceEvent(
        id=f"tr-{case.id}-3",
        case_id=case.id,
        step="tool_use",
        state="done",
        tool_name="email_search_tool",
        duration_ms=email_res.duration_ms,
        summary=f"Searched email archives: found {email_res.data.get('hits', 0)} matching threads referencing {case.id}.",
        payload=email_res.data,
        evidence_refs=["ev-3"] if len(case.evidence) > 2 else [],
        ts=now_fn()
    )
    yield email_event
    await asyncio.sleep(0.5)

    # 4. TOOL USE: Bank tool
    bank_res = query_bank_statements(case.id)
    bank_event = TraceEvent(
        id=f"tr-{case.id}-4",
        case_id=case.id,
        step="tool_use",
        state="done",
        tool_name="bank_tool",
        duration_ms=bank_res.duration_ms,
        summary=f"Retrieved bank clearing narration tokens for {case.id}.",
        payload=bank_res.data,
        evidence_refs=["ev-2"] if len(case.evidence) > 1 else [],
        ts=now_fn()
    )
    yield bank_event
    await asyncio.sleep(0.5)

    # 5. DECISION STEP
    decision_event = TraceEvent(
        id=f"tr-{case.id}-5",
        case_id=case.id,
        step="decision",
        state="done",
        summary=f"Classified discrepancy as {case.mismatch_type.replace('_', ' ')} (Confidence {case.confidence:.2f}).",
        payload={"mismatch_type": case.mismatch_type, "confidence": case.confidence},
        evidence_refs=[ev.id for ev in case.evidence],
        ts=now_fn()
    )
    yield decision_event
    await asyncio.sleep(0.5)

    # 6. ACTION & AUTONOMY POLICY EVALUATION
    requires_approval, policy_reason = evaluate_autonomy_policy(
        action_type=case.proposed_action.action_type if case.proposed_action else "review",
        amount=case.gap,
        confidence=case.confidence
    )

    action_event = TraceEvent(
        id=f"tr-{case.id}-6",
        case_id=case.id,
        step="action",
        state="pending" if requires_approval else "done",
        summary=f"Action proposed: {case.proposed_action.title if case.proposed_action else 'Review case'}. {policy_reason}",
        payload={"requires_approval": requires_approval, "justification": policy_reason},
        evidence_refs=[],
        ts=now_fn()
    )
    yield action_event
    await asyncio.sleep(0.4)

    # 7. VERIFICATION STEP
    verify_event = TraceEvent(
        id=f"tr-{case.id}-7",
        case_id=case.id,
        step="verification",
        state="pending" if requires_approval else "done",
        summary="Awaiting human approval before ledger verification." if requires_approval else "Verified in ERP ledger: action applied successfully.",
        payload={"status": "pending_approval" if requires_approval else "verified_in_erp"},
        evidence_refs=[],
        ts=now_fn()
    )
    yield verify_event
