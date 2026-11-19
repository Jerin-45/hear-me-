import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Download,
  List,
  CheckSquare,
  Calendar,
  Info,
} from 'lucide-react';
import { summarizeTranscript } from '../services/api';
import { SummarizerOutput } from '../types';

const SAMPLE_LECTURE = `Welcome everyone to Biology 101. Please note that your term research assignment is due next Friday by 5:00 PM. Before writing, read Chapters 4 and 5 in the textbook. Ensure your citations follow APA formatting. Submit your final paper as a PDF through the online college portal. We will hold an optional review session on Wednesday at 2:00 PM in Hall B.`;

const SAMPLE_DOCTOR_APPOINTMENT = `Doctor: Good morning. Your blood pressure is slightly elevated today at 135 over 88. I am prescribing Lisinopril 10mg once daily in the morning with water. Please schedule a follow-up blood test in two weeks. Remember to monitor your salt intake and walk for 30 minutes each day. The pharmacy will have your medication ready by 4:00 PM today.`;

export const SummarizerPage: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      setError('Please paste or enter a transcript to summarize.');
      return;
    }
    if (transcript.trim().length < 15) {
      setError('Please provide at least 15 characters of text for meaningful summarization.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await summarizeTranscript(transcript);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setResult(null);
    setError(null);
  };

  const handleCopySummary = async () => {
    if (!result) return;
    const compiled =
      `HearMe AI - Executive Summary\n` +
      `===============================\n\n` +
      `Overview:\n${result.shortSummary}\n\n` +
      `Key Points:\n${result.importantPoints.map((p) => '• ' + p).join('\n')}\n\n` +
      `Actions:\n${result.tasksAndActions.map((t) => '• ' + t).join('\n')}\n\n` +
      `Deadlines:\n${result.datesAndDeadlines.map((d) => '• ' + d).join('\n')}\n\n` +
      `Instructions:\n${result.instructions.map((i) => '• ' + i).join('\n')}\n\n` +
      `Simple Explanation:\n${result.simpleExplanation}`;

    try {
      await navigator.clipboard.writeText(compiled);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { }
  };

  const handleDownloadSummary = () => {
    if (!result) return;
    const compiled =
      `HearMe AI - Conversation Summary\n` +
      `Date: ${new Date().toLocaleString()}\n` +
      `===============================\n\n` +
      `Overview:\n${result.shortSummary}\n\n` +
      `Key Points:\n${result.importantPoints.map((p) => '• ' + p).join('\n')}\n\n` +
      `Actions:\n${result.tasksAndActions.map((t) => '• ' + t).join('\n')}\n\n` +
      `Deadlines:\n${result.datesAndDeadlines.map((d) => '• ' + d).join('\n')}\n\n` +
      `Instructions:\n${result.instructions.map((i) => '• ' + i).join('\n')}\n\n` +
      `Simple Explanation:\n${result.simpleExplanation}`;

    const blob = new Blob([compiled], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hearme-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block mb-1">
              Gemini AI Summarization
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              AI Conversation Summarizer
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-mono">
              EXTRACT OVERVIEW • KEY POINTS • ACTIONS • DEADLINES
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#777777]">SAMPLES:</span>
            <button
              onClick={() => setTranscript(SAMPLE_LECTURE)}
              className="px-2.5 py-1 rounded border border-[#D4D4D4] hover:border-black bg-white transition-colors"
            >
              Lecture
            </button>
            <button
              onClick={() => setTranscript(SAMPLE_DOCTOR_APPOINTMENT)}
              className="px-2.5 py-1 rounded border border-[#D4D4D4] hover:border-black bg-white transition-colors"
            >
              Doctor Visit
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-white border border-black text-black text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Two-Column Minimalist Layout on Desktop (Stacked on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Column: Transcript Input */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Transcript Input:
              </label>
              <span className="text-xs font-mono text-[#777777]">
                {transcript.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={12}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste meeting notes, lecture transcripts, or dialogue to summarize..."
              className="w-full p-4 rounded-xl bg-white border border-[#D4D4D4] text-xs sm:text-sm text-black placeholder-[#777777] focus:outline-none focus:border-black focus:ring-1 focus:ring-black leading-relaxed"
            />

            {/* Actions: Summarize (Black), Clear */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleSummarize}
                  disabled={loading || !transcript.trim()}
                  className="px-6 py-3 rounded-xl bg-black hover:bg-[#1C1C1C] text-white text-xs sm:text-sm font-semibold tracking-wide disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  <span>Summarize</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClear}
                  disabled={!transcript.trim() && !result}
                  className="p-3 rounded-xl border border-[#E5E5E5] hover:border-black text-[#555555] hover:text-black disabled:opacity-30 transition-colors"
                  title="Clear"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {loading && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#555555]">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Summary Output */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Executive Digest:
              </span>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="px-3 py-1.5 rounded-lg border border-[#D4D4D4] hover:border-black text-black text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSummary}
                    className="p-1.5 rounded-lg border border-[#D4D4D4] hover:border-black text-black transition-colors"
                    title="Download summary"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {!result && !loading && (
              <div className="py-20 text-center text-[#777777] space-y-2">
                <FileText className="w-8 h-8 mx-auto text-[#AAAAAA]" />
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                  No Summary Generated Yet
                </h3>
                <p className="text-xs text-[#777777] max-w-xs mx-auto">
                  Paste a transcript on the left and click "Summarize" to view key directives and deadlines.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6 divide-y divide-[#E5E5E5]">

                {/* 1. Overview */}
                <div className="pt-1 space-y-1">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-black font-semibold leading-relaxed">
                    {result.shortSummary}
                  </p>
                </div>

                {/* 2. Key Points */}
                <div className="pt-4 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <List className="w-3.5 h-3.5" />
                    <span>Key Points</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#444444]">
                    {result.importantPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Actions */}
                <div className="pt-4 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Actions</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#444444]">
                    {result.tasksAndActions.map((task, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Deadlines */}
                <div className="pt-4 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadlines</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#444444]">
                    {result.datesAndDeadlines.map((dl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span>{dl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Simple English Explanation */}
                <div className="pt-4 space-y-1 text-xs">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777777]">
                    Simplified Explanation
                  </h4>
                  <p className="text-[#555555] leading-relaxed">
                    {result.simpleExplanation}
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
