import React, { useState } from 'react';
import { Download, ShieldCheck, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditLog: React.FC = () => {
  const { auditLogs, exportAuditReport, cases } = useApp();
  const [caseFilter, setCaseFilter] = useState<string>('all');
  const [stepFilter, setStepFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (caseFilter !== 'all' && log.case_id !== caseFilter) return false;
    if (stepFilter !== 'all' && log.step_type !== stepFilter) return false;
    if (actorFilter !== 'all' && log.actor !== actorFilter) return false;
    return true;
  });

  const uniqueCases = Array.from(new Set(cases.map((c) => c.id)));

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="bg-sheet rounded-panel border border-rule p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold text-ink tracking-tight">
              Audit trail & logs
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-verified bg-verified/10 px-2 py-0.5 rounded-control">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Immutable</span>
            </span>
          </div>
          <p className="text-[13px] text-ink-soft mt-0.5">
            Append-only chronological record of all agent steps, tool executions, and human decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportAuditReport()}
          className="h-[36px] px-4 rounded-control bg-ink hover:bg-ink/90 text-white font-medium text-[13px] flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export audit report</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-sheet rounded-panel border border-rule p-4 flex flex-wrap items-center gap-4 text-[13px]">
        <div className="flex items-center gap-1.5 text-ink-soft">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-[12px]">Filter logs:</span>
        </div>

        {/* Case Filter */}
        <select
          value={caseFilter}
          onChange={(e) => setCaseFilter(e.target.value)}
          aria-label="Filter by case"
          className="h-[32px] px-2.5 rounded-control border border-rule bg-paper text-ink text-[12px] font-mono focus:outline-none focus:ring-1 focus:ring-pending"
        >
          <option value="all">All cases</option>
          {uniqueCases.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>

        {/* Step Filter */}
        <select
          value={stepFilter}
          onChange={(e) => setStepFilter(e.target.value)}
          aria-label="Filter by step type"
          className="h-[32px] px-2.5 rounded-control border border-rule bg-paper text-ink text-[12px] focus:outline-none focus:ring-1 focus:ring-pending"
        >
          <option value="all">All step types</option>
          <option value="input">Input</option>
          <option value="plan">Plan</option>
          <option value="tool_use">Tool use</option>
          <option value="decision">Decision</option>
          <option value="action">Action</option>
          <option value="verification">Verification</option>
          <option value="escalate">Escalate</option>
        </select>

        {/* Actor Filter */}
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          aria-label="Filter by actor"
          className="h-[32px] px-2.5 rounded-control border border-rule bg-paper text-ink text-[12px] focus:outline-none focus:ring-1 focus:ring-pending"
        >
          <option value="all">All actors</option>
          <option value="agent">Agent</option>
          <option value="human">Human</option>
          <option value="system">System</option>
        </select>

        <span className="ml-auto font-mono text-[12px] text-ink-soft">
          {filteredLogs.length} events logged
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-sheet rounded-panel border border-rule overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rule bg-paper/50 text-[12px] font-medium text-ink-soft h-[38px]">
                <th className="pl-5 py-2 font-medium">Timestamp</th>
                <th className="py-2 font-medium">Case ID</th>
                <th className="py-2 font-medium">Step</th>
                <th className="py-2 font-medium">Actor</th>
                <th className="pr-5 py-2 font-medium">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 text-[13px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="h-[44px] hover:bg-[#F7F9FB] transition-colors">
                  <td className="pl-5 py-1.5 font-mono text-ink-soft text-[12px] whitespace-nowrap">
                    {log.time}
                  </td>
                  <td className="py-1.5 font-mono font-medium text-ink whitespace-nowrap">
                    {log.case_id}
                  </td>
                  <td className="py-1.5 whitespace-nowrap">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-control bg-paper text-ink border border-rule">
                      {log.step_type}
                    </span>
                  </td>
                  <td className="py-1.5 whitespace-nowrap text-ink-soft">
                    <span className="font-medium text-ink">{log.actor_name}</span>{' '}
                    <span className="text-[11px]">({log.actor})</span>
                  </td>
                  <td className="pr-5 py-1.5 text-ink leading-relaxed">
                    {log.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
