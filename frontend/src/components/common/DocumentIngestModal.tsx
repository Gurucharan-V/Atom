import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Mic,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DocumentIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCaseId?: string;
}

interface ParsedResult {
  docType: string;
  fileName: string;
  vendor: string;
  caseId: string;
  entities: Record<string, string>;
  confidenceDelta: number;
  newConfidence: number;
}

export const DocumentIngestModal: React.FC<DocumentIngestModalProps> = ({
  isOpen,
  onClose,
  targetCaseId,
}) => {
  const { cases, addToast, selectCase, setActiveTab } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentCase = targetCaseId
    ? cases.find((c) => c.id === targetCaseId) || cases[0]
    : cases[0];

  const simulateIngestion = (fileName: string) => {
    setIsProcessing(true);
    setParsedResult(null);

    const nameLower = fileName.toLowerCase();
    let docType = 'Unknown Document';
    let entities: Record<string, string> = {};
    let confidenceDelta = 0.15;

    if (nameLower.endsWith('.pdf')) {
      docType = 'ERP Invoice (PDF)';
      entities = {
        'Document Ref': currentCase.invoice_id,
        'Vendor Entity': currentCase.vendor,
        'Billed Gross': `₹${currentCase.invoice_amount.toLocaleString('en-IN')}`,
        'Statutory Tax': 'GST 18% Surcharged',
        'Payment Terms': 'Net 30 Days',
      };
    } else if (nameLower.endsWith('.csv')) {
      docType = 'Bank Clearing Statement (CSV)';
      entities = {
        'Clearing Ref': 'HDFC-NEFT-88213',
        'Remitted Credit': `₹${currentCase.paid_amount.toLocaleString('en-IN')}`,
        'Value Date': '04 Sep 2026',
        'Narration': `NEFT Cr: ${currentCase.invoice_id} INST1 OF 2`,
      };
    } else if (nameLower.endsWith('.eml') || nameLower.endsWith('.msg')) {
      docType = 'Email Thread (.eml)';
      entities = {
        'Sender': `rajesh.k@${currentCase.vendor.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        'Subject': `Re: Payment schedule for ${currentCase.invoice_id}`,
        'Key Clause': 'Splitting into 2 instalments: ₹60k now, ₹40k on 3 Oct',
      };
    } else if (nameLower.endsWith('.mp3') || nameLower.endsWith('.wav') || nameLower.endsWith('.m4a')) {
      docType = 'Voice Call Recording (Audio)';
      confidenceDelta = 0.24;
      entities = {
        'Duration': '02:45 min',
        'Speech Diarization': '2 Speakers (Internal Accounts + Vendor CFO)',
        'Key Timestamp': '01:08 ("Agreed to split ₹1,00,000 into two instalments")',
      };
    } else if (nameLower.endsWith('.txt')) {
      docType = 'WhatsApp Chat Export (.txt)';
      entities = {
        'Export Channel': 'WhatsApp Business Desk',
        'Sender': 'Priya [Lead Accounts - Internal]',
        'Agreed Terms': 'Confirmed ₹60k immediate + ₹40k by 3 Oct',
      };
    } else {
      docType = 'Financial Ledger Spreadsheet (.xlsx)';
      entities = {
        'Audit Sheet': 'Q3_Vendor_Reconciliation_Ledger',
        'Variance Amount': `₹${currentCase.gap.toLocaleString('en-IN')}`,
        'Status': 'Anomaly Flagged',
      };
    }

    setTimeout(() => {
      setIsProcessing(false);
      const newConf = Math.min(0.99, Number((currentCase.confidence + confidenceDelta).toFixed(2)));
      setParsedResult({
        docType,
        fileName,
        vendor: currentCase.vendor,
        caseId: currentCase.id,
        entities,
        confidenceDelta,
        newConfidence: newConf,
      });

      addToast(
        `Classified ${fileName} as ${docType}. Linked to case ${currentCase.id}.`,
        'verified'
      );
    }, 900);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateIngestion(e.dataTransfer.files[0].name);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateIngestion(e.target.files[0].name);
    }
  };

  const handleJumpToCase = () => {
    if (parsedResult) {
      selectCase(parsedResult.caseId);
      setActiveTab('case_detail');
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-sheet rounded-panel border border-rule shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-rule">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-ink">
                Drag-and-Drop Ingestion Panel
              </h2>
              <span className="text-[11px] font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                Multi-Format
              </span>
            </div>
            <p className="text-[13px] text-ink-soft mt-0.5">
              Classifies and links invoices, bank statements, emails, call audio, or WhatsApp exports in real-time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-control text-ink-soft hover:text-ink hover:bg-paper transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-panel p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-corona bg-amber-500/10 scale-[1.01]'
                : 'border-rule hover:border-ink-soft/60 hover:bg-paper/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.csv,.eml,.msg,.txt,.xlsx,.xls,.mp3,.wav,.m4a"
            />

            <div className="w-12 h-12 rounded-full bg-paper border border-rule flex items-center justify-center mx-auto mb-3 text-ink">
              <UploadCloud className="w-6 h-6 text-corona" />
            </div>

            <p className="text-[14px] font-semibold text-ink">
              Drop any document here, or <span className="text-corona underline">browse files</span>
            </p>
            <p className="text-[12px] text-ink-soft mt-1">
              Supports PDF invoices, Bank CSVs, .eml emails, WhatsApp .txt, and Call audio (.mp3, .wav)
            </p>
          </div>

          {/* Quick Demo Samples */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block mb-2">
              Or test with instant demo files:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => simulateIngestion('Acme_Call_Sep3.mp3')}
                className="p-2.5 rounded-control bg-paper border border-rule hover:border-indigo-400 text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-indigo-700 text-[12px] font-semibold">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Call Audio</span>
                </div>
                <span className="text-[11px] text-ink-soft block truncate mt-0.5">
                  Acme_Call.mp3
                </span>
              </button>

              <button
                type="button"
                onClick={() => simulateIngestion('WhatsApp_Chat_Finance.txt')}
                className="p-2.5 rounded-control bg-paper border border-rule hover:border-emerald-400 text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 text-[12px] font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </div>
                <span className="text-[11px] text-ink-soft block truncate mt-0.5">
                  Chat_Export.txt
                </span>
              </button>

              <button
                type="button"
                onClick={() => simulateIngestion('Invoice_INV-20418.pdf')}
                className="p-2.5 rounded-control bg-paper border border-rule hover:border-amber-400 text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-amber-700 text-[12px] font-semibold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Invoice</span>
                </div>
                <span className="text-[11px] text-ink-soft block truncate mt-0.5">
                  INV-20418.pdf
                </span>
              </button>

              <button
                type="button"
                onClick={() => simulateIngestion('HDFC_Bank_Sep2026.csv')}
                className="p-2.5 rounded-control bg-paper border border-rule hover:border-blue-400 text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-blue-700 text-[12px] font-semibold">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Bank CSV</span>
                </div>
                <span className="text-[11px] text-ink-soft block truncate mt-0.5">
                  HDFC_Sep.csv
                </span>
              </button>
            </div>
          </div>

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="p-4 bg-paper rounded-panel border border-rule flex items-center justify-center gap-3 text-[13px] text-ink font-medium">
              <Sparkles className="w-4 h-4 text-corona animate-spin" />
              <span>Analyzing document layout, extracting entities, and indexing citations...</span>
            </div>
          )}

          {/* Real-Time Parsed Classification Card */}
          {parsedResult && !isProcessing && (
            <div className="p-4 bg-emerald-500/[0.06] border border-emerald-500/30 rounded-panel space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-ink text-[14px]">
                    {parsedResult.docType}
                  </span>
                </div>
                <span className="font-mono text-[12px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Linked to {parsedResult.caseId}
                </span>
              </div>

              {/* Extracted Entities Grid */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {Object.entries(parsedResult.entities).map(([key, val]) => (
                  <div key={key} className="bg-white/70 p-2 rounded border border-rule/50">
                    <span className="text-ink-soft block text-[10px] uppercase font-semibold">
                      {key}
                    </span>
                    <span className="font-mono text-ink font-medium truncate block">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Confidence Trend Boost */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-[12px]">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    Confidence jumped to {parsedResult.newConfidence.toFixed(2)} (+
                    {parsedResult.confidenceDelta.toFixed(2)})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleJumpToCase}
                  className="px-3 py-1 bg-ink text-white rounded-control font-medium flex items-center gap-1 hover:bg-ink/90 transition-colors text-[12px]"
                >
                  <span>View in case</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
