import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Info,
  Copy,
  Check,
  AlertCircle,
  Volume2,
  Square,
  X,
  RotateCcw,
} from 'lucide-react';
import { explainSignPhrase } from '../services/api';
import { GeminiExplainerResult } from '../types';

const EXAMPLE_PHRASES = [
  'Where is the emergency room?',
  'Please speak slowly.',
  'Good morning, how can I help you?',
  'I need a doctor.',
  'Can you please write it down?',
  'Where is the bathroom?',
  'Thank you very much.',
  'Hello',
];

export const SignExplainerPage: React.FC = () => {
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeminiExplainerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Stop TTS if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleExplain = async (selectedText?: string) => {
    const textToAnalyze = (selectedText || phrase).trim();
    if (!textToAnalyze) {
      setError('Please enter an English sentence, phrase, or word to explain.');
      return;
    }

    // Stop active audio
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    setPhrase(textToAnalyze);
    setError(null);
    setLoading(true);

    try {
      const data = await explainSignPhrase(textToAnalyze);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to explain phrase with AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyExplanation = async () => {
    if (!result) return;
    const summary =
      `HearMe AI - Sign Language Guidance for "${result.phrase}"\n\n` +
      `1. Meaning: ${result.meaning}\n\n` +
      `2. Communication Context: ${result.context}\n\n` +
      `3. Simple Explanation: ${result.simpleExplanation}\n\n` +
      `4. Sign Language Guidance:\n${result.signGuidance}\n\n` +
      `5. Polite Alternatives: ${result.politeAlternatives.join(', ')}\n\n` +
      `6. Reference Standard: ${result.verifiedReferenceNote}`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleReadAloud = () => {
    if (!result) return;

    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    // Clean narration text for natural speech synthesis
    const cleanGuidance = result.signGuidance.replace(/[•*\-#]/g, '').trim();
    const narration = `Sign language explanation for: ${result.phrase}. ` +
      `Meaning: ${result.meaning}. ` +
      `Communication context: ${result.context}. ` +
      `Kinetic sign guidance: ${cleanGuidance}`;

    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setPhrase('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block">
              Gemini AI Assisted • Universal Explainer
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
            AI Sign Language Explainer
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5 max-w-xl">
            Analyze any English sentence, phrase, or word to understand conversational context, deaf communication etiquette, and kinetic sign guidance.
          </p>
        </div>

        {/* Input Area */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-black block">
            Enter Any English Sentence, Phrase, or Word:
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                placeholder="e.g. Where is the emergency room? / Please speak slowly / Doctor"
                className="w-full px-4 py-3.5 pr-9 bg-white border border-[#D4D4D4] rounded-xl text-xs sm:text-sm text-black placeholder-[#777777] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              {phrase && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-black transition-colors"
                  title="Clear input"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleExplain()}
              disabled={loading || !phrase.trim()}
              className="px-7 py-3.5 rounded-xl bg-black hover:bg-[#1C1C1C] text-white text-xs sm:text-sm font-semibold tracking-wide disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
            >
              <span>Explain</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Outlined Example Chips */}
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#777777] font-mono text-[11px]">EXAMPLES:</span>
            {EXAMPLE_PHRASES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExplain(ex)}
                disabled={loading}
                className="px-3 py-1 rounded-full border border-[#D4D4D4] hover:border-black text-black text-xs font-medium bg-white transition-colors cursor-pointer hover:bg-neutral-50"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Minimal Monochrome Loading State */}
          {loading && (
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-[#555555]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span>Analyzing linguistic structure and generating kinetic sign guidance...</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-white border border-red-300 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Response */}
        {result && !loading && (
          <div className="p-6 sm:p-10 rounded-2xl bg-white border border-[#E5E5E5] space-y-8 shadow-sm animate-in fade-in duration-300">
            
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E5E5]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777]">
                  Analysis Result
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-1">
                  "{result.phrase}"
                </h2>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                {/* Read Aloud Button */}
                <button
                  onClick={handleReadAloud}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isPlayingAudio
                      ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-[#D4D4D4] hover:border-black text-black bg-white hover:bg-neutral-50'
                  }`}
                  title={isPlayingAudio ? 'Stop reading' : 'Read aloud with Text-to-Speech'}
                  aria-label={isPlayingAudio ? 'Stop reading' : 'Read aloud with Text-to-Speech'}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopyExplanation}
                  className="px-3.5 py-2 rounded-lg border border-[#D4D4D4] hover:border-black text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white hover:bg-neutral-50"
                  aria-label="Copy entire explanation"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Explanation'}</span>
                </button>
              </div>
            </div>

            {/* Sections with Thin Dividers */}
            <div className="space-y-6 divide-y divide-[#E5E5E5]">
              
              {/* 1. Meaning of the Phrase */}
              <div className="pt-2 space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                  1. Meaning of the Phrase / Sentence
                </h3>
                <p className="text-sm font-semibold text-black leading-relaxed">
                  {result.meaning}
                </p>
              </div>

              {/* 2. Communication Context */}
              <div className="pt-5 space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                  2. Communication Context & Setting
                </h3>
                <p className="text-sm text-[#555555] leading-relaxed">
                  {result.context}
                </p>
              </div>

              {/* 3. Simple English Explanation & Deaf Etiquette */}
              <div className="pt-5 space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                  3. Simple English Explanation & Deaf Etiquette
                </h3>
                <p className="text-sm text-[#444444] leading-relaxed">
                  {result.simpleExplanation}
                </p>
              </div>

              {/* 4. Relevant Sign-Learning Guidance */}
              <div className="pt-5 space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>4. Sign Language Visual & Kinetic Guidance</span>
                </h3>
                <div className="p-4 sm:p-5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5]">
                  <p className="text-xs sm:text-sm text-black font-medium leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                    {result.signGuidance}
                  </p>
                </div>
              </div>

              {/* 5. Alternative Polite Expressions */}
              <div className="pt-5 space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                  5. Alternative Polite English Expressions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.politeAlternatives.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => handleExplain(alt)}
                      className="px-3 py-1.5 rounded-lg bg-[#F7F7F7] hover:bg-neutral-200 border border-[#E5E5E5] text-xs text-black font-mono transition-colors cursor-pointer text-left"
                      title="Click to analyze this expression"
                    >
                      "{alt}"
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Verified Sign Reference Standard */}
              <div className="pt-5 space-y-1 text-xs">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>6. Verification Standard</span>
                </h3>
                <p className="text-[#666666] leading-relaxed">
                  {result.verifiedReferenceNote}
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
