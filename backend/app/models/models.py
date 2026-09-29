from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict, Literal
from datetime import datetime

StepType = Literal[
    "input", "plan", "tool_use", "decision", "action", "verification", "recover", "escalate"
]
StepState = Literal["running", "done", "failed", "pending"]
MismatchType = Literal["partial", "duplicate", "missing", "unmatched", "price_variance", "tax_fx", "entity"]
CaseStatus = Literal["open", "running", "awaiting_approval", "resolved", "escalated", "declined"]

class TraceEvent(BaseModel):
    id: str
    case_id: str
    step: StepType
    state: StepState
    summary: str
    payload: Optional[Dict[str, Any]] = None
    evidence_refs: List[str] = Field(default_factory=list)
    ts: str
    parent_id: Optional[str] = None
    tool_name: Optional[str] = None
    duration_ms: Optional[int] = None

class Evidence(BaseModel):
    id: str
    source_type: Literal["invoice", "bank", "email", "po", "ledger"]
    title: str
    ref_id: str
    snippet: str
    highlight: str
    date: Optional[str] = None

class ProposedAction(BaseModel):
    action_type: Literal[
        "schedule_followup", "credit_note", "payment_hold", "vendor_reminder", "escalate_to_human", "journal_entry"
    ]
    title: str
    impact_statement: str
    target_field: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    requires_approval: bool = True
    status: Literal["pending", "approved", "rejected", "auto_applied"] = "pending"
    rejection_reason: Optional[str] = None

class Case(BaseModel):
    id: str
    vendor: str = ""
    invoice_id: str
    mismatch_type: MismatchType
    invoice_amount: float
    paid_amount: float
    gap: float
    currency: Literal["INR", "USD"] = "INR"
    status: CaseStatus = "open"
    confidence: float
    conclusion: str
    proposed_action: Optional[ProposedAction] = None
    evidence: List[Evidence] = Field(default_factory=list)
    trace: List[TraceEvent] = Field(default_factory=list)
    age: str = "Just now"

class AuditRecord(BaseModel):
    id: str
    time: str
    case_id: str
    step_type: StepType
    actor: Literal["agent", "human", "system"]
    actor_name: str
    summary: str
    details: Optional[str] = None

class RejectRequest(BaseModel):
    reason: str
