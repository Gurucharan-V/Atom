import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Building,
  Mail,
  Receipt,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  XCircle,
  HelpCircle,
  Mic,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import type { Evidence, ProposedAction, EvidenceSourceType } from '../../types';
import { ConfidenceBar } from '../common/ConfidenceBar';
import { AskDetailModal } from '../common/AskDetailModal';
import { useApp } from '../../context/AppContext';

interface EvidencePanelProps {
  caseId: string;
  vendorName: string;
  evidence: Evidence[];
  conclusion: string;
  confidence: number;
  priorConfidence?: number;
  confidenceReason?: string;
  proposedAction?: ProposedAction;
  highlightedEvidenceId?: string;
  onApprove: () => void;
  onReject: () => void;
  isResolved?: boolean;
}

const SOURCE_ICONS: Record<EvidenceSourceType, React.ElementType> = {
  invoice: Receipt,
  bank: Building,
  email: Mail,
  po: FileText,
  ledger: BookOpen,
  call: Mic,
  whatsapp: MessageSquare,
};

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  caseId,
  vendorName,
  evidence,
  conclusion,
  confidence,
  priorConfidence,
  confidenceReason,
  proposedAction,
  highlightedEvidenceId,
  onApprove,
  onReject,
  isResolved = false,
}) => {
  const { sendVendorInquiry } = useApp();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'ev-1': true,
    'ev-2': true,
    'ev-3': true,
    'ev-4': true,
    'ev-5': true,
    'ev-21': true,
    'ev-31': true,
    'ev-41': true,
    'ev-44': true,
    'ev-51': true,
    'ev-61': true,
  });

  // Audio clip playback state for F1
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [clipProgress, setClipProgress] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const timerRef = useRef<any>(null);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePlayClip = (item: Evidence) => {
    if (playingClipId === item.id) {
      stopAudioClip();
      return;
    }

    stopAudioClip();
    setPlayingClipId(item.id);
    setClipProgress(0);

    // Play subtle audio tone via Web Audio API so it plays in any environment
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.3);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscillatorRef.current = osc;
    } catch {
      // Audio context suppressed or blocked
    }

    let progress = 0;
    timerRef.current = setInterval(() => {
      progress += 10;
      setClipProgress(progress);
      if (progress >= 100) {
        stopAudioClip();
      }
    }, 300);
  };

  const stopAudioClip = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {}
      oscillatorRef.current = null;
    }
    setPlayingClipId(null);
    setClipProgress(0);
  };

  useEffect(() => {
    return () => stopAudioClip();
  }, []);

  const renderSnippetWithHighlight = (snippet: string, highlight: string) => {
    if (!highlight || !snippet.includes(highlight)) {
      return snippet;
    }
    const parts = snippet.split(highlight);
    return (
      <>
        {parts[0]}
        <mark
          className="px-1 py-0.5 rounded text-ink font-medium"
          style={{ backgroundColor: 'rgba(227, 155, 18, 0.28)' }}
        >
          {highlight}
        </mark>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  const handleInquirySubmit = (message: string) => {
    sendVendorInquiry(caseId, message);
  };

  return (
    <div className="space-y-6">
      {/* Evidence section */}
      <div className="bg-sheet rounded-panel border border-rule p-5">
        <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-ink tracking-tight">
              Supporting evidence ({evidence.length})
            </h3>
            {evidence.some((e) => e.source_type === 'call') && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Voice Audio Cited
              </span>
            )}
            {evidence.some((e) => e.source_type === 'whatsapp') && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                WhatsApp Cited
              </span>
            )}
          </div>
          <span className="text-[12px] text-ink-soft">
            Direct citations from systems & voice
          </span>
        </div>

        {evidence.length === 0 ? (
          <p className="text-[13px] text-ink-soft py-4 text-center">
            No external evidence records attached to this case.
          </p>
        ) : (
          <div className="space-y-3">
            {evidence.map((item) => {
              const Icon = SOURCE_ICONS[item.source_type] || FileText;
              const isHighlighted = highlightedEvidenceId === item.id;
              const isExpanded = !!expandedItems[item.id];
              const isPlaying = playingClipId === item.id;

              return (
                <div
                  key={item.id}
                  id={`evidence-${item.id}`}
                  className={`border rounded-panel transition-all duration-300 ${
                    isHighlighted
                      ? 'border-corona ring-2 ring-corona/40 bg-corona/10 scale-[1.01]'
                      : item.source_type === 'call'
                      ? 'border-indigo-200/80 bg-indigo-50/20'
                      : item.source_type === 'whatsapp'
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : 'border-rule hover:border-ink-soft/40 bg-white'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="flex items-center justify-between p-3 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center ${
                          item.source_type === 'call'
                            ? 'bg-indigo-100 text-indigo-700'
                            : item.source_type === 'whatsapp'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-paper text-ink-soft'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-ink">
                            {item.ref_id}
                          </span>
                          {item.source_type === 'call' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                              Voice Call · {item.duration_text || '02:45'}
                            </span>
                          )}
                          {item.source_type === 'whatsapp' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              WhatsApp Export
                            </span>
                          )}
                        </div>
                        <span className="text-[13px] text-ink-soft font-normal block mt-0.5">
                          {item.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.date && (
                        <span className="text-[12px] text-ink-soft/80 font-mono">
                          {item.date}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-ink-soft" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-ink-soft" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-rule/50 text-[13px] leading-relaxed text-ink space-y-2">
                      {/* Speaker banner if diarized */}
                      {item.speaker && (
                        <div className="flex items-center justify-between text-[11px] font-medium text-ink-soft px-1">
                          <span className="text-ink font-semibold">
                            Speaker: {item.speaker}
                          </span>
                          {item.timestamp_seconds !== undefined && (
                            <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Marker @ 01:08
                            </span>
                          )}
                        </div>
                      )}

                      <div className="bg-paper/70 p-2.5 rounded-control font-normal">
                        {renderSnippetWithHighlight(item.snippet, item.highlight)}
                      </div>

                      {/* Interactive Audio Player for Call Evidence (F1) */}
                      {item.source_type === 'call' && (
                        <div className="p-3 bg-indigo-950 text-white rounded-control space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayClip(item);
                                }}
                                className="h-7 px-2.5 rounded bg-corona text-ink text-[11px] font-bold flex items-center gap-1.5 hover:bg-corona/90 transition-colors shadow-sm"
                              >
                                {isPlaying ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Play clip</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  stopAudioClip();
                                }}
                                className="h-7 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1"
                                title="Reset"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>

                              <span className="text-[11px] text-white/80 font-mono">
                                Seeked @ 01:08 / {item.duration_text || '02:45'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                              <Volume2 className="w-3.5 h-3.5 text-corona" />
                              <span>Speech diarized</span>
                            </div>
                          </div>

                          {/* Animated Sound Waveform Progress Bar */}
                          <div className="space-y-1">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex items-center">
                              <div
                                className="h-full bg-corona transition-all duration-300 rounded-full"
                                style={{ width: `${isPlaying ? clipProgress : 42}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-white/50 font-mono">
                              <span>01:08 (Verbal pact agreement)</span>
                              <span>{isPlaying ? `${clipProgress}% played` : 'Click to preview audio'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent conclusion */}
      <div className="bg-sheet rounded-panel border border-rule p-5">
        <div className="pb-3 border-b border-rule mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-ink tracking-tight">
            Agent's conclusion
          </h3>
          <ConfidenceBar
            confidence={confidence}
            priorConfidence={priorConfidence}
            reason={confidenceReason}
          />
        </div>

        <p className="text-[15px] leading-[23px] text-ink font-normal max-w-[72ch]">
          {conclusion}
        </p>

        <div className="mt-3 pt-3 border-t border-rule/60 flex items-center gap-2 text-[12px] text-ink-soft">
          <ShieldCheck className="w-4 h-4 text-verified" />
          <span>Grounded in {evidence.length} cited records across systems, emails, and phone audio.</span>
        </div>
      </div>

      {/* Proposed action & approval controls */}
      {proposedAction && (
        <div className="bg-sheet rounded-panel border border-rule p-5">
          <div className="pb-3 border-b border-rule mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-ink tracking-tight">
                Proposed action
              </h3>
              <p className="text-[12px] text-ink-soft mt-0.5">
                Deterministic proposal requiring governance gate
              </p>
            </div>
            {isResolved && (
              <span className="text-[12px] font-semibold text-verified bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Action applied
              </span>
            )}
          </div>

          <div className="p-4 bg-paper rounded-panel border border-rule space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink text-[14px]">
                {proposedAction.title}
              </span>
              <span className="text-[11px] font-mono uppercase bg-white border border-rule px-2 py-0.5 rounded text-ink-soft font-semibold">
                {proposedAction.action_type.replace('_', ' ')}
              </span>
            </div>

            <p className="text-[13px] text-ink-soft leading-relaxed">
              {proposedAction.impact_statement}
            </p>

            {proposedAction.target_field && (
              <div className="grid grid-cols-2 gap-3 text-[12px] pt-2 border-t border-rule">
                <div>
                  <span className="text-ink-soft block">Current ERP state</span>
                  <span className="font-mono text-ink mt-0.5 block line-through opacity-70">
                    {proposedAction.old_value || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-ink-soft block">Proposed mutation</span>
                  <span className="font-mono text-verified font-medium mt-0.5 block">
                    {proposedAction.new_value || 'None'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!isResolved && proposedAction.status === 'pending' && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-rule">
              <button
                type="button"
                onClick={() => setIsAskModalOpen(true)}
                className="h-[36px] px-3 rounded-control text-ink-soft hover:text-ink text-[13px] font-medium flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Ask vendor for details</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onReject}
                  className="h-[36px] px-4 rounded-control border border-rule hover:bg-paper text-ink text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4 text-escalated" />
                  <span>Decline</span>
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  className="h-[36px] px-4 rounded-control bg-verified hover:bg-verified/90 text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve & execute</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ask Vendor Modal */}
      <AskDetailModal
        isOpen={isAskModalOpen}
        caseId={caseId}
        vendorName={vendorName}
        onClose={() => setIsAskModalOpen(false)}
        onSubmit={handleInquirySubmit}
      />
    </div>
  );
};
