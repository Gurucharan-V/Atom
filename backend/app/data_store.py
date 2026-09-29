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
        conclusion="Expected partial payment, first of two instalments agreed on 3 Sep with finance desk. Second payment of ₹40,000 is due on 3 October.",
        age="2h ago",
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
                summary="Formulated 4-step investigation plan across email archives and bank remitter notes.",
                ts="10:14:04"
            ),
            TraceEvent(
                id="tr-3",
                case_id="INV-20418",
                step="tool_use",
                state="done",
                tool_name="email_search_tool",
                duration_ms=320,
                summary="Queried email vector index for 'Acme Pvt Ltd INV-20418 instalment'",
                ts="10:14:07"
            ),
            TraceEvent(
                id="tr-4",
                case_id="INV-20418",
                step="tool_use",
                state="done",
                tool_name="bank_tool",
                duration_ms=180,
                summary="Retrieved NEFT transaction 88213 narration tokens confirming 'INST1 OF 2'",
                ts="10:14:09"
            ),
            TraceEvent(
                id="tr-5",
                case_id="INV-20418",
                step="decision",
                state="done",
                summary="Classified discrepancy as expected partial payment (Confidence 0.91).",
                ts="10:14:12"
            ),
            TraceEvent(
                id="tr-6",
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
        conclusion="Duplicate payment detected. The same invoice was paid via ICICI NEFT on 12 Sep and again via Axis RTGS on 14 Sep.",
        age="4h ago",
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
        conclusion="PO-0994 authorized ₹70,000 but invoice billed ₹85,000. Found vendor credit note agreement in email thread.",
        age="5h ago",
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
        evidence=[],
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
        conclusion="Invoice overdue by 14 days with zero incoming or outgoing remittances. Automated payment reminder issued under low-risk policy.",
        age="1d ago",
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
        conclusion="Unmatched bank credit of ₹62,000 received with ambiguous narration 'APX-DEP'. Fuzzy search matched 3 possible vendors.",
        age="1d ago",
        evidence=[],
        trace=[]
    )
]
