from fastapi import APIRouter, HTTPException, Response
from typing import List, Optional
from ..models.models import AuditRecord
from ..audit.trace_logger import get_all_audit_logs
from ..audit.report_generator import generate_case_report
from .routes_cases import CASES_STORE, init_default_cases

router = APIRouter(prefix="/api/audit", tags=["audit"])

@router.get("", response_model=List[AuditRecord])
def list_audit_logs():
    return get_all_audit_logs()

@router.get("/export/{case_id}")
def export_report(case_id: str):
    if not CASES_STORE:
        init_default_cases()
    if case_id not in CASES_STORE:
        raise HTTPException(status_code=404, detail="Case not found")

    case_dict = CASES_STORE[case_id].model_dump()
    html_report = generate_case_report(case_dict)
    return Response(content=html_report, media_type="text/html")
