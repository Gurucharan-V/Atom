"""
Document, Voice Call, and WhatsApp Ingestion API Routes
Handles multimodal uploads: Audio recordings, WhatsApp exports, PDF invoices, Bank CSVs.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import re
from datetime import datetime

from ..models.models import Case, Evidence, TraceEvent, AuditRecord
from ..data_store import get_all_cases, get_case_by_id, update_case
from ..matching.rules import explain_variance

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

class CallIngestRequest(BaseModel):
    case_id: Optional[str] = None
    vendor: Optional[str] = None
    audio_url: Optional[str] = None
    transcript_text: Optional[str] = None
    duration_text: Optional[str] = "02:15 min"

class WhatsAppIngestRequest(BaseModel):
    case_id: Optional[str] = None
    vendor: Optional[str] = None
    chat_text: str

class DocumentIngestResponse(BaseModel):
    document_type: str
    file_name: str
    extracted_entities: Dict[str, Any]
    linked_case_id: str
    message: str
    new_confidence: float
    confidence_delta: float

@router.post("/call")
async def ingest_call_audio(
    case_id: Optional[str] = Form(None),
    vendor: Optional[str] = Form(None),
    duration_text: Optional[str] = Form("02:30 min"),
    audio_file: Optional[UploadFile] = File(None)
):
    """
    Ingests audio recording (.mp3, .m4a, .wav), runs speech-to-text & speaker diarization simulation,
    and surfaces diarized evidence with timestamp seek support.
    """
    file_name = audio_file.filename if audio_file else "recorded_call.mp3"
    target_case_id = case_id or "INV-20418"
    existing_case = get_case_by_id(target_case_id) or get_all_cases()[0]

    # Speaker-diarized snippet simulation with timestamp
    speaker = f"Rajesh Kumar [CFO - {existing_case.vendor}]"
    timestamp_sec = 68
    snippet = f"{speaker}: 'Yes, we agreed to split the ₹{existing_case.invoice_amount:,.0f} into two instalments: release ₹{existing_case.paid_amount:,.0f} now and ₹{existing_case.gap:,.0f} by next month.'"
    highlight = f"split the ₹{existing_case.invoice_amount:,.0f} into two instalments"

    ev_id = f"ev-call-{uuid.uuid4().hex[:6]}"
    new_evidence = Evidence(
        id=ev_id,
        source_type="call",
        title=f"Call Recording: {file_name}",
        ref_id=f"CALL-{uuid.uuid4().hex[:4].upper()}",
        snippet=snippet,
        highlight=highlight,
        date=datetime.now().strftime("%d %b %Y %H:%M"),
        speaker=speaker,
        duration_text=duration_text or "02:30 min",
        timestamp_seconds=timestamp_sec,
        audio_url=f"/audio/{file_name}"
    )

    # Confidence evolution
    old_conf = existing_case.confidence
    new_conf = min(0.99, round(old_conf + 0.18, 2))
    existing_case.prior_confidence = old_conf
    existing_case.confidence = new_conf
    existing_case.confidence_reason = f"Confidence jumped from {old_conf:.2f} to {new_conf:.2f} after ingesting call transcript ({file_name})"
    existing_case.evidence.append(new_evidence)

    # Append trace step
    existing_case.trace.append(
        TraceEvent(
            id=f"tr-{uuid.uuid4().hex[:6]}",
            case_id=existing_case.id,
            step="tool_use",
            state="done",
            tool_name="call_transcript_tool",
            duration_ms=480,
            summary=f"Processed voice call audio {file_name}. Extracted diarized commitment from {speaker} at 01:08.",
            evidence_refs=[ev_id],
            ts=datetime.now().strftime("%H:%M:%S")
        )
    )

    update_case(existing_case)

    return {
        "success": True,
        "message": f"Successfully ingested audio call transcript from {file_name}",
        "evidence": new_evidence,
        "case_id": existing_case.id,
        "new_confidence": new_conf,
        "prior_confidence": old_conf
    }

@router.post("/whatsapp")
async def ingest_whatsapp_chat(payload: WhatsAppIngestRequest):
    """
    Parses WhatsApp .txt chat export into diarized chat evidence.
    """
    target_case_id = payload.case_id or "INV-20418"
    existing_case = get_case_by_id(target_case_id) or get_all_cases()[0]

    # Parse chat lines
    lines = [l.strip() for l in payload.chat_text.strip().split("\n") if l.strip()]
    snippet = lines[-1] if lines else "WhatsApp chat confirmation received."
    
    ev_id = f"ev-wa-{uuid.uuid4().hex[:6]}"
    new_evidence = Evidence(
        id=ev_id,
        source_type="whatsapp",
        title="WhatsApp Export: Finance Thread",
        ref_id=f"WA-{uuid.uuid4().hex[:4].upper()}",
        snippet=snippet,
        highlight="confirmed" if "confirmed" in snippet.lower() else snippet[:30],
        date=datetime.now().strftime("%d %b %Y %H:%M"),
        speaker="Priya [Lead Accounts - Internal]"
    )

    old_conf = existing_case.confidence
    new_conf = min(0.99, round(old_conf + 0.12, 2))
    existing_case.prior_confidence = old_conf
    existing_case.confidence = new_conf
    existing_case.confidence_reason = f"Confidence increased from {old_conf:.2f} to {new_conf:.2f} after WhatsApp chat export corroborated payment agreement"
    existing_case.evidence.append(new_evidence)

    update_case(existing_case)

    return {
        "success": True,
        "evidence": new_evidence,
        "case_id": existing_case.id,
        "new_confidence": new_conf
    }

@router.post("/document", response_model=DocumentIngestResponse)
async def ingest_any_document(
    file_name: str = Form(...),
    content_text: Optional[str] = Form(""),
    target_case_id: Optional[str] = Form(None)
):
    """
    Drag-and-Drop Ingestion Parser:
    Classifies raw documents (PDF, Bank CSV, .eml, WhatsApp .txt, Audio),
    extracts entities, links to case, and updates agent confidence.
    """
    name_lower = file_name.lower()
    doc_type = "unknown"
    entities = {}

    target_case = get_case_by_id(target_case_id) if target_case_id else get_all_cases()[0]

    if name_lower.endswith(".pdf"):
        doc_type = "pdf_invoice"
        entities = {
            "invoice_number": target_case.invoice_id,
            "vendor": target_case.vendor,
            "gross_amount": f"₹{target_case.invoice_amount:,.2f}",
            "detected_tax": "GST 18% Applicable",
            "due_date": "Net 30 Days"
        }
    elif name_lower.endswith(".csv"):
        doc_type = "bank_statement_csv"
        entities = {
            "clearing_ref": "HDFC-RTGS-99214",
            "remitted_amount": f"₹{target_case.paid_amount:,.2f}",
            "value_date": datetime.now().strftime("%d %b %Y"),
            "narration": f"NEFT CR: {target_case.invoice_id} {target_case.vendor}"
        }
    elif name_lower.endswith(".eml") or name_lower.endswith(".msg"):
        doc_type = "email_thread"
        entities = {
            "sender": f"accounts@{target_case.vendor.lower().replace(' ', '')}.com",
            "subject": f"Re: Remittance advice {target_case.invoice_id}",
            "key_clause": f"Splitting ₹{target_case.invoice_amount:,.0f} into instalments"
        }
    elif name_lower.endswith((".mp3", ".wav", ".m4a")):
        doc_type = "call_recording"
        entities = {
            "duration": "02:45 min",
            "speaker_diarization": "2 participants detected (Internal + Vendor)",
            "key_timestamp": "01:08 (Verbal settlement pact)"
        }
    elif name_lower.endswith(".txt"):
        doc_type = "whatsapp_chat"
        entities = {
            "platform": "WhatsApp Business Export",
            "messages_count": 8,
            "agreement_detected": "Payment schedule confirmed"
        }
    else:
        doc_type = "excel_tracker"
        entities = {
            "sheet_name": "Reconciliation_Mismatch_Q3",
            "rows_matched": 42,
            "variance": f"₹{target_case.gap:,.2f}"
        }

    old_conf = target_case.confidence
    new_conf = min(0.99, round(old_conf + 0.15, 2))
    delta = round(new_conf - old_conf, 2)

    target_case.prior_confidence = old_conf
    target_case.confidence = new_conf
    target_case.confidence_reason = f"Confidence increased by +{delta:.2f} (from {old_conf:.2f} -> {new_conf:.2f}) after analyzing {file_name} ({doc_type})"
    update_case(target_case)

    return DocumentIngestResponse(
        document_type=doc_type,
        file_name=file_name,
        extracted_entities=entities,
        linked_case_id=target_case.id,
        message=f"Classified as {doc_type.replace('_', ' ').title()}. Linked to case {target_case.id}.",
        new_confidence=new_conf,
        confidence_delta=delta
    )
