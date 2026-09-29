import json
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List

from ..models.models import Case, TraceEvent
from ..agents.orchestrator import run_investigation_loop

router = APIRouter(prefix="/api/cases", tags=["cases"])

# In-memory cases store
CASES_STORE: dict[str, Case] = {}

def init_default_cases():
    from ..data_store import DEFAULT_CASES
    global CASES_STORE
    CASES_STORE = {c.id: c for c in DEFAULT_CASES}

@router.get("", response_model=List[Case])
def list_cases():
    if not CASES_STORE:
        init_default_cases()
    return list(CASES_STORE.values())

@router.get("/{case_id}", response_model=Case)
def get_case(case_id: str):
    if not CASES_STORE:
        init_default_cases()
    if case_id not in CASES_STORE:
        raise HTTPException(status_code=404, detail="Case not found")
    return CASES_STORE[case_id]

@router.get("/{case_id}/stream")
async def stream_case_trace(case_id: str):
    if not CASES_STORE:
        init_default_cases()
    if case_id not in CASES_STORE:
        raise HTTPException(status_code=404, detail="Case not found")

    target_case = CASES_STORE[case_id]

    async def event_generator():
        async for trace_step in run_investigation_loop(target_case):
            # Format SSE payload
            yield f"data: {json.dumps(trace_step.model_dump())}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
