"""
Trace Logger Module
Maintains an append-only in-memory and persistent log of all agent steps.
"""
from typing import List, Dict, Any
from datetime import datetime
from ..models.models import TraceEvent, AuditRecord

_trace_storage: Dict[str, List[TraceEvent]] = {}
_audit_storage: List[AuditRecord] = []

def log_trace_step(case_id: str, event: TraceEvent) -> None:
    if case_id not in _trace_storage:
        _trace_storage[case_id] = []
    _trace_storage[case_id].append(event)

    # Also log to global audit if consequential
    if event.step in ("action", "verification", "escalate", "decision"):
        _audit_storage.insert(0, AuditRecord(
            id=f"aud-{len(_audit_storage)+1}",
            time=datetime.utcnow().strftime("%d %b %H:%M:%S"),
            case_id=case_id,
            step_type=event.step,
            actor="agent",
            actor_name="Eclipse Agent",
            summary=event.summary
        ))

def get_case_trace(case_id: str) -> List[TraceEvent]:
    return _trace_storage.get(case_id, [])

def get_all_audit_logs() -> List[AuditRecord]:
    return _audit_storage
