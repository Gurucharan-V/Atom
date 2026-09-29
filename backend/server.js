/**
 * Eclipse Reconciler - Standalone Node.js Backend API Server
 * Zero-dependency native HTTP server providing full API parity with FastAPI.
 */
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 8000;

// Load scenarios or use default in-memory state
let cases = [
  {
    id: 'INV-20418',
    vendor: 'Acme Pvt Ltd',
    invoice_id: 'INV-20418',
    mismatch_type: 'partial',
    invoice_amount: 100000,
    paid_amount: 60000,
    gap: 40000,
    currency: 'INR',
    status: 'awaiting_approval',
    confidence: 0.91,
    conclusion: 'Expected partial payment, first of two instalments agreed on 3 Sep with finance desk. Second payment of ₹40,000 is due on 3 October.',
    age: '2h ago',
    proposed_action: {
      action_type: 'schedule_followup',
      title: 'Schedule follow-up for 3 Oct',
      impact_statement: 'This will register an expected instalment #2 reminder for ₹40,000 due 3 Oct in the ERP calendar.',
      target_field: 'Payment Schedule',
      old_value: 'Single Payment (Overdue ₹40,000)',
      new_value: 'Instalment 1/2 Confirmed · Due Date: 03 Oct 2026',
      requires_approval: true,
      status: 'pending'
    },
    evidence: [
      {
        id: 'ev-1',
        source_type: 'invoice',
        title: 'Invoice line 1',
        ref_id: 'INV-20418:L1',
        snippet: 'Item: Enterprise Cloud & Hosting Services, Gross amount: ₹1,00,000. Payment terms: Net 30.',
        highlight: '₹1,00,000',
        date: '01 Sep 2026'
      },
      {
        id: 'ev-2',
        source_type: 'bank',
        title: 'Bank row 88213',
        ref_id: 'HDFC-NEFT-88213',
        snippet: 'NEFT Cr: ₹60,000 from Acme Pvt Ltd. Narration: INV-20418 INST1 OF 2 REF ACM-559.',
        highlight: '₹60,000 from Acme Pvt Ltd',
        date: '04 Sep 2026'
      },
      {
        id: 'ev-3',
        source_type: 'email',
        title: 'Email thread: "Re: Payment schedule"',
        ref_id: 'EML-402',
        snippet: 'From: rajesh.k@acmepvtltd.com — "As agreed with your accounts lead, we are splitting invoice INV-20418 into two instalments: ₹60,000 immediately, and the remaining ₹40,000 by 3 October."',
        highlight: 'splitting invoice INV-20418 into two instalments',
        date: '03 Sep 2026'
      }
    ],
    trace: [
      {
        id: 'tr-1',
        case_id: 'INV-20418',
        step: 'input',
        state: 'done',
        summary: 'Received mismatch signal from daily reconciliation sweep: ₹40,000 gap on INV-20418.',
        ts: '10:14:02'
      },
      {
        id: 'tr-2',
        case_id: 'INV-20418',
        step: 'plan',
        state: 'done',
        summary: 'Formulated 4-step investigation plan across email archives and bank remitter notes.',
        ts: '10:14:04'
      },
      {
        id: 'tr-3',
        case_id: 'INV-20418',
        step: 'tool_use',
        state: 'done',
        tool_name: 'email_search_tool',
        duration_ms: 320,
        summary: 'Queried email vector index for "Acme Pvt Ltd INV-20418 instalment"',
        ts: '10:14:07'
      },
      {
        id: 'tr-4',
        case_id: 'INV-20418',
        step: 'tool_use',
        state: 'done',
        tool_name: 'bank_tool',
        duration_ms: 180,
        summary: 'Retrieved NEFT transaction 88213 narration tokens confirming "INST1 OF 2"',
        ts: '10:14:09'
      },
      {
        id: 'tr-5',
        case_id: 'INV-20418',
        step: 'decision',
        state: 'done',
        summary: 'Classified discrepancy as expected partial payment (Confidence 0.91).',
        ts: '10:14:12'
      },
      {
        id: 'tr-6',
        case_id: 'INV-20418',
        step: 'action',
        state: 'pending',
        summary: 'Proposed scheduling follow-up for ₹40,000 balance due on 3 October. Awaiting your approval.',
        ts: '10:14:14'
      }
    ]
  },
  {
    id: 'INV-19042',
    vendor: 'LogiTech Solutions India',
    invoice_id: 'INV-19042',
    mismatch_type: 'duplicate',
    invoice_amount: 75000,
    paid_amount: 150000,
    gap: 75000,
    currency: 'INR',
    status: 'awaiting_approval',
    confidence: 0.98,
    conclusion: 'Duplicate payment detected. The same invoice was paid via ICICI NEFT on 12 Sep and again via Axis RTGS on 14 Sep without credit deduction.',
    age: '4h ago',
    proposed_action: {
      action_type: 'payment_hold',
      title: 'Hold disbursement & request recovery',
      impact_statement: 'This will place an immediate payment hold on upcoming disbursement ₹75,000 and issue a formal refund request to LogiTech Solutions India.',
      target_field: 'Disbursement Status',
      old_value: 'Active Batch #4410',
      new_value: 'Hold Placed · Duplicate Recovery Triggered',
      requires_approval: true,
      status: 'pending'
    },
    evidence: [],
    trace: []
  },
  {
    id: 'INV-18890',
    vendor: 'CloudScale Infra Services',
    invoice_id: 'INV-18890',
    mismatch_type: 'price_variance',
    invoice_amount: 85000,
    paid_amount: 85000,
    gap: 15000,
    currency: 'INR',
    status: 'awaiting_approval',
    confidence: 0.89,
    conclusion: 'PO-0994 authorized ₹70,000 but invoice billed ₹85,000. Found vendor credit note agreement in email thread.',
    age: '5h ago',
    proposed_action: {
      action_type: 'credit_note',
      title: 'Post ₹15,000 credit note in ledger',
      impact_statement: 'This will post a ₹15,000 credit note to CloudScale Infra Services in the ERP ledger.',
      target_field: 'Vendor Credit Balance',
      old_value: '₹0.00 Credit',
      new_value: '₹15,000.00 Credit Posted',
      requires_approval: true,
      status: 'pending'
    },
    evidence: [],
    trace: []
  },
  {
    id: 'INV-21004',
    vendor: 'Bharat Power & Electricals',
    invoice_id: 'INV-21004',
    mismatch_type: 'missing',
    invoice_amount: 120000,
    paid_amount: 0,
    gap: 120000,
    currency: 'INR',
    status: 'resolved',
    confidence: 0.94,
    conclusion: 'Invoice overdue by 14 days with zero incoming or outgoing remittances. Automated payment reminder issued under low-risk policy.',
    age: '1d ago',
    evidence: [],
    trace: []
  },
  {
    id: 'TXN-90211',
    vendor: 'Apex Global Supplies',
    invoice_id: 'UNMATCHED-90211',
    mismatch_type: 'unmatched',
    invoice_amount: 0,
    paid_amount: 62000,
    gap: 62000,
    currency: 'INR',
    status: 'escalated',
    confidence: 0.54,
    conclusion: 'Unmatched bank credit of ₹62,000 received with ambiguous narration "APX-DEP". Fuzzy search matched 3 possible vendors.',
    age: '1d ago',
    evidence: [],
    trace: []
  }
];

let auditLogs = [
  {
    id: 'aud-101',
    time: '29 Sep 10:14:14',
    case_id: 'INV-20418',
    step_type: 'action',
    actor: 'agent',
    actor_name: 'Eclipse Agent',
    summary: 'Proposed follow-up schedule for ₹40,000 on 3 Oct (Awaiting Human Approval).'
  },
  {
    id: 'aud-102',
    time: '29 Sep 10:14:12',
    case_id: 'INV-20418',
    step_type: 'decision',
    actor: 'agent',
    actor_name: 'Classifier Agent',
    summary: 'Classified INV-20418 as partial payment with 0.91 confidence.'
  }
];

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key'
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key'
    });
    res.end();
    return;
  }

  // GET /health
  if (pathname === '/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      service: 'eclipse-backend-api',
      port: PORT,
      timestamp: new Date().toISOString()
    });
  }

  // GET /api/cases
  if (pathname === '/api/cases' && req.method === 'GET') {
    return sendJson(res, 200, cases);
  }

  // GET /api/cases/:id/stream (Server-Sent Events)
  const streamMatch = pathname.match(/^\/api\/cases\/([^\/]+)\/stream$/);
  if (streamMatch && req.method === 'GET') {
    const caseId = streamMatch[1];
    const targetCase = cases.find((c) => c.id === caseId);

    if (!targetCase) {
      return sendJson(res, 404, { error: 'Case not found' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Stream trace steps one-by-one with realistic latency
    const steps = targetCase.trace.length > 0 ? targetCase.trace : [
      {
        id: `tr-${Date.now()}-1`,
        case_id: caseId,
        step: 'input',
        state: 'done',
        summary: `Ingested mismatch record for ${caseId}.`,
        ts: new Date().toLocaleTimeString('en-US', { hour12: false })
      },
      {
        id: `tr-${Date.now()}-2`,
        case_id: caseId,
        step: 'plan',
        state: 'done',
        summary: 'Formulating cross-system evidence investigation plan.',
        ts: new Date().toLocaleTimeString('en-US', { hour12: false })
      },
      {
        id: `tr-${Date.now()}-3`,
        case_id: caseId,
        step: 'tool_use',
        state: 'done',
        tool_name: 'bank_tool',
        duration_ms: 180,
        summary: 'Verified bank settlement and remittance tokens.',
        ts: new Date().toLocaleTimeString('en-US', { hour12: false })
      },
      {
        id: `tr-${Date.now()}-4`,
        case_id: caseId,
        step: 'decision',
        state: 'done',
        summary: `Classified discrepancy as ${targetCase.mismatch_type}.`,
        ts: new Date().toLocaleTimeString('en-US', { hour12: false })
      }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        res.write(`data: ${JSON.stringify(steps[index])}\n\n`);
        index++;
      } else {
        res.write('data: [DONE]\n\n');
        clearInterval(interval);
        res.end();
      }
    }, 600);

    req.on('close', () => {
      clearInterval(interval);
    });
    return;
  }

  // GET /api/cases/:id
  const caseMatch = pathname.match(/^\/api\/cases\/([^\/]+)$/);
  if (caseMatch && req.method === 'GET') {
    const caseId = caseMatch[1];
    const target = cases.find((c) => c.id === caseId);
    if (!target) return sendJson(res, 404, { error: 'Case not found' });
    return sendJson(res, 200, target);
  }

  // GET /api/approvals
  if (pathname === '/api/approvals' && req.method === 'GET') {
    const pending = cases.filter(
      (c) => c.status === 'awaiting_approval' && c.proposed_action?.status === 'pending'
    );
    return sendJson(res, 200, pending);
  }

  // POST /api/approvals/:id/approve
  const approveMatch = pathname.match(/^\/api\/approvals\/([^\/]+)\/approve$/);
  if (approveMatch && req.method === 'POST') {
    const caseId = approveMatch[1];
    const target = cases.find((c) => c.id === caseId);
    if (!target) return sendJson(res, 404, { error: 'Case not found' });

    target.status = 'resolved';
    target.gap = 0;
    if (target.proposed_action) target.proposed_action.status = 'approved';

    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const verifyStep = {
      id: `tr-appr-${Date.now()}`,
      case_id: caseId,
      step: 'verification',
      state: 'done',
      summary: 'Action approved by human controller. Verified in ERP ledger.',
      ts: nowStr
    };
    target.trace.push(verifyStep);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      time: nowStr,
      case_id: caseId,
      step_type: 'verification',
      actor: 'human',
      actor_name: 'Finance Controller',
      summary: `Approved "${target.proposed_action?.title || 'Action'}". Verified in ERP.`
    });

    return sendJson(res, 200, { status: 'approved', case_id: caseId, new_gap: 0 });
  }

  // POST /api/approvals/:id/reject
  const rejectMatch = pathname.match(/^\/api\/approvals\/([^\/]+)\/reject$/);
  if (rejectMatch && req.method === 'POST') {
    const caseId = rejectMatch[1];
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const reason = payload.reason || 'Declined without comment';
        const target = cases.find((c) => c.id === caseId);
        if (!target) return sendJson(res, 404, { error: 'Case not found' });

        target.status = 'declined';
        if (target.proposed_action) {
          target.proposed_action.status = 'rejected';
          target.proposed_action.rejection_reason = reason;
        }

        const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        target.trace.push({
          id: `tr-rej-${Date.now()}`,
          case_id: caseId,
          step: 'escalate',
          state: 'done',
          summary: `Action declined by human: "${reason}".`,
          ts: nowStr
        });

        auditLogs.unshift({
          id: `aud-${Date.now()}`,
          time: nowStr,
          case_id: caseId,
          step_type: 'escalate',
          actor: 'human',
          actor_name: 'Finance Controller',
          summary: `Declined action for ${caseId}: "${reason}".`
        });

        return sendJson(res, 200, { status: 'rejected', case_id: caseId, reason });
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // GET /api/audit
  if (pathname === '/api/audit' && req.method === 'GET') {
    return sendJson(res, 200, auditLogs);
  }

  // Fallback 404
  return sendJson(res, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`Eclipse Reconciler Backend Server listening on http://127.0.0.1:${PORT}`);
});
