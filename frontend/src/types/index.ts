export type StepType =
  | 'input'
  | 'plan'
  | 'tool_use'
  | 'decision'
  | 'action'
  | 'verification'
  | 'recover'
  | 'escalate';

export type StepState = 'running' | 'done' | 'failed' | 'pending';

export interface TraceEvent {
  id: string;
  case_id: string;
  step: StepType;
  state: StepState;
  summary: string;
  payload?: Record<string, any> | string;
  evidence_refs: string[];
  ts: string;
  parent_id?: string; // for recover/escalate branches
  tool_name?: string;
  duration_ms?: number;
}

export type EvidenceSourceType = 'invoice' | 'bank' | 'email' | 'po' | 'ledger';

export interface Evidence {
  id: string;
  source_type: EvidenceSourceType;
  title: string;
  ref_id: string;
  snippet: string;
  highlight: string;
  date?: string;
}

export type ActionType =
  | 'schedule_followup'
  | 'credit_note'
  | 'payment_hold'
  | 'vendor_reminder'
  | 'escalate_to_human'
  | 'journal_entry';

export interface ProposedAction {
  action_type: ActionType;
  title: string;
  impact_statement: string;
  target_field?: string;
  old_value?: string | number;
  new_value?: string | number;
  requires_approval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'auto_applied';
  rejection_reason?: string;
}

export type MismatchType =
  | 'partial'
  | 'duplicate'
  | 'missing'
  | 'unmatched'
  | 'price_variance'
  | 'tax_fx'
  | 'entity';

export type CaseStatus =
  | 'open'
  | 'running'
  | 'awaiting_approval'
  | 'resolved'
  | 'escalated'
  | 'declined';

export interface Case {
  id: string;
  vendor: string;
  invoice_id: string;
  mismatch_type: MismatchType;
  invoice_amount: number;
  paid_amount: number;
  gap: number;
  currency: 'INR' | 'USD';
  status: CaseStatus;
  confidence: number;
  conclusion: string;
  proposed_action?: ProposedAction;
  evidence: Evidence[];
  trace: TraceEvent[];
  age: string;
}

export interface AuditRecord {
  id: string;
  time: string;
  case_id: string;
  step_type: StepType;
  actor: 'agent' | 'human' | 'system';
  actor_name: string;
  summary: string;
  details?: string;
}
