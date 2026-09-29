# Project Eclipse Hackathon: Autonomous Resolution of Cross-System Transaction Mismatches

> Genie X Hub presents **Project Eclipse Hackathon** (Genie Hive Private Limited)
> Tagline: *Build AI That Thinks, Acts & Automates, Not Just Answers.*

---

## 1. Problem Statement Explained

### 1.1 The challenge in one line
Build an **AI agent** that investigates transaction mismatches across invoices, payment records, purchase orders, emails, spreadsheets and ERP/accounting systems, resolves what it safely can, and escalates what it cannot, with a full audit trail.

### 1.2 What is a "transaction mismatch"?
A business event (buying, invoicing, paying) leaves traces in many systems. When those traces disagree, someone has to work out why.

| Source | What it holds |
|---|---|
| Purchase Order (PO) | What was ordered, agreed price, quantity, vendor |
| Goods Receipt / Delivery note | What was actually received |
| Invoice | What the vendor is billing |
| Bank / payment records | What was actually paid, when, how much |
| Emails | Context: "we agreed a 5% discount", "paying in two instalments" |
| Spreadsheets | Manual trackers, side-agreements, adjustments |
| ERP / accounting system | The official ledger |

**Example mismatches**
- Invoice says ₹1,00,000, payment shows ₹60,000 → **partial payment** (or a short-pay with a deduction)
- Same invoice paid twice → **duplicate payment**
- Invoice exists, no payment found → **missing payment**
- Payment exists, no invoice/PO → **unmatched payment**
- Invoice amount ≠ PO amount → **price/quantity variance**
- Amount differs only by tax, forex or bank fee → **explainable variance**
- Vendor name spelled differently across systems → **entity mismatch**

### 1.3 What the agent must do (from the brief)
1. **Ingest** data from multiple sources
2. **Match** transactions/entities across them
3. **Retrieve supporting evidence** (emails, notes, contracts)
4. **Classify** discrepancies using context (not just arithmetic)
5. **Detect** partial, duplicate, or missing payments
6. **Recommend** appropriate actions
7. **Maintain an auditable action trail**
8. **Require human approval** for consequential updates

### 1.4 Required workflow (Eclipse execution trace)
```
INPUT → UNDERSTAND → PLAN → USE TOOLS → ACT → VERIFY → RECOVER / ESCALATE
```
Submission trace to make visible: `INPUT → PLAN → TOOL USE → DECISION → ACTION → VERIFICATION`

### 1.5 Why it needs agents (not just rules or a chatbot)
- Evidence is **unstructured** (emails, PDFs) and **structured** (ledgers) at once.
- The investigation path **depends on what is found** (missing payment → search emails → check bank → check credit notes).
- Actions are **consequential** (posting journal entries, holding payments), so human approval and verification are essential.
- A chatbot can only *describe*; the agent must *investigate, act, verify*.

---

## 2. Existing Products in This Space

| Category | Products | Focus |
|---|---|---|
| Financial close & reconciliation | **BlackLine**, **Trintech (Cadency)**, **FloQast**, **Oracle Account Reconciliation**, **SAP Advanced Financial Closing** | Bank/GL/intercompany reconciliation, close checklists |
| Cash application & AR automation | **HighRadius**, **Billtrust**, **SAP Cash Application** | Matching incoming payments to open invoices |
| AP automation & invoice processing | **Coupa**, **Basware**, **Bill.com**, **Stampli**, **Tipalti**, **Tungsten Automation**, **Rossum** | Invoice capture, 2-way/3-way PO matching, approvals |
| Duplicate / erroneous payment recovery | **Xelix**, **AppZen**, **Vic.ai** | Detecting duplicate payments, anomalies, AI coding |
| SMB accounting | **QuickBooks**, **Xero**, **Zoho Books**, **Tally** | Bank feeds, rule-based auto-matching |
| Payments platforms | **Stripe**, **Razorpay** (reconciliation reports) | Settlement-to-order matching |
| RPA | **UiPath**, **Automation Anywhere** | Scripted cross-system workflows |

*Note: feature sets change often; verify current capabilities before quoting them in a submission.*

---

## 3. Features of Existing Products

- **Rule-based auto-matching** (exact / tolerance match on amount, date, reference number)
- **2-way / 3-way matching** (PO ↔ Invoice ↔ Goods Receipt)
- **OCR / document capture** for invoices
- **Bank feed integration** and statement import
- **Exception queues** and workflow routing to humans
- **Approval workflows** and role-based access
- **Duplicate detection** on invoice number / amount / vendor
- **Dashboards & close-status tracking**
- **ERP connectors** (SAP, Oracle, NetSuite, Tally)
- **Audit logs** of user actions
- **ML-assisted matching** (suggested matches from history)

---

## 4. Pain Points (Existing Gap)

| # | Pain point | Why it hurts |
|---|---|---|
| 1 | **Fragmented data** across ERP, bank, email, Excel | Analysts jump between 5+ tools to investigate one item |
| 2 | **Rules break on messy reality** | Partial payments, bundled payments, and short-pays fail exact-match rules |
| 3 | **Context lives in emails/chats** | Products don't read the "we agreed a discount" email, so the exception is opaque |
| 4 | **Exceptions pile up in manual queues** | Matching may reach ~80-90%, but the remaining exceptions consume most of the effort |
| 5 | **No explanation of *why*** | Tools flag "mismatch" but rarely classify root cause with evidence |
| 6 | **Duplicate/missing payments found late** | Discovered at audit or vendor complaint, causing cash leakage |
| 7 | **Weak audit trail for AI decisions** | Hard to trust or justify automated actions |
| 8 | **Heavy, expensive, enterprise-only** | SMBs and mid-market rely on spreadsheets |
| 9 | **Rigid setup** | New vendor formats or ERP changes need reconfiguration |
| 10 | **Autonomy vs safety trade-off** | Either fully manual or risky auto-posting; little "act with approval gates" |

---

## 5. Proposed Solution (Concept)

**Name (placeholder):** *Eclipse Reconciler* / *LedgerLens Agent*

A multi-agent system that treats each mismatch as an **investigation case**:

1. **Ingestion Agent**: pulls invoices, POs, bank/payment records, emails, spreadsheets, ERP exports; normalizes into a common schema.
2. **Matching Agent**: entity resolution (fuzzy vendor names, reference numbers) and candidate matching with confidence scores.
3. **Investigator Agent**: plans an investigation per case, calls tools (search emails, query ledger, check credit notes, look up bank txn), gathers evidence.
4. **Classifier Agent**: labels the discrepancy (partial, duplicate, missing, price variance, tax/forex, unmatched) with reasoning and cited evidence.
5. **Action Planner**: recommends actions (request remittance, raise credit note, hold payment, post adjustment, contact vendor).
6. **Approval Gate (human-in-the-loop)**: consequential actions require approval; low-risk ones may auto-execute under policy.
7. **Verifier**: re-checks state after action (did the ledger balance? did the mismatch clear?); retries or escalates.
8. **Audit Trail**: immutable log of every input, plan step, tool call, decision, approval, and verification.

---

## 6. Unique Features (Differentiators)

1. **Evidence-grounded classification**: every verdict cites the exact invoice line, bank row, or email snippet.
2. **Investigation planning**: the agent chooses its next tool based on findings (not a fixed pipeline).
3. **Visible execution trace**: `INPUT → PLAN → TOOL USE → DECISION → ACTION → VERIFICATION` shown live in the UI (directly maps to judging criteria).
4. **Tiered autonomy policy**: auto-resolve low-risk/high-confidence cases; require approval above configurable amount/risk thresholds.
5. **Post-action verification loop**: agent confirms the fix worked, otherwise rolls back or escalates.
6. **Multi-payment reasoning**: detects one payment covering many invoices and many payments settling one invoice.
7. **Unstructured + structured fusion**: reads emails/PDF notes alongside ledger data.
8. **Failure handling built in**: missing data, tool timeouts, low confidence → retry, fallback source, or escalate with a summary.
9. **Explainable audit report** exportable per case (PDF/JSON).
10. **Simulation mode**: dry-run actions before touching the ERP.

---

## 7. Mapping to Judging Criteria

| Criterion | Weight | How this project scores |
|---|---|---|
| Problem Understanding & Relevance | 10% | Real finance-ops pain; clear users (AP/AR teams, finance controllers) |
| Agentic Reasoning & Planning | 20% | Per-case investigation plans, dynamic tool selection, visible trace |
| Tool / API / System Integration | 15% | ERP mock API, bank CSV/API, email reader, vector store, spreadsheets |
| Autonomous Task Completion | 20% | End-to-end: ingest → classify → act → verify without hand-holding |
| Reliability & Failure Handling | 15% | Retries, confidence thresholds, escalation, idempotent actions, rollback |
| Innovation | 10% | Evidence-cited reasoning, tiered autonomy, verification loop |
| UX / Demonstration | 10% | Live trace view, case dashboard, approval inbox, demo video |

---

## 8. Submission Checklist

- [ ] Working prototype (end-to-end demo)
- [ ] Problem and solution explanation
- [ ] Architecture / workflow diagram
- [ ] AI / agent architecture
- [ ] Tools and APIs used
- [ ] Repository / code
- [ ] Demo video or live demo
- [ ] Known limitations
- [ ] Safety controls (approval gates, audit log, PII masking, dry-run)
- [ ] Future scope

---

## 9. Suggested Tech Stack

| Layer | Options |
|---|---|
| LLM | Claude / GPT / Gemini API, or open-source (Llama, Qwen) |
| Agent framework | LangGraph, CrewAI, or a custom tool-calling loop |
| Backend | Python + FastAPI |
| Data | PostgreSQL (cases, audit log), Pandas for ingestion |
| Retrieval | ChromaDB / pgvector for emails and documents |
| Matching | RapidFuzz (fuzzy match), custom scoring |
| Document parsing | pdfplumber, Tesseract / vision-LLM for invoice PDFs |
| Frontend | React + Tailwind, or Streamlit for speed |
| Mock ERP | FastAPI service or SQLite-backed mock |
| Deployment | Docker Compose |

---

## 10. Folder Structure

```
eclipse-reconciler/
├── README.md
├── docker-compose.yml
├── .env.example
├── pyproject.toml / requirements.txt
│
├── docs/
│   ├── problem_statement.md
│   ├── architecture.md
│   ├── agent_design.md
│   ├── safety_controls.md
│   ├── limitations_and_future_scope.md
│   └── diagrams/
│       ├── architecture.png
│       └── workflow_trace.png
│
├── data/
│   ├── sample/
│   │   ├── invoices/            # PDFs / JSON
│   │   ├── purchase_orders.csv
│   │   ├── bank_statements.csv
│   │   ├── payments.csv
│   │   ├── erp_ledger.csv
│   │   ├── emails/              # .eml / .txt with vendor context
│   │   └── spreadsheets/        # manual trackers (.xlsx)
│   └── scenarios/               # seeded mismatch cases for demo
│       ├── partial_payment.json
│       ├── duplicate_payment.json
│       ├── missing_payment.json
│       ├── price_variance.json
│       └── unmatched_payment.json
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── routes_cases.py
│   │   │   ├── routes_approvals.py
│   │   │   ├── routes_ingest.py
│   │   │   └── routes_audit.py
│   │   ├── agents/
│   │   │   ├── orchestrator.py      # plan → tool use → decide → act → verify loop
│   │   │   ├── ingestion_agent.py
│   │   │   ├── matching_agent.py
│   │   │   ├── investigator_agent.py
│   │   │   ├── classifier_agent.py
│   │   │   ├── action_planner.py
│   │   │   └── verifier_agent.py
│   │   ├── tools/
│   │   │   ├── ledger_tool.py       # query/update ERP
│   │   │   ├── bank_tool.py
│   │   │   ├── invoice_tool.py
│   │   │   ├── po_tool.py
│   │   │   ├── email_search_tool.py # RAG over emails
│   │   │   ├── spreadsheet_tool.py
│   │   │   └── notify_tool.py       # email/Slack mock
│   │   ├── matching/
│   │   │   ├── entity_resolution.py
│   │   │   ├── scoring.py
│   │   │   └── rules.py             # tolerance, tax, forex rules
│   │   ├── policy/
│   │   │   ├── autonomy_policy.py   # thresholds for auto vs approval
│   │   │   └── guardrails.py
│   │   ├── audit/
│   │   │   ├── trace_logger.py      # INPUT→PLAN→TOOL→DECISION→ACTION→VERIFY
│   │   │   └── report_generator.py
│   │   ├── models/                  # Pydantic / SQLAlchemy schemas
│   │   │   ├── transaction.py
│   │   │   ├── case.py
│   │   │   ├── evidence.py
│   │   │   └── action.py
│   │   ├── retrieval/
│   │   │   ├── embedder.py
│   │   │   └── vector_store.py
│   │   ├── prompts/
│   │   │   ├── planner.md
│   │   │   ├── classifier.md
│   │   │   └── verifier.md
│   │   └── db/
│   │       ├── session.py
│   │       └── migrations/
│   └── tests/
│       ├── test_matching.py
│       ├── test_classifier.py
│       ├── test_policy.py
│       ├── test_failure_handling.py
│       └── test_end_to_end.py
│
├── mock_erp/
│   ├── main.py                  # mock ERP API (post journal, hold payment)
│   └── seed.sql
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── CaseDetail.tsx   # live execution trace
│       │   ├── ApprovalInbox.tsx
│       │   └── AuditLog.tsx
│       ├── components/
│       │   ├── TraceTimeline.tsx
│       │   ├── EvidencePanel.tsx
│       │   └── ActionCard.tsx
│       └── api/client.ts
│
├── scripts/
│   ├── generate_synthetic_data.py
│   ├── run_demo.py
│   └── seed_scenarios.py
│
├── evals/
│   ├── labeled_cases.json       # ground-truth mismatch types
│   └── evaluate.py              # accuracy, auto-resolution rate, escalation rate
│
└── demo/
    ├── demo_script.md
    └── demo_video_link.md
```

---

## 11. Build Plan (Suggested)

**Round 1 (Idea):** problem, architecture diagram, agent design, trace example, impact.

**Round 2 (Build), priority order:**
1. Synthetic data + mock ERP (5 mismatch scenarios)
2. Matching + rules baseline
3. Orchestrator loop with tool calling and trace logging
4. Classifier with evidence citations
5. Approval gate + action execution + verification
6. Failure handling (tool errors, low confidence, missing data)
7. UI: live trace, approval inbox, audit report
8. Demo video, README, limitations, future scope

---

## 12. Safety Controls, Limitations, Future Scope

**Safety controls**
- Human approval for any ledger write or payment hold above threshold
- Dry-run mode and idempotent actions
- Full immutable audit log
- Confidence thresholds with mandatory escalation below them
- PII/bank-detail masking in prompts and logs
- Least-privilege tool permissions (read-only by default)

**Known limitations (be honest in the submission)**
- Demo uses synthetic/mock data and a mock ERP
- Accuracy depends on data quality and OCR
- LLM reasoning can err, so the verifier and human gate exist for that reason

**Future scope**
- Live connectors (SAP, Tally, Zoho, NetSuite), bank APIs
- Vendor-facing auto-communication with approval
- Learning from human approve/reject feedback
- Anomaly and fraud detection layer
- Multi-currency, multi-entity, intercompany support
