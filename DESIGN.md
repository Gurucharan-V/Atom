# DESIGN.md: Eclipse Reconciler UI

> Drop this file in the project root next to `PROMPT.md`. In Antigravity, add to the Phase 7 prompt:
> *"Read DESIGN.md fully and follow it exactly. Do not substitute default Tailwind/shadcn styling where DESIGN.md specifies a choice."*

---

## 1. Design brief (grounding)

- **Product:** Eclipse Reconciler, an AI agent that investigates mismatches between invoices, purchase orders, payments, emails and the ledger, then acts with human approval.
- **Users:** AP/AR analysts and finance controllers who need to trust what the agent did. Secondary audience: hackathon judges watching a 3-4 minute demo.
- **Primary job of the UI:** make the agent's reasoning **legible and auditable**: what it saw, what it decided, what it did, and whether it worked.
- **Judging alignment:** the UI must make the trace `INPUT → PLAN → TOOL USE → DECISION → ACTION → VERIFICATION` obvious within 5 seconds of opening a case.

## 2. Concept: "the gap"

An eclipse happens when one disc overlaps another. A reconciliation mismatch is the same picture: two records that should cover each other exactly, and a sliver that doesn't.

**The one memorable element:** the **Overlap Mark**, a pair of overlapping discs (invoice and payment) where the uncovered crescent is filled amber and sized in proportion to the discrepancy. It appears on the case header, in case rows (small), and in the dashboard. When a case is resolved and verified, the crescent closes to a full overlap. Everything else in the interface stays quiet and disciplined.

Spend boldness here only. No gradients, no decorative illustration, no glow.

## 3. Color tokens

Light interface with one dark surface (the trace tape). Cool, ink-based, not cream, not black-plus-neon.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F2F4F7` | App background (cool pale grey) |
| `--sheet` | `#FFFFFF` | Working surfaces (tables, panels) |
| `--ink` | `#16202C` | Primary text; also the dark trace-tape background |
| `--ink-soft` | `#4B5868` | Secondary text |
| `--rule` | `#D9DEE5` | Dividers, table lines |
| `--corona` | `#E39B12` | The discrepancy: crescent, money-at-risk, "needs attention" |
| `--verified` | `#1F8A70` | Verified / resolved / success |
| `--escalated` | `#C2374A` | Escalated to human / failure |
| `--pending` | `#4B52B8` | Awaiting approval |

**Rules**
- `--corona` is reserved for the gap and for anything about money still unresolved. Never use it as a generic accent or button color.
- Status is never color-only: every status has an icon and text label.
- Primary buttons use `--ink` fill with white text. Approve = `--verified` fill; Reject = outline in `--escalated`.
- Contrast: body text ≥ 4.5:1 on its surface. On the dark trace tape use `#E8EDF3` text and `#9AA7B8` for secondary.
- Dark-tape step colors: input `#8FB4E8`, plan `#B9A6F0`, tool `#7AD1C1`, decision `#F1C168`, action `#F0967F`, verification `#7FD69A`, escalate `#F27A8A`.

## 4. Typography

Two clearly different families:

| Role | Family | Notes |
|---|---|---|
| UI and headings | **Schibsted Grotesk** (Google Fonts) | Weights 400, 500, 700. Headings 700, tight tracking (-0.01em) |
| Identifiers, amounts in tables, raw payloads | **JetBrains Mono** | Only for IDs (INV-20418), tool-call JSON, log payloads, and right-aligned numeric columns. Use `font-variant-numeric: tabular-nums` |

Fallbacks: `'Schibsted Grotesk', system-ui, sans-serif` and `'JetBrains Mono', ui-monospace, monospace`.

**Scale (px / line-height):** 12/16, 14/20 (default UI), 16/24 (body), 20/28, 24/32, 32/38 (page title), 44/48 (dashboard headline figure only).

**Rules**
- Sentence case everywhere. **No all-caps labels, no tracked-out eyebrows above headings.**
- Do not highlight a single word in a headline with a different color or italic.
- Prose line length under 72 characters (e.g., the agent's reasoning text).
- No middle-dot chains ("A · B · C") for metadata. Use labeled fields or separate lines.
- No trailing arrows on buttons and links.

## 5. Layout and spacing

- Spacing scale: 4, 8, 12, 16, 24, 32, 48. Base grid 8px.
- Left-aligned content throughout; numbers right-aligned in tables.
- Border radius: **3px** on inputs and buttons, **8px** on panels, **999px** only for the discs and status dots. Do not apply one radius to everything.
- Structure comes from **rules (1px `--rule`)** and whitespace, not from stacks of identical shadowed cards. No drop shadows except a single `0 8px 24px rgba(22,32,44,.12)` on modals and the approval drawer.
- Max content width 1440px; the case detail uses the full width.

### App shell
```
┌──────┬────────────────────────────────────────────────────────┐
│ Rail │  Page title                              [Run demo]    │
│      ├────────────────────────────────────────────────────────┤
│ Home │                                                        │
│ Cases│                    page content                        │
│ Appr.│                                                        │
│ Audit│                                                        │
└──────┴────────────────────────────────────────────────────────┘
```
Rail is 72px wide (icons plus label beneath), `--ink` background, collapsing to a bottom bar under 768px. The pending-approvals item shows a count badge in `--pending`.

## 6. Screens

### 6.1 Dashboard
Purpose: answer "what needs me, and what did the agent handle?"

```
┌──────────────────────────────────────────────────────────────┐
│ ₹4,82,000 still unreconciled              [Run demo]         │  ← 44px headline figure, --corona underline bar only
│ 23 open cases · 9 waiting on you  (write as two lines, not dots)
├───────────────────────────────┬──────────────────────────────┤
│ Needs your approval (table)   │ Handled by the agent         │
│ case | action | amount | age  │ resolved 14 | escalated 3    │
├───────────────────────────────┴──────────────────────────────┤
│ Cases by mismatch type: horizontal bars, one row per type     │
└──────────────────────────────────────────────────────────────┘
```
- Headline is the unresolved money figure with one line of supporting text. No stat-card grid with gradient accents.
- "Cases by mismatch type" uses plain horizontal bars in `--ink` at varied lengths, with the count at the right, and a small Overlap Mark per type.

### 6.2 Cases list
- Dense table: Overlap Mark (24px), case ID (mono), vendor, mismatch type, amount gap (mono, right-aligned), status, age.
- Filters as a single row of text-toggles above the table (type, status). Row click opens the case.
- Empty state: "No cases yet. Load the sample data to start." with a `Load sample data` button.

### 6.3 Case detail (the hero screen, most design effort here)

Three regions, evidence-first:

```
┌──────────────────────────────────────────────────────────────────────┐
│ ◐ INV-20418  Acme Pvt Ltd              Gap ₹40,000  [Partial payment]│
│ Invoice ₹1,00,000   Paid ₹60,000   Status: Awaiting approval         │
├───────────────────────────────┬──────────────────────────────────────┤
│  TRACE TAPE (dark, --ink)     │  Evidence                            │
│                               │  ▸ Invoice line 1        (mono id)   │
│  ● Input       received…      │  ▸ Bank row 88213                    │
│  │                            │  ▸ Email: "two instalments…"         │
│  ● Plan        4 steps        │                                      │
│  │  ├ search emails           │  Agent's conclusion                  │
│  │  ├ query bank              │  Expected partial payment, first     │
│  ● Tool use    email_search   │  of two instalments agreed on 3 Sep. │
│  │            ✓ 3 results     │  Confidence 0.91                     │
│  ● Decision    Partial pmt    │                                      │
│  │                            │  Proposed action                     │
│  ● Action      Awaiting you   │  Schedule follow-up for 3 Oct        │
│  ○ Verification  pending      │  [Approve] [Reject] [Ask for detail] │
└───────────────────────────────┴──────────────────────────────────────┘
```

**Case header**
- Left: the large Overlap Mark (72px) showing the crescent. Right: case ID (mono), vendor, mismatch label, gap amount.
- Below: three labeled values in plain text (Invoice, Paid, Status).

**Trace tape** (left, ~44% width, `--ink` background, fixed height with internal scroll)
- A vertical line with one node per step. Node color per step type (see the dark-tape colors in section 3), shape encodes state: filled = done, ring = running/pending, cross = failed.
- Each step shows: step name (sentence case, e.g. "Tool use"), one-line summary, timestamp in mono at the right.
- Steps expand on click to show the payload (mono, wrapped) and evidence links. Recover and escalate branches indent by one level with a small branch line.
- **Live mode:** while the agent is running, new steps append at the bottom with the tape auto-scrolling; the latest node pulses once when it appears. Respect `prefers-reduced-motion`.
- Tool call rows show tool name, duration, and result status with icon plus text ("3 results", "timed out, retrying 2 of 3").

**Evidence panel** (right)
- Each evidence item is a collapsible row: source icon, type, ID (mono), short snippet with the matched phrase highlighted using `background: rgba(227,155,18,.25)`.
- Clicking a citation number in the agent's reasoning scrolls to and highlights the evidence row. Every claim in the conclusion has a citation.
- "Agent's conclusion" uses body text in 16/24, max 72ch, followed by a labeled confidence value.
- "Proposed action" shows the exact change to be made (field, old value, new value) before the buttons.

**On approval:** the crescent animates closed over ~600ms and the last tape node fills as Verification completes. If verification fails, the crescent stays open, the node shows a cross, and an escalation step is appended with a plain-language explanation.

### 6.4 Approval inbox
- Two-pane: list on the left (case, action type, amount, age), detail on the right showing the same proposed-action block and evidence summary as the case detail.
- Buttons: `Approve`, `Reject` (requires a comment), `Open full case`.
- Consequential actions (ledger post, payment hold) show a one-line impact statement above the buttons: "This will post a ₹40,000 credit note to Acme Pvt Ltd in the ledger."
- Empty state: "Nothing waiting on you. The agent will ask here when it needs a decision."

### 6.5 Audit log
- Chronological table: time, case, step type, actor (agent / person name / system), summary. Filters for case, step type, actor. `Export report` per case (HTML/PDF).
- Rows are append-only in appearance: no edit or delete affordances anywhere.

## 7. Components

| Component | Spec |
|---|---|
| Overlap Mark | SVG, two circles, offset by gap ratio (0 = fully overlapping, 1 = barely touching). Left disc `--ink` at 85%, right disc `--ink` at 35%; the uncovered part of the left disc is the crescent in `--corona`. Sizes: 24, 40, 72. Provide `aria-label="Gap of ₹40,000"` |
| Status tag | Icon + text, 12px medium, no filled pill backgrounds; 1px border in status color, 3px radius |
| Button | Height 36px, 3px radius, 14px medium; focus ring 2px `--pending` with 2px offset |
| Table | Sticky header, 1px row rules, 44px rows, hover row `#F7F9FB`, no zebra |
| Confidence | Text ("0.91") plus a 64px-wide 4px-tall bar; below 0.75 the label reads "Low confidence" in `--escalated` |
| Toast | Bottom-left, uses the same verb as the action button ("Approved", "Rejected") |
| Modal / drawer | Only for reject-with-comment and report export; the only elements permitted a shadow |

## 8. Motion

- Motion answers actions or shows agent progress. Nothing animates on page load except the dashboard headline figure counting up once (400ms).
- Approved-and-verified: crescent closes (600ms, ease-out).
- New trace step: 150ms fade in and one pulse of the node.
- No hover transitions on cards, no staggered section entrances.
- `@media (prefers-reduced-motion: reduce)` disables all of the above, replacing with instant state changes.

## 9. Copy and voice

- Plain verbs, sentence case, present tense for what the agent is doing ("Searching emails").
- Buttons name the outcome: `Approve credit note`, `Reject`, `Load sample data`, `Export report`. The toast repeats the verb: "Credit note approved."
- Errors say what happened and what to do: "The ledger didn't respond after 3 tries. The case was escalated to you with the evidence gathered so far."
- Never apologize, never use "Oops", never anthropomorphize ("I think..."). Use "The agent found...".
- Use user vocabulary: "payment", "invoice", "gap", not "entity resolution", "vector search". Technical names appear only inside expanded trace payloads.

Mismatch labels: Partial payment, Duplicate payment, Missing payment, Unmatched payment, Price variance, Tax or currency variance, Vendor name mismatch.

## 10. Data shapes the UI consumes

```ts
type StepType = "input" | "plan" | "tool_use" | "decision" | "action" | "verification" | "recover" | "escalate";

interface TraceEvent {
  id: string; case_id: string; step: StepType;
  state: "running" | "done" | "failed" | "pending";
  summary: string; payload?: unknown; evidence_refs: string[]; ts: string;
  parent_id?: string; // for recover/escalate branches
}

interface Case {
  id: string; vendor: string; invoice_id: string;
  mismatch_type: "partial" | "duplicate" | "missing" | "unmatched" | "price_variance" | "tax_fx" | "entity";
  invoice_amount: number; paid_amount: number; gap: number; currency: "INR" | "USD";
  status: "open" | "running" | "awaiting_approval" | "resolved" | "escalated" | "declined";
  confidence: number; conclusion: string; proposed_action?: ProposedAction;
}
```
Stream trace events via SSE (`/api/cases/{id}/stream`) and append them to the tape as they arrive.

## 11. Tailwind and CSS tokens

```css
:root {
  --paper:#F2F4F7; --sheet:#FFFFFF; --ink:#16202C; --ink-soft:#4B5868; --rule:#D9DEE5;
  --corona:#E39B12; --verified:#1F8A70; --escalated:#C2374A; --pending:#4B52B8;
  --font-ui:'Schibsted Grotesk', system-ui, sans-serif;
  --font-mono:'JetBrains Mono', ui-monospace, monospace;
}
body { background:var(--paper); color:var(--ink); font-family:var(--font-ui); font-size:14px; line-height:20px; }
.num { font-family:var(--font-mono); font-variant-numeric:tabular-nums; }
```
```js
// tailwind.config.js (extend)
colors: { paper:'#F2F4F7', sheet:'#FFFFFF', ink:'#16202C', 'ink-soft':'#4B5868', rule:'#D9DEE5',
          corona:'#E39B12', verified:'#1F8A70', escalated:'#C2374A', pending:'#4B52B8' },
fontFamily: { ui:['Schibsted Grotesk','system-ui','sans-serif'], mono:['JetBrains Mono','ui-monospace','monospace'] },
borderRadius: { control:'3px', panel:'8px' }
```

## 12. Accessibility and responsiveness (quality floor)

- Visible keyboard focus on every interactive element; logical tab order; Trace steps are a semantic ordered list with `aria-live="polite"` for new steps.
- Status conveyed by icon plus text, never by color alone.
- Overlap Mark has a text alternative stating the gap.
- Breakpoints: ≥1200 full three-region layout; 768-1199 trace tape above evidence; <768 single column with rail becoming a bottom bar and tables becoming labeled rows.
- Touch targets ≥ 40px on mobile.

## 13. Do and don't

**Do**
- Make the trace tape and the Overlap Mark the two things people remember.
- Show evidence next to every conclusion.
- Keep surfaces flat, ruled, and quiet.

**Don't**
- Don't build a grid of identical rounded, shadowed stat cards.
- Don't use gradients, glows, or glassmorphism.
- Don't use amber for anything except the gap and unresolved money.
- Don't add all-caps eyebrow labels, numbered section markers, or middle-dot metadata strings.
- Don't show a chat window as the main interface; this is an investigation workspace, not a chatbot.

## 14. Demo-mode requirements (for the video)

- `Run demo` on the dashboard runs the five scenarios sequentially, and the app navigates to the first case so the live trace is visible.
- Seed data must be prepared so the trace of Scenario 1 (partial payment) completes in under 20 seconds in mock LLM mode.
- The approval inbox must show at least two pending items after the demo run so the human-in-the-loop moment can be filmed.
- Include one visibly failed tool call with retry and recovery in the trace of one scenario, to demonstrate failure handling.

## 15. Definition of done (design)

- [ ] Tokens implemented exactly as specified (colors, fonts, radii)
- [ ] Overlap Mark renders correctly at three sizes and animates closed on verified resolution
- [ ] Trace tape live-streams, supports expand/collapse, and shows failed, retry, and escalate branches
- [ ] Every conclusion links to evidence with highlighted snippets
- [ ] Approval flow shows old and new values plus an impact statement before action
- [ ] Keyboard navigable, reduced-motion respected, responsive to mobile
- [ ] Screenshots of all four screens captured for the submission
