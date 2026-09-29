import type { Case, AuditRecord, TraceEvent } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchCasesApi(): Promise<Case[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cases`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend API unavailable, using local state fallback:', err);
    return null;
  }
}

export async function approveActionApi(caseId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/approvals/${caseId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend approve call failed, applying locally:', err);
    return false;
  }
}

export async function rejectActionApi(caseId: string, reason: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/approvals/${caseId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend reject call failed, applying locally:', err);
    return false;
  }
}

export async function fetchAuditLogsApi(): Promise<AuditRecord[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/audit`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export function connectCaseTraceSse(
  caseId: string,
  onEvent: (event: TraceEvent) => void,
  onComplete: () => void
): () => void {
  const eventSource = new EventSource(`${API_BASE_URL}/api/cases/${caseId}/stream`);

  eventSource.onmessage = (e) => {
    if (e.data === '[DONE]') {
      eventSource.close();
      onComplete();
      return;
    }
    try {
      const traceData: TraceEvent = JSON.parse(e.data);
      onEvent(traceData);
    } catch (err) {
      console.error('Failed to parse SSE trace event:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('SSE stream error or disconnected:', err);
    eventSource.close();
    onComplete();
  };

  return () => {
    eventSource.close();
  };
}
