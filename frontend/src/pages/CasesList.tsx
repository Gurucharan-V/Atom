import React, { useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OverlapMark } from '../components/common/OverlapMark';
import { StatusTag } from '../components/common/StatusTag';
import { SkeletonTableRow } from '../components/common/LoadingStates';

type SortField = 'id' | 'vendor' | 'gap' | 'amount';
type SortOrder = 'asc' | 'desc';

export const CasesList: React.FC = () => {
  const { cases, selectCase, loadSampleData, searchQuery, setSearchQuery, isLoading } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('gap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredCases = cases
    .filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.mismatch_type !== typeFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = c.id.toLowerCase().includes(q);
        const matchVendor = c.vendor.toLowerCase().includes(q);
        const matchType = c.mismatch_type.toLowerCase().includes(q);
        if (!matchId && !matchVendor && !matchType) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let result = 0;
      if (sortField === 'gap') result = a.gap - b.gap;
      else if (sortField === 'amount') result = a.invoice_amount - b.invoice_amount;
      else if (sortField === 'vendor') result = a.vendor.localeCompare(b.vendor);
      else if (sortField === 'id') result = a.id.localeCompare(b.id);
      return sortOrder === 'asc' ? result : -result;
    });

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Row */}
      <div className="bg-sheet rounded-panel border border-rule p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold text-ink tracking-tight">
              Reconciliation cases
            </h1>
            <p className="text-[13px] text-ink-soft">
              Cross-system discrepancies identified between invoices, banks, POs, and the ledger.
            </p>
          </div>
          <span className="font-mono text-[12px] text-ink-soft">
            Showing {filteredCases.length} of {cases.length} cases
          </span>
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
            {['all', 'partial', 'duplicate', 'missing', 'price_variance', 'unmatched'].map(
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
                    <SkeletonTableRow columns={8} />
                    <SkeletonTableRow columns={8} />
                    <SkeletonTableRow columns={8} />
                    <SkeletonTableRow columns={8} />
                    <SkeletonTableRow columns={8} />
                  </>
                ) : (
                  filteredCases.map((c) => {
                    const isResolved = c.status === 'resolved' || c.gap === 0;

                    return (
                    <tr
                      key={c.id}
                      onClick={() => selectCase(c.id)}
                      className="h-[44px] hover:bg-[#F7F9FB] cursor-pointer transition-colors"
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
                          : 'Unmatched payment'}
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
    </div>
  );
};
