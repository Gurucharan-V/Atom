"""
Mock ERP Service (FastAPI)
Simulates an Enterprise Accounting / ERP Ledger API with Idempotent writes.
"""
from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime

app = FastAPI(title="Eclipse Mock ERP", version="1.0.0")

# In-memory storage for idempotency & state
processed_idempotency_keys: Dict[str, Dict[str, Any]] = {}
audit_events: List[Dict[str, Any]] = []

class JournalEntryRequest(BaseModel):
    account: str
    debit: float
    credit: float
    narration: str
    reference_id: str

class PaymentHoldRequest(BaseModel):
    payment_id: str
    reason: str

class CreditNoteRequest(BaseModel):
    vendor: str
    amount: float
    invoice_id: str
    reason: str

class InvoiceStatusRequest(BaseModel):
    invoice_id: str
    status: str
    notes: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "service": "mock_erp", "time": datetime.datetime.utcnow().isoformat()}

@app.get("/invoices")
def get_invoices():
    return [
        {"invoice_id": "INV-20418", "vendor": "Acme Pvt Ltd", "amount": 100000.0, "status": "PARTIAL_PAID"},
        {"invoice_id": "INV-19042", "vendor": "LogiTech Solutions India", "amount": 75000.0, "status": "OVERPAID"},
        {"invoice_id": "INV-21004", "vendor": "Bharat Power & Electricals", "amount": 120000.0, "status": "OVERDUE"},
        {"invoice_id": "INV-18890", "vendor": "CloudScale Infra Services", "amount": 85000.0, "status": "PENDING_CREDIT"},
    ]

@app.get("/ledger")
def get_ledger(account: Optional[str] = None):
    return [
        {"entry_id": "JE-901", "account": "2010_AP", "debit": 0, "credit": 100000.0, "ref": "INV-20418"},
        {"entry_id": "JE-902", "account": "1010_CASH", "debit": 60000.0, "credit": 0, "ref": "HDFC-88213"},
    ]

@app.post("/post_journal_entry")
def post_journal_entry(req: JournalEntryRequest, idempotency_key: Optional[str] = Header(None)):
    if idempotency_key and idempotency_key in processed_idempotency_keys:
        return processed_idempotency_keys[idempotency_key]

    result = {
        "status": "success",
        "entry_id": f"JE-{len(audit_events) + 1000}",
        "account": req.account,
        "amount": req.debit or req.credit,
        "reference": req.reference_id,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    if idempotency_key:
        processed_idempotency_keys[idempotency_key] = result
    audit_events.append({"action": "post_journal_entry", "data": result})
    return result

@app.post("/hold_payment")
def hold_payment(req: PaymentHoldRequest, idempotency_key: Optional[str] = Header(None)):
    if idempotency_key and idempotency_key in processed_idempotency_keys:
        return processed_idempotency_keys[idempotency_key]

    result = {
        "status": "success",
        "payment_id": req.payment_id,
        "hold_placed": True,
        "reason": req.reason,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    if idempotency_key:
        processed_idempotency_keys[idempotency_key] = result
    audit_events.append({"action": "hold_payment", "data": result})
    return result

@app.post("/create_credit_note")
def create_credit_note(req: CreditNoteRequest, idempotency_key: Optional[str] = Header(None)):
    if idempotency_key and idempotency_key in processed_idempotency_keys:
        return processed_idempotency_keys[idempotency_key]

    result = {
        "status": "success",
        "credit_note_id": f"CN-{len(audit_events) + 500}",
        "vendor": req.vendor,
        "amount": req.amount,
        "invoice_id": req.invoice_id,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    if idempotency_key:
        processed_idempotency_keys[idempotency_key] = result
    audit_events.append({"action": "create_credit_note", "data": result})
    return result

@app.post("/update_invoice_status")
def update_invoice_status(req: InvoiceStatusRequest, idempotency_key: Optional[str] = Header(None)):
    if idempotency_key and idempotency_key in processed_idempotency_keys:
        return processed_idempotency_keys[idempotency_key]

    result = {
        "status": "success",
        "invoice_id": req.invoice_id,
        "new_status": req.status,
        "notes": req.notes,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    if idempotency_key:
        processed_idempotency_keys[idempotency_key] = result
    audit_events.append({"action": "update_invoice_status", "data": result})
    return result
