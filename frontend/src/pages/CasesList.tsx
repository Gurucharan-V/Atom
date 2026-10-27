import React, { useState } from 'react';
import { Search, ArrowUpDown, UploadCloud } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OverlapMark } from '../components/common/OverlapMark';
import { StatusTag } from '../components/common/StatusTag';
import { ConfidenceBar } from '../components/common/ConfidenceBar';
import { SkeletonTableRow } from '../components/common/LoadingStates';
import { DocumentIngestModal } from '../components/common/DocumentIngestModal';

export const CasesList: React.FC = () => {
  const {
    cases,
    selectCase,
    searchQuery,
    setSearchQuery,
    loadSampleData,
    isLoading,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'id' | 'vendor' | 'amount' | 'gap'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  // Filter cases based on search and button filters
  const filteredCases = cases
    .filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.mismatch_type !== typeFilter) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(query) ||
          c.vendor.toLowerCase().includes(query) ||
          c.invoice_id.toLowerCase().includes(query) ||
          c.conclusion.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id.localeCompare(b.id);
      if (sortField === 'vendor') comparison = a.vendor.localeCompare(b.vendor);
      if (sortField === 'amount') comparison = a.invoice_amount - b.invoice_amount;
      if (sortField === 'gap') comparison = a.gap - b.gap;
      return sortAsc ? comparison : -comparison;
    });

  const toggleSort = (field: 'id' | 'vendor' | 'amount' | 'gap') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-sheet rounded-panel border border-rule p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-ink tracking-tight">
              Reconciliation cases
            </h1>
            <p className="text-[13px] text-ink-soft">
              Continuous monitoring across ERP accounts payable, banking clearing, correspondence, and voice audio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsIngestModalOpen(true)}
              className="h-[34px] px-3.5 rounded-control bg-paper border border-rule hover:border-corona text-ink text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5 text-corona" />
              <span>Ingest document / audio</span>
            </button>

            <span className="font-mono text-[12px] text-ink-soft">
              Showing {filteredCases.length} of {cases.length} cases
            </span>
          </div>
        </div>

        {/* Live Search bar for mobile / quick search */}
        <div className="relative md:hidden">
          <Search className="w-4 h-4 text-ink-soft absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cases or vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[34px] pl-8 pr-3 w-full bg-paper text-ink text-[12px] rounded-control border border-rule focus:outline-none focus:ring-1 focus:ring-pending"
          />
        </div>

        {/* Text-toggle filters */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-rule text-[13px]">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-ink-soft text-[12px] mr-1">Status:</span>
            {['all', 'open', 'awaiting_approval', 'resolved', 'escalated'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-control text-[12px] font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-ink text-white'
                    : 'text-ink-soft hover:text-ink hover:bg-paper'
                }`}
              >
                {st === 'all'
                  ? 'All'
                  : st === 'awaiting_approval'
                  ? 'Awaiting approval'
                  : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-[1px] h-4 bg-rule" />

          {/* Type filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-ink-soft text-[12px] mr-1">Mismatch:</span>
            {['all', 'partial', 'duplicate', 'missing', 'price_variance', 'tax_fx', 'unmatched'].map(
              (tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTypeFilter(tp)}
                  className={`px-2.5 py-1 rounded-control text-[12px] font-medium transition-colors ${
                    typeFilter === tp
                      ? 'bg-ink text-white'
                      : 'text-ink-soft hover:text-ink hover:bg-paper'
                  }`}
                >
                  {tp === 'all'
                    ? 'All'
                    : tp === 'price_variance'
                    ? 'Price variance'
                    : tp === 'tax_fx'
                    ? 'Tax / Forex (GST)'
                    : tp.charAt(0).toUpperCase() + tp.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Dense Cases Table */}
      <div className="bg-sheet rounded-panel border border-rule overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-[15px] text-ink font-medium">
              No cases matching the current filters or search query "{searchQuery}".
            </p>
            <p className="text-[13px] text-ink-soft">
              Try adjusting your query or reset filters.
            </p>
            <button
              type="button"
              onClick={loadSampleData}
              className="mt-2 h-[36px] px-4 rounded-control bg-ink text-white text-[13px] font-medium hover:bg-ink/90 transition-colors"
            >
              Reset dataset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-rule bg-paper/50 text-[12px] font-medium text-ink-soft h-[38px] select-none">
                  <th className="pl-5 w-[48px]">Gap</th>
                  <th
                    className="py-2 font-medium cursor-pointer hover:text-ink"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Case ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2 font-medium cursor-pointer hover:text-ink"
                    onClick={() => toggleSort('vendor')}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Vendor</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2 font-medium">Mismatch type</th>
                  <th className="py-2 font-medium">Agent Confidence</th>
                  <th
                    className="py-2 font-medium text-right cursor-pointer hover:text-ink"
                    onClick={() => toggleSort('amount')}
                  >
                    <div className="inline-flex items-center gap-1 justify-end w-full">
                      <span>Invoice amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2 font-medium text-right cursor-pointer hover:text-ink"
                    onClick={() => toggleSort('gap')}
                  >
                    <div className="inline-flex items-center gap-1 justify-end w-full">
                      <span>Amount gap</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2 font-medium pl-6">Status</th>
                  <th className="pr-5 py-2 font-medium text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 text-[13px]">
                {isLoading ? (
                  <>
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                  </>
                ) : (
                  filteredCases.map((c) => {
                    const isResolved = c.status === 'resolved' || c.gap === 0;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => selectCase(c.id)}
                        className="h-[46px] hover:bg-[#F7F9FB] cursor-pointer transition-colors"
                      >
                        <td className="pl-5 py-1">
                          <OverlapMark size={24} gapAmount={c.gap} isResolved={isResolved} />
                        </td>
                        <td className="py-1 font-mono font-medium text-ink">
                          {c.id}
                        </td>
                        <td className="py-1 text-ink font-medium max-w-[200px] truncate">
                          {c.vendor}
                        </td>
                        <td className="py-1 text-ink-soft">
                          {c.mismatch_type === 'partial'
                            ? 'Partial payment'
                            : c.mismatch_type === 'duplicate'
                            ? 'Duplicate payment'
                            : c.mismatch_type === 'missing'
                            ? 'Missing payment'
                            : c.mismatch_type === 'price_variance'
                            ? 'Price variance'
                            : c.mismatch_type === 'tax_fx'
                            ? 'GST / Forex variance'
                            : 'Unmatched payment'}
                        </td>
                        <td className="py-1">
                          <ConfidenceBar
                            confidence={c.confidence}
                            priorConfidence={c.prior_confidence}
                            reason={c.confidence_reason}
                            compact={true}
                          />
                        </td>
                        <td className="py-1 text-right num text-ink-soft">
                          ₹{c.invoice_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-1 text-right num font-semibold text-ink">
                          ₹{c.gap.toLocaleString('en-IN')}
                        </td>
                        <td className="py-1 pl-6">
                          <StatusTag status={c.status} />
                        </td>
                        <td className="pr-5 py-1 text-right num text-ink-soft text-[12px]">
                          {c.age}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Ingestion Modal */}
      <DocumentIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
      />
    </div>
  );
};
