"""
Atom Reconciler Backend - In-Memory / Seed Data Store
Stores cases with multimodal evidence (Invoices, Bank rows, Emails, Call Transcripts, WhatsApp),
confidence evolution history, and raw source vs matched records for Two-Pane Diff.
"""
from typing import List, Optional
from .models.models import Case, Evidence, ProposedAction, TraceEvent

DEFAULT_CASES = [
    Case(
        id="INV-20418",
        vendor="Acme Pvt Ltd",
        invoice_id="INV-20418",
        mismatch_type="partial",
        invoice_amount=100000.0,
        paid_amount=60000.0,
        gap=40000.0,
        currency="INR",
        status="awaiting_approval",
        confidence=0.91,
        prior_confidence=0.67,
        confidence_reason="Confidence rose from 0.67 to 0.91 after voice call transcript with CFO Rajesh Kumar was ingested and corroborated with email thread",
        conclusion="Expected partial payment, first of two instalments agreed on 3 Sep with finance desk. Second payment of ₹40,000 is due on 3 October.",
        age="2h ago",
        source_record={
            "invoice_number": "INV-20418",
            "invoice_date": "01 Sep 2026",
            "due_date": "01 Oct 2026",
            "vendor_name": "Acme Pvt Ltd",
            "gstin": "27AABCU9603R1ZX",
            "billed_amount": "₹1,00,000.00",
            "payment_terms": "Net 30 · Single Disbursement",
            "line_item": "Enterprise Cloud & Hosting Services (Q3)",
            "po_reference": "PO-2026-0811"
        },
        matched_record={
            "transaction_ref": "HDFC-NEFT-88213",
            "payment_date": "04 Sep 2026",
            "value_date": "04 Sep 2026",
            "remitter": "Acme Pvt Ltd (A/c ...4491)",
            "remitted_amount": "₹60,000.00",
            "narration": "NEFT Cr: INV-20418 INST1 OF 2 REF ACM-559",
            "bank_clearing_status": "Cleared · RBI Settlement Batch #4",
            "payment_channel": "NEFT Corporate NetBanking"
        },
        proposed_action=ProposedAction(
            action_type="schedule_followup",
            title="Schedule follow-up for 3 Oct",
            impact_statement="This will register an expected instalment #2 reminder for ₹40,000 due 3 Oct in the ERP calendar.",
            target_field="Payment Schedule",
            old_value="Single Payment (Overdue ₹40,000)",
            new_value="Instalment 1/2 Confirmed · Due Date: 03 Oct 2026",
            requires_approval=True,
            status="pending"
        ),
        evidence=[
            Evidence(
                id="ev-1",
                source_type="invoice",
                title="Invoice line 1",
                ref_id="INV-20418:L1",
                snippet="Item: Enterprise Cloud & Hosting Services, Gross amount: ₹1,00,000. Payment terms: Net 30.",
                highlight="₹1,00,000",
                date="01 Sep 2026"
            ),
            Evidence(
                id="ev-2",
                source_type="bank",
                title="Bank row 88213",
                ref_id="HDFC-NEFT-88213",
                snippet="NEFT Cr: ₹60,000 from Acme Pvt Ltd. Narration: INV-20418 INST1 OF 2 REF ACM-559.",
                highlight="₹60,000 from Acme Pvt Ltd",
                date="04 Sep 2026"
            ),
            Evidence(
                id="ev-3",
                source_type="email",
                title="Email thread: 'Re: Payment schedule'",
                ref_id="EML-402",
                snippet="From: rajesh.k@acmepvtltd.com — 'As agreed with your accounts lead, we are splitting invoice INV-20418 into two instalments: ₹60,000 immediately, and the remaining ₹40,000 by 3 October.'",
                highlight="splitting invoice INV-20418 into two instalments",
                date="03 Sep 2026"
            ),
            Evidence(
                id="ev-4",
                source_type="call",
                title="Phone Call: Settlement Confirmation",
                ref_id="CALL-REC-01",
                snippet="Rajesh Kumar [CFO - Acme]: 'Yes, we agreed to split the ₹1,00,000 into two: release ₹60,000 right now, and the remaining ₹40,000 by 3 October.'",
                highlight="split the ₹1,00,000 into two: release ₹60,000 right now, and the remaining ₹40,000 by 3 October",
                date="03 Sep 2026 15:30",
                speaker="Rajesh Kumar [CFO - Acme Pvt Ltd]",
                duration_text="02:45 min",
                timestamp_seconds=68,
                audio_url="/audio/acme_call_sep3.mp3"
            ),
            Evidence(
                id="ev-5",
                source_type="whatsapp",
                title="WhatsApp Chat: Finance Desk Support",
                ref_id="WA-MSG-8841",
                snippet="[Whatsapp — Priya [CFO], 3 Sep 12:41 PM]: Rajesh confirmed they'll pay ₹60k today and ₹40k by 3 Oct. I told him fine, marking payment schedule accordingly.",
                highlight="Rajesh confirmed they'll pay ₹60k today and ₹40k by 3 Oct",
                date="03 Sep 2026 12:41",
                speaker="Priya [Lead Accounts - Internal]"
            )
        ],
        trace=[
            TraceEvent(
                id="tr-1",
                case_id="INV-20418",
                step="input",
                state="done",
                summary="Received mismatch signal from daily reconciliation sweep: ₹40,000 gap on INV-20418.",
                ts="10:14:02"
            ),
            TraceEvent(
                id="tr-2",
                case_id="INV-20418",
                step="plan",
                state="done",
                summary="Formulated 5-step investigation plan across audio call archives, WhatsApp exports, and bank clearing.",
                ts="10:14:04"
            ),
            TraceEvent(
                id="tr-3",
                case_id="INV-20418",
                step="tool_use",
                state="done",
                tool_name="call_transcript_tool",
                duration_ms=410,
                summary="Ingested & searched call transcript CALL-REC-01. Found verbal instalment pact at 01:08 timestamp.",
                payload={"audio_ref": "CALL-REC-01", "timestamp": "01:08", "confidence_jump": "+0.24"},
                evidence_refs=["ev-4"],
                ts="10:14:06"
            ),
            TraceEvent(
                id="tr-4",
                case_id="INV-20418",
                step="tool_use",
                state="done",
                tool_name="email_search_tool",
                duration_ms=320,
                summary="Queried email vector index for 'Acme Pvt Ltd INV-20418 instalment'. Corroborated verbal call.",
                ts="10:14:08"
            ),
            TraceEvent(
                id="tr-5",
                case_id="INV-20418",
                step="tool_use",
                state="done",
                tool_name="bank_tool",
                duration_ms=180,
                summary="Retrieved NEFT transaction 88213 narration tokens confirming 'INST1 OF 2'",
                ts="10:14:09"
            ),
            TraceEvent(
                id="tr-6",
                case_id="INV-20418",
                step="decision",
                state="done",
                summary="Classified discrepancy as expected partial payment. Confidence jumped from 0.67 -> 0.91 after call evidence corroboration.",
                ts="10:14:12"
            ),
            TraceEvent(
                id="tr-7",
                case_id="INV-20418",
                step="action",
                state="pending",
                summary="Proposed scheduling follow-up for ₹40,000 balance due on 3 October. Awaiting your approval.",
                ts="10:14:14"
            )
        ]
    ),
    Case(
        id="INV-19042",
        vendor="LogiTech Solutions India",
        invoice_id="INV-19042",
        mismatch_type="duplicate",
        invoice_amount=75000.0,
        paid_amount=150000.0,
        gap=75000.0,
        currency="INR",
        status="awaiting_approval",
        confidence=0.98,
        prior_confidence=0.74,
        confidence_reason="Confidence rose from 0.74 to 0.98 after Axis Bank RTGS clearing logs confirmed identical UTR to ICICI NEFT batch",
        conclusion="Duplicate payment detected. The same invoice was paid via ICICI NEFT on 12 Sep and again via Axis RTGS on 14 Sep.",
        age="4h ago",
        source_record={
            "invoice_number": "INV-19042",
            "invoice_date": "08 Sep 2026",
            "vendor_name": "LogiTech Solutions India",
            "billed_amount": "₹75,000.00",
            "authorized_po": "PO-LOGI-8802",
            "service_description": "Warehouse Logistics Management System - Annual Maintenance"
        },
        matched_record={
            "transaction_1": "ICICI NEFT (Ref: ICIC0001092) · ₹75,000 on 12 Sep",
            "transaction_2": "Axis RTGS (Ref: AXIS8820199) · ₹75,000 on 14 Sep",
            "total_disbursed": "₹1,50,000.00",
            "overpayment": "₹75,000.00 (100% duplicate)"
        },
        proposed_action=ProposedAction(
            action_type="payment_hold",
            title="Hold disbursement & request recovery",
            impact_statement="This will place an immediate payment hold on upcoming disbursement ₹75,000 and issue a formal refund request to LogiTech Solutions India.",
            target_field="Disbursement Status",
            old_value="Active Batch #4410",
            new_value="Hold Placed · Duplicate Recovery Triggered",
            requires_approval=True,
            status="pending"
        ),
        evidence=[
            Evidence(
                id="ev-21",
                source_type="invoice",
                title="Invoice INV-19042",
                ref_id="INV-19042",
                snippet="Total payable: ₹75,000 for Warehouse Logistics Management System.",
                highlight="₹75,000",
                date="08 Sep 2026"
            ),
            Evidence(
                id="ev-22",
                source_type="bank",
                title="Bank Payment 1: ICICI NEFT",
                ref_id="ICIC0001092",
                snippet="Paid ₹75,000.00 on 12 Sep 2026. Narration: LOGITECH INV-19042 BATCH 1",
                highlight="₹75,000.00 on 12 Sep 2026",
                date="12 Sep 2026"
            ),
            Evidence(
                id="ev-23",
                source_type="bank",
                title="Bank Payment 2: Axis RTGS",
                ref_id="AXIS8820199",
                snippet="Paid ₹75,000.00 on 14 Sep 2026. Narration: LOGITECH INV-19042 BATCH 2",
                highlight="Paid ₹75,000.00 on 14 Sep 2026",
                date="14 Sep 2026"
            )
        ],
        trace=[]
    ),
    Case(
        id="INV-22108",
        vendor="Tata Communications Services",
        invoice_id="INV-22108",
        mismatch_type="tax_fx",
        invoice_amount=100000.0,
        paid_amount=118000.0,
        gap=18000.0,
        currency="INR",
        status="resolved",
        confidence=0.96,
        prior_confidence=0.62,
        confidence_reason="Confidence surged from 0.62 to 0.96 after GST Auto-Explainer verified exact 18% GST (₹18,000) slab",
        conclusion="GST Auto-Explainer: Discrepancy of ₹18,000 corresponds to statutory 18% GST on base invoice ₹1,00,000. Auto-resolved with Input Tax Credit (ITC) journal entry.",
        age="3h ago",
        source_record={
            "invoice_number": "INV-22108",
            "invoice_date": "10 Sep 2026",
            "billed_amount": "₹1,00,000.00 (Base Taxable Value)",
            "gst_rate_clause": "GST extra at 18% as applicable",
            "sac_code": "998313 - Information Technology Consulting"
        },
        matched_record={
            "bank_disbursement": "₹1,18,000.00 via SBI Corporate RTGS",
            "base_taxable": "₹1,00,000.00",
            "cgst_9pct": "₹9,000.00",
            "sgst_9pct": "₹9,000.00",
            "total_gst": "₹18,000.00 (18% Slab Match)",
            "gstr_2b_status": "Reflected in GSTR-2B filing for Sep 2026"
        },
        proposed_action=ProposedAction(
            action_type="journal_entry",
            title="Book ₹18,000 Input Tax Credit (ITC) Journal Entry",
            impact_statement="This books ₹18,000 to GST Input Tax Credit ledger (CGST ₹9k + SGST ₹9k) and reconciles the variance autonomously.",
            target_field="GST Input Tax Credit Ledger",
            old_value="Pending Reconciliation",
            new_value="ITC Claimed · Account Reconciled",
            requires_approval=False,
            status="auto_applied"
        ),
        evidence=[
            Evidence(
                id="ev-31",
                source_type="invoice",
                title="Invoice INV-22108 (Base Value)",
                ref_id="INV-22108",
                snippet="Taxable base value: ₹1,00,000. Applicable GST: 18% (SAC 998313).",
                highlight="Taxable base value: ₹1,00,000. Applicable GST: 18%",
                date="10 Sep 2026"
            ),
            Evidence(
                id="ev-32",
                source_type="bank",
                title="SBI Remittance Advice",
                ref_id="SBI-RTGS-99014",
                snippet="Total remittance: ₹1,18,000. Narration: INV-22108 INCL 18% GST.",
                highlight="₹1,18,000. Narration: INV-22108 INCL 18% GST",
                date="15 Sep 2026"
            )
        ],
        trace=[]
    ),
    Case(
        id="INV-18890",
        vendor="CloudScale Infra Services",
        invoice_id="INV-18890",
        mismatch_type="price_variance",
        invoice_amount=85000.0,
        paid_amount=85000.0,
        gap=15000.0,
        currency="INR",
        status="awaiting_approval",
        confidence=0.89,
        prior_confidence=0.55,
        confidence_reason="Confidence rose from 0.55 to 0.89 after phone call transcript CALL-REC-02 confirmed overbilling on bandwidth tier",
        conclusion="PO-0994 authorized ₹70,000 but invoice billed ₹85,000. Found vendor credit note agreement in call transcript and email.",
        age="5h ago",
        source_record={
            "invoice_number": "INV-18890",
            "billed_amount": "₹85,000.00",
            "authorized_po_amount": "₹70,000.00 (PO-0994)",
            "variance": "₹15,000.00 unapproved price escalation"
        },
        matched_record={
            "vendor_call_agreement": "Agreed to issue ₹15,000 credit note (Call 14 Sep)",
            "proposed_credit_note": "CRN-CLOUD-2026-04 for ₹15,000.00"
        },
        proposed_action=ProposedAction(
            action_type="credit_note",
            title="Post ₹15,000 credit note in ledger",
            impact_statement="This will post a ₹15,000 credit note to CloudScale Infra Services in the ERP ledger.",
            target_field="Vendor Credit Balance",
            old_value="₹0.00 Credit",
            new_value="₹15,000.00 Credit Posted",
            requires_approval=True,
            status="pending"
        ),
        evidence=[
            Evidence(
                id="ev-41",
                source_type="call",
                title="Recorded Call: Pricing Overbill Review",
                ref_id="CALL-REC-02",
                snippet="Sunil Nair [Billing Head - CloudScale]: 'Hi team, regarding the ₹15,000 discrepancy between PO-0994 and invoice INV-18890, we overbilled on bandwidth tiering. We will issue a ₹15,000 credit note immediately.'",
                highlight="we overbilled on bandwidth tiering. We will issue a ₹15,000 credit note immediately",
                date="14 Sep 2026 11:15",
                speaker="Sunil Nair [Billing Head - CloudScale]",
                duration_text="02:00 min",
                timestamp_seconds=30,
                audio_url="/audio/cloudscale_call_sep14.mp3"
            )
        ],
        trace=[]
    ),
    Case(
        id="INV-21004",
        vendor="Bharat Power & Electricals",
        invoice_id="INV-21004",
        mismatch_type="missing",
        invoice_amount=120000.0,
        paid_amount=0.0,
        gap=120000.0,
        currency="INR",
        status="resolved",
        confidence=0.94,
        prior_confidence=0.94,
        confidence_reason="Confidence steady at 0.94 based on clear 14-day aging and zero remittance history",
        conclusion="Invoice overdue by 14 days with zero incoming or outgoing remittances. Automated payment reminder issued under low-risk policy.",
        age="1d ago",
        source_record={
            "invoice_number": "INV-21004",
            "billed_amount": "₹1,20,000.00",
            "aging_days": "14 days overdue"
        },
        matched_record={
            "bank_clearing": "₹0.00 (No clearing match found in 30-day window)"
        },
        evidence=[],
        trace=[]
    ),
    Case(
        id="TXN-90211",
        vendor="Apex Global Supplies",
        invoice_id="UNMATCHED-90211",
        mismatch_type="unmatched",
        invoice_amount=0.0,
        paid_amount=62000.0,
        gap=62000.0,
        currency="INR",
        status="escalated",
        confidence=0.54,
        prior_confidence=0.72,
        confidence_reason="Confidence decayed from 0.72 down to 0.54 after vendor entity ambiguity could not be resolved from remittance narration",
        conclusion="Unmatched bank credit of ₹62,000 received with ambiguous narration 'APX-DEP'. Fuzzy search matched 3 possible vendors.",
        age="1d ago",
        source_record={
            "narration": "APX-DEP 62000 NEFT",
            "unmatched_amount": "₹62,000.00"
        },
        matched_record={
            "candidates": "Apex Global Supplies (74% match), Apex Logistics (71% match), Apex Pharma (68% match)"
        },
        evidence=[],
        trace=[]
    )
]

# In-memory working copy
CASES_DB: List[Case] = [c.model_copy(deep=True) for c in DEFAULT_CASES]

def get_all_cases() -> List[Case]:
    return CASES_DB

def get_case_by_id(case_id: str) -> Optional[Case]:
    for c in CASES_DB:
        if c.id == case_id:
            return c
    return None

def update_case(case: Case) -> None:
    for idx, c in enumerate(CASES_DB):
        if c.id == case.id:
            CASES_DB[idx] = case
            return
    CASES_DB.append(case)
