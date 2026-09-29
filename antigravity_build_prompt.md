# Antigravity Build Prompt: Eclipse Reconciler

> How to use: put this file in your project root (e.g. as `PROMPT.md`), open the folder in Antigravity, and paste the **Master Prompt** (Section 1) into the Agent Manager. Then feed the **Phase Prompts** (Section 4) one at a time, reviewing the artifacts/diffs after each phase before moving on.
> Optional: copy Section 2 (Rules) into `.agent/rules/project.md` (or your workspace rules file) so every agent session follows it.

---

## 1. MASTER PROMPT (paste first)

```
You are a senior AI engineer building a hackathon-winning prototype called "Eclipse Reconciler".

## Context
Hackathon: Project Eclipse Hackathon (Genie X Hub / Genie Hive).
Challenge: "Autonomous Resolution of Cross-System Transaction Mismatches".
Goal: an AI agent that investigates transaction mismatches across invoices, payment records,
purchase orders, emails, spreadsheets and an ERP/accounting system, resolves what it safely can,
requests human approval for consequential actions, verifies outcomes, and keeps an auditable trail.

This must be a REAL agentic system (plan -> tool use -> decision -> action -> verification),
not a chatbot and not a CRUD app with an "AI" label.

## Required agent capabilities
1. Ingest data from multiple sources (CSV, XLSX, JSON, PDF/text invoices, .eml/.txt emails, mock ERP API)
2. Match transactions/entities across sources (fuzzy vendor names, reference numbers, amounts, dates)
3. Retrieve supporting evidence (emails/notes) via search/RAG
4. Classify discrepancies using context: partial payment, duplicate payment, missing payment,
   unmatched payment, price/quantity variance, tax/forex/bank-fee variance, entity mismatch
5. Recommend actions with reasoning and cited evidence
6. Maintain an immutable, auditable action trail
7. Require human approval for consequential updates (ledger writes, payment holds, credit notes)
8. Verify results after acting; on failure retry, fall back, or escalate to a human

## Execution trace (must be visible in logs AND UI, for every case)
INPUT -> PLAN -> TOOL USE -> DECISION -> ACTION -> VERIFICATION
(with RECOVER / ESCALATE branches)

## Judging criteria to optimize for
Problem relevance 10% | Agentic reasoning & planning 20% | Tool/API integration 15% |
Autonomous task completion 20% | Reliability & failure handling 15% | Innovation 10% | UX/demo 10%

## Tech stack
- Backend: Python 3.11+, FastAPI, Pydantic, SQLAlchemy + SQLite (Postgres-compatible)
- Agent loop: custom tool-calling orchestrator (LangGraph acceptable if it stays simple)
- LLM: provider-agnostic wrapper in `backend/app/llm/client.py`, configured via .env
  (must support a deterministic MOCK mode so the demo works without an API key)
- Retrieval: ChromaDB (or simple TF-IDF fallback) over emails and notes
- Matching: RapidFuzz
- Frontend: React + Vite + Tailwind
- Mock ERP: separate FastAPI service in `mock_erp/`
- Packaging: Docker Compose + a one-command demo script

## Working style
- Work in phases. Before each phase, produce a short implementation plan artifact.
- After each phase, run tests and the demo scenarios, then summarize what works and what doesn't.
- Do not proceed to the next phase until the current one runs end-to-end.
- Keep the code simple, typed, and commented where logic is non-obvious.
- Never fabricate results: if a tool fails, the agent must log it and recover or escalate.

Start with Phase 0 (scaffold + synthetic data). Read PROMPT.md for the full spec and folder structure.
```

---

## 2. PROJECT RULES (save as `.agent/rules/project.md` or workspace rules)

```
# Eclipse Reconciler: Rules for all agents

1. SAFETY FIRST: Any write to the ERP (post journal, hold payment, raise credit note, update status)
   must go through `policy/autonomy_policy.py` and, above threshold or below confidence, require
   human approval via the approvals queue. Default = read-only.
2. AUDIT EVERYTHING: Every step writes an event to `audit/trace_logger.py`:
   {case_id, step_type (INPUT|PLAN|TOOL_USE|DECISION|ACTION|VERIFICATION|RECOVER|ESCALATE),
   payload, evidence_refs, timestamp}. Events are append-only.
3. EVIDENCE-CITED DECISIONS: Every classification and recommendation must reference concrete
   evidence IDs (invoice line, bank row, email id + snippet). No uncited claims.
4. IDEMPOTENT ACTIONS: Actions carry an idempotency key. Re-running never double-posts.
5. FAILURE HANDLING: Tools can time out, return empty, or return malformed data.
   Handle with bounded retries -> fallback source -> escalate with a summary. Never crash the loop.
6. DRY-RUN MODE: A global flag makes all actions simulate without touching the mock ERP.
7. NO SECRETS IN CODE: use .env; provide .env.example. Mask bank account numbers in logs/prompts.
8. LLM OUTPUTS ARE STRUCTURED: validate with Pydantic; on invalid output, retry once, then escalate.
9. MOCK LLM MODE must produce deterministic, realistic outputs for all 5 demo scenarios.
10. TESTS: every phase adds tests. Do not leave failing tests.
11. Keep files small and focused; follow the folder structure exactly.
```

---

## 3. FOLDER STRUCTURE (scaffold exactly this)

```
eclipse-reconciler/
├── README.md
├── PROMPT.md
├── docker-compose.yml
├── .env.example
├── requirements.txt
│
├── docs/
│   ├── problem_statement.md
│   ├── architecture.md
│   ├── agent_design.md
│   ├── safety_controls.md
│   ├── limitations_and_future_scope.md
│   └── diagrams/
│
├── data/
│   ├── sample/
│   │   ├── invoices/
│   │   ├── purchase_orders.csv
│   │   ├── bank_statements.csv
│   │   ├── payments.csv
│   │   ├── erp_ledger.csv
│   │   ├── emails/
│   │   └── spreadsheets/
│   └── scenarios/
│       ├── partial_payment.json
│       ├── duplicate_payment.json
│       ├── missing_payment.json
│       ├── price_variance.json
│       └── unmatched_payment.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/            (routes_cases, routes_approvals, routes_ingest, routes_audit)
│   │   ├── agents/         (orchestrator, ingestion_agent, matching_agent,
│   │   │                    investigator_agent, classifier_agent, action_planner, verifier_agent)
│   │   ├── tools/          (ledger_tool, bank_tool, invoice_tool, po_tool,
│   │   │                    email_search_tool, spreadsheet_tool, notify_tool)
│   │   ├── matching/       (entity_resolution, scoring, rules)
│   │   ├── policy/         (autonomy_policy, guardrails)
│   │   ├── audit/          (trace_logger, report_generator)
│   │   ├── models/         (transaction, case, evidence, action)
│   │   ├── retrieval/      (embedder, vector_store)
│   │   ├── llm/            (client, mock_llm)
│   │   ├── prompts/        (planner.md, classifier.md, verifier.md)
│   │   └── db/             (session, migrations)
│   └── tests/
│
├── mock_erp/               (main.py, seed.sql)
├── frontend/               (Dashboard, CaseDetail with live trace, ApprovalInbox, AuditLog)
├── scripts/                (generate_synthetic_data.py, seed_scenarios.py, run_demo.py)
├── evals/                  (labeled_cases.json, evaluate.py)
└── demo/                   (demo_script.md)
```

---

## 4. PHASE PROMPTS (paste one at a time)

### Phase 0: Scaffold + Synthetic Data
```
Phase 0. Create the folder structure from PROMPT.md Section 3, requirements.txt, .env.example,
and docker-compose.yml. Then write scripts/generate_synthetic_data.py that generates realistic data:
- ~40 vendors (with name variants like "Acme Pvt Ltd" / "ACME Private Limited" / "Acme P. Ltd.")
- ~120 POs, ~150 invoices, ~150 payments, bank statement rows, ERP ledger rows
- ~30 emails containing context (agreed discounts, instalment plans, credit notes, remittance advice)
- Seeded mismatches, at least 4 of each type: partial, duplicate, missing, unmatched, price variance,
  plus tax/forex variance and a few genuinely ambiguous cases that SHOULD be escalated
- Ground-truth labels in evals/labeled_cases.json
- Use INR as the base currency with a few USD transactions.
Write the 5 named scenario files in data/scenarios/ as the demo hero cases.
Deliver: a short plan artifact first, then code, then a summary of the dataset.
```

### Phase 1: Mock ERP + Data Models + Ingestion
```
Phase 1. Build mock_erp/ (FastAPI + SQLite): endpoints to read invoices/POs/ledger/payments and to
post_journal_entry, hold_payment, create_credit_note, update_invoice_status. All writes must be
idempotent (Idempotency-Key header) and logged.
Then build backend models (Pydantic + SQLAlchemy) for Transaction, Case, Evidence, Action, AuditEvent,
and agents/ingestion_agent.py that loads CSV/XLSX/JSON/PDF-text/emails into a normalized schema.
Add tests for parsing, malformed rows, and missing files (should log and continue, not crash).
```

### Phase 2: Matching Engine
```
Phase 2. Implement matching/entity_resolution.py (fuzzy vendor matching with RapidFuzz plus normalization
of suffixes like Pvt/Private/Ltd), matching/scoring.py (confidence from reference number, amount,
date proximity, vendor similarity), and matching/rules.py (tolerances, tax and forex handling).
agents/matching_agent.py should output for each invoice: matched payments, unmatched invoices,
unmatched payments, and a confidence score. Handle one-to-many and many-to-one payment relationships.
Add tests with the labeled scenarios and report precision/recall.
```

### Phase 3: Tools + Retrieval
```
Phase 3. Implement all tools in backend/app/tools/ with a uniform interface
(name, description, input schema, run() -> ToolResult{ok, data, error}). Include timeouts and
bounded retries. Implement retrieval/ (embeddings or TF-IDF fallback) and tools/email_search_tool.py
that returns top-k email snippets with ids and relevance. Register tools in a tool registry the
orchestrator can list and call. Tests: simulate tool timeout, empty result, and malformed result.
```

### Phase 4: LLM Client + Orchestrator (the core)
```
Phase 4. Build llm/client.py (provider-agnostic, structured JSON output validated by Pydantic, retry once
on invalid output) and llm/mock_llm.py (deterministic, scenario-aware). Then build agents/orchestrator.py
implementing the loop per case:
 1. INPUT: load case context
 2. PLAN: LLM produces an investigation plan (ordered tool calls with reasons)
 3. TOOL USE: execute tools, collect evidence, allow the plan to adapt based on findings
    (e.g., missing payment -> search emails -> check bank -> check credit notes)
 4. DECISION: classifier_agent labels the discrepancy with confidence and cited evidence
 5. ACTION: action_planner proposes actions; policy/autonomy_policy.py decides auto vs approval
 6. VERIFICATION: verifier_agent re-queries the ERP to confirm the mismatch is resolved
 7. RECOVER/ESCALATE: on failure or low confidence, retry, fall back, or escalate with a summary
Every step is written via audit/trace_logger.py. Set a max-steps guard to prevent loops.
Add an end-to-end test that runs all 5 scenarios in mock LLM mode.
```

### Phase 5: Policy, Approvals, Safety
```
Phase 5. Implement policy/autonomy_policy.py (configurable thresholds by amount, action type,
confidence, vendor risk), policy/guardrails.py (blocked actions, PII/bank number masking), and the
approvals API: list pending, approve, reject with comment. Approved actions execute then go through
the verifier. Rejected actions are logged and the case is closed as "human-declined".
Add dry-run mode. Tests: an action above threshold never executes without approval.
```

### Phase 6: API + Audit Reports
```
Phase 6. Build FastAPI routes: ingest, list/create cases, run case (streaming trace via SSE or websocket),
approvals, audit log query. Implement audit/report_generator.py that exports a per-case report
(JSON + PDF or HTML) containing: summary, evidence with citations, trace timeline, actions,
approvals, verification result.
```

### Phase 7: Frontend
```
Phase 7. Build the React + Tailwind frontend:
- Dashboard: counts by mismatch type, auto-resolved vs escalated vs pending approval, money at risk
- Case detail: LIVE execution trace timeline (INPUT -> PLAN -> TOOL USE -> DECISION -> ACTION ->
  VERIFICATION), evidence panel with cited snippets, proposed actions
- Approval inbox: approve/reject with reasoning shown
- Audit log: filter and export
- "Run demo" button that triggers all 5 scenarios
Design should be clean and demo-friendly. Use the browser to verify the UI works and capture screenshots as artifacts.
```

### Phase 8: Reliability, Evals, Demo Polish
```
Phase 8. Add failure-injection tests (tool timeouts, empty ERP response, corrupted invoice, contradictory
emails) and confirm the agent recovers or escalates gracefully. Implement evals/evaluate.py reporting
classification accuracy, auto-resolution rate, escalation rate, and false-action rate against
labeled_cases.json. Write scripts/run_demo.py (one command to seed, start services, and run the
scenarios), demo/demo_script.md (3-4 minute walkthrough), and finish docs/ including architecture
diagram (Mermaid), agent design, safety controls, known limitations, and future scope.
```

---

## 5. DEMO SCENARIOS (hero cases the system must handle)

| # | Scenario | Expected agent behavior |
|---|---|---|
| 1 | **Partial payment**: invoice ₹1,00,000, paid ₹60,000 | Find email confirming instalment plan, classify as expected partial payment, schedule follow-up, no escalation |
| 2 | **Duplicate payment**: same invoice paid twice | Detect duplicate, propose payment hold/recovery request, needs human approval |
| 3 | **Missing payment**: invoice due, no payment | Search bank and emails, find none, draft vendor reminder, auto-send if low risk |
| 4 | **Price variance**: invoice ≠ PO | Find discount email, explain the variance, propose credit note, approval required |
| 5 | **Unmatched payment**: no invoice/PO | Fuzzy-match vendor, cannot resolve confidently, escalate with evidence summary |

---

## 6. DEFINITION OF DONE

- [ ] `python scripts/run_demo.py` runs all 5 scenarios end-to-end in mock LLM mode
- [ ] Real LLM mode works by setting the API key in `.env`
- [ ] Every case shows the full trace with cited evidence in the UI
- [ ] Approval gate demonstrably blocks consequential actions until approved
- [ ] Verification step runs after every executed action
- [ ] Failure-injection tests pass (recover or escalate, never crash)
- [ ] Audit report exports per case
- [ ] Docs, architecture diagram, limitations, and future scope are complete
- [ ] Demo script and recorded video ready

---

## 7. TIPS FOR RUNNING THIS IN ANTIGRAVITY

- Use the **Agent Manager** for each phase so you get a plan artifact and task list to review before code changes.
- Ask for **browser verification** in Phases 7-8 so the agent tests the UI and records screenshots you can reuse in your submission.
- Review each phase's diff before approving; if a phase drifts, reply with: *"Stop. Re-read PROMPT.md Section 2 (Rules) and redo this phase following them."*
- Commit to git after each passing phase so you can roll back cleanly.
- Build in **mock LLM mode first**, then switch on the real model once the pipeline is stable.
