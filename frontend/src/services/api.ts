import type { Case, AuditRecord, TraceEvent } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface ApiFetchResult<T> {
  data: T | null;
  error?: string;
  source: 'backend' | 'local';
}

/** Check backend health status */
export async function checkBackendHealth(): Promise<{ status: string; mock_llm_mode?: boolean } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCasesApi(): Promise<ApiFetchResult<Case[]>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE_URL}/api/cases`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { data: null, error: `Backend HTTP ${res.status}: ${res.statusText}`, source: 'local' };
    }
    const data = await res.json();
    return { data, source: 'backend' };
  } catch (err: any) {
    const message = err.name === 'AbortError' ? 'Connection timed out' : 'Server offline or unreachable';
    return { data: null, error: message, source: 'local' };
  }
}

export async function approveActionApi(caseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/approvals/${caseId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return { success: false, error: `Failed to approve (HTTP ${res.status})` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Could not contact approval service' };
  }
}

export async function rejectActionApi(caseId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/approvals/${caseId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      return { success: false, error: `Failed to decline (HTTP ${res.status})` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Could not contact approval service' };
  }
}

export async function fetchAuditLogsApi(): Promise<ApiFetchResult<AuditRecord[]>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE_URL}/api/audit`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { data: null, error: `Backend HTTP ${res.status}`, source: 'local' };
    }
    const data = await res.json();
    return { data, source: 'backend' };
  } catch (err: any) {
    return { data: null, error: 'Audit endpoint offline', source: 'local' };
  }
}

export function connectCaseTraceSse(
  caseId: string,
  onEvent: (event: TraceEvent) => void,
  onComplete: () => void,
  onError?: (err: any) => void
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
    if (onError) onError(err);
    eventSource.close();
    onComplete();
  };

  return () => {
    eventSource.close();
  };
}

