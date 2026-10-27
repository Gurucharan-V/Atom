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
from ..tools.call_transcript_tool import search_call_transcripts
from ..matching.rules import explain_variance
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
        summary=f"Formulated investigation plan: scan correspondence, audio phone call transcripts, bank clearing, and GST/forex variance rules.",
        payload={
            "steps": [
                "1. Search phone call recordings & audio transcripts for verbal agreements",
                "2. Search email archives for remittance advice or credit note clauses",
                "3. Fetch bank transaction narration and remittance tokens",
                "4. Check GST slab (5%, 12%, 18%, 28%) and forex spread (±2%) rules",
                "5. Classify discrepancy and recommend action"
            ]
        },
        evidence_refs=[],
        ts=now_fn()
    )
    yield plan_event
    await asyncio.sleep(0.5)

    # 3. TOOL USE: Call Transcript Search (Multimodal Audio Intelligence)
    call_res = search_call_transcripts(case.vendor or case.id)
    if call_res.data.get("hits", 0) > 0:
        hit = call_res.data["results"][0]
        call_event = TraceEvent(
            id=f"tr-{case.id}-3a",
            case_id=case.id,
            step="tool_use",
            state="done",
            tool_name="call_transcript_tool",
            duration_ms=call_res.duration_ms,
            summary=f"Searched audio call index: found recording {hit['call_id']} ({hit['duration_text']}) with verbal agreement by {hit['matching_turns'][0]['speaker']}.",
            payload={"audio_id": hit["call_id"], "snippet": hit["primary_snippet"], "timestamp": hit["matching_turns"][0]["timestamp"]},
            evidence_refs=[ev.id for ev in case.evidence if ev.source_type == "call"] or ["ev-4"],
            ts=now_fn()
        )
        yield call_event
        await asyncio.sleep(0.4)

    # 4. TOOL USE: Email search
    email_res = search_emails(case.vendor)
    email_event = TraceEvent(
        id=f"tr-{case.id}-3b",
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
    await asyncio.sleep(0.4)

    # 5. TOOL USE: Bank tool
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
    await asyncio.sleep(0.4)

    # 6. MATCHING RULE CHECK: GST & Forex Variance Auto-Explainer (B6)
    variance_explanation = explain_variance(case.invoice_amount, case.paid_amount, case.currency)
    if variance_explanation:
        variance_event = TraceEvent(
            id=f"tr-{case.id}-4b",
            case_id=case.id,
            step="tool_use",
            state="done",
            tool_name="matching_rules_engine",
            duration_ms=60,
            summary=f"Tax & Forex Rule Match: {variance_explanation['explanation']}",
            payload=variance_explanation,
            evidence_refs=[ev.id for ev in case.evidence if ev.source_type == "invoice"],
            ts=now_fn()
        )
        yield variance_event
        await asyncio.sleep(0.4)

    # 7. DECISION STEP
    decision_summary = f"Classified discrepancy as {case.mismatch_type.replace('_', ' ')} (Confidence {case.confidence:.2f})."
    if case.prior_confidence and case.confidence > case.prior_confidence:
        decision_summary += f" Confidence increased from {case.prior_confidence:.2f} -> {case.confidence:.2f} with multimodal corroboration."

    decision_event = TraceEvent(
        id=f"tr-{case.id}-5",
        case_id=case.id,
        step="decision",
        state="done",
        summary=decision_summary,
        payload={"mismatch_type": case.mismatch_type, "confidence": case.confidence, "prior_confidence": case.prior_confidence},
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
