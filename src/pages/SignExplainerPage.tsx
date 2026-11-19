import React, { useState, useEffect, useRef } from 'react';
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
  Mic,
  MicOff,
  Globe,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { explainSignPhrase } from '../services/api';
import { GeminiExplainerResult, SupportedLanguageCode } from '../types';
import { TEN_LANGUAGES } from '../services/languages';
import {
  speakText,
  stopSpeech,
  createSpeechRecognitionInstance,
  isSpeechRecognitionSupported,
} from '../services/speech';

export const SignExplainerPage: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeminiExplainerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const activeLangCode = settings.speechRecognitionDialect || 'en-IN';
  const activeLang =
    TEN_LANGUAGES.find((l) => l.code === activeLangCode) || TEN_LANGUAGES[0];

  // Stop TTS and Speech recognition on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleSelectLanguage = (code: SupportedLanguageCode) => {
    updateSetting('speechRecognitionDialect', code);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
    stopSpeech();
    setIsPlayingAudio(false);
  };

  const toggleMicListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = createSpeechRecognitionInstance(activeLang.code);
      if (!recognition) return;

      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setPhrase(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error in Sign Explainer:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleExplain = async (selectedText?: string) => {
    const textToAnalyze = (selectedText || phrase).trim();
    if (!textToAnalyze) {
      setError(`Please enter a phrase or word in ${activeLang.nativeName} or English.`);
      return;
    }

    // Stop active audio and mic
    stopSpeech();
    setIsPlayingAudio(false);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
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
      `HearMe AI - Sign Language Guidance for "${result.phrase}" (${activeLang.nativeName})\n\n` +
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
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    stopSpeech();

    // Clean narration text for natural speech synthesis
    const cleanGuidance = result.signGuidance.replace(/[•*\-#]/g, '').trim();
    const narration =
      `Sign language explanation for: ${result.phrase}. ` +
      `Meaning: ${result.meaning}. ` +
      `Communication context: ${result.context}. ` +
      `Kinetic sign guidance: ${cleanGuidance}`;

    setIsPlayingAudio(true);
    speakText(narration, {
      lang: activeLang.code,
      rate: 0.95,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleClear = () => {
    setPhrase('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0A0A0A] text-black dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] dark:text-[#999999] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Gemini AI Assisted • 10 Languages Supported</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
            AI Sign Language Explainer
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#AAAAAA] mt-1.5 max-w-2xl leading-relaxed">
            Analyze any sentence, phrase, or word in Tamil (தமிழ்), Malayalam (മലയാളം), Hindi (हिन्दी), English, or 6 other Indian languages to understand conversational context, deaf communication etiquette, and kinetic sign guidance.
          </p>

          {/* 10-Language Selector Pills */}
          <div className="pt-5 border-t border-[#E5E5E5] dark:border-[#262626] mt-5">
            <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666666] dark:text-[#888888] flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Select Analysis Language:</span>
              </span>
              <span className="text-xs font-mono font-bold text-black dark:text-white">
                {activeLang.flag} {activeLang.nativeName} ({activeLang.code})
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {TEN_LANGUAGES.map((lang) => {
                const isSelected = lang.code === activeLangCode;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-semibold'
                        : 'bg-[#F2F2F2] dark:bg-[#1E1E1E] text-[#555555] dark:text-[#BBBBBB] hover:bg-[#E5E5E5] dark:hover:bg-[#2A2A2A] hover:text-black dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
              Enter Any Sentence, Phrase, or Word ({activeLang.nativeName}):
            </label>
            <span className="text-[11px] font-mono text-[#777777] dark:text-[#999999]">
              Type or speak using the microphone
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                placeholder={
                  activeLang.code === 'ta-IN'
                    ? 'எ.கா. வணக்கம் / மருத்துவமனை எங்கே உள்ளது? / தயவுசெய்து மெதுவாக பேசுங்கள்'
                    : activeLang.code === 'ml-IN'
                    ? 'ഉദാ. നമസ്കാരം / ആശുപത്രി എവിടെയാണ്? / ദയവായി പതുക്കെ സംസാരിക്കൂ'
                    : activeLang.code === 'hi-IN'
                    ? 'उदा. नमस्ते / अस्पताल कहाँ है? / कृपया धीरे बोलें'
                    : 'e.g. Where is the emergency room? / Please speak slowly / Doctor / Hello'
                }
                className="w-full px-4 py-3.5 pr-20 bg-white dark:bg-[#1A1A1A] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-xs sm:text-sm text-black dark:text-white placeholder-[#777777] dark:placeholder-[#666666] focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {phrase && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 text-[#888888] hover:text-black dark:hover:text-white transition-colors"
                    title="Clear input"
                    aria-label="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Speech-to-Text Microphone Input */}
                <button
                  type="button"
                  onClick={toggleMicListening}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-[#666666] dark:text-[#AAAAAA] hover:text-black dark:hover:text-white hover:bg-[#F2F2F2] dark:hover:bg-[#252525]'
                  }`}
                  title={isListening ? 'Stop listening' : `Speak in ${activeLang.nativeName}`}
                  aria-label={isListening ? 'Stop listening' : `Speak in ${activeLang.nativeName}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => handleExplain()}
              disabled={loading || !phrase.trim()}
              className="px-7 py-3.5 rounded-xl bg-black dark:bg-white hover:bg-[#1C1C1C] dark:hover:bg-[#E5E5E5] text-white dark:text-black text-xs sm:text-sm font-semibold tracking-wide disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
            >
              <span>Explain</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Outlined Example Chips Localized to Active Language */}
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#777777] dark:text-[#888888] font-mono text-[11px]">
              {activeLang.shortLabel} EXAMPLES:
            </span>
            {activeLang.quickPhrases.slice(0, 6).map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExplain(ex)}
                disabled={loading}
                className="px-3 py-1 rounded-full border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white text-xs font-medium bg-white dark:bg-[#1A1A1A] transition-colors cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#252525]"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Minimal Monochrome Loading State */}
          {loading && (
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-[#555555] dark:text-[#AAAAAA]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span>Analyzing linguistic structure and generating kinetic sign guidance in {activeLang.nativeName}...</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#1A1111] border border-red-300 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Response */}
        {result && !loading && (
          <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-8 shadow-sm animate-in fade-in duration-300">
            
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777] dark:text-[#888888]">
                  Analysis Result • {activeLang.nativeName} ({activeLang.code})
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight mt-1">
                  "{result.phrase}"
                </h2>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                {/* Read Aloud Button */}
                <button
                  onClick={handleReadAloud}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isPlayingAudio
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100'
                      : 'border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1A1A1A] hover:bg-neutral-50 dark:hover:bg-[#252525]'
                  }`}
                  title={isPlayingAudio ? 'Stop reading' : `Read aloud in ${activeLang.nativeName}`}
                  aria-label={isPlayingAudio ? 'Stop reading' : `Read aloud in ${activeLang.nativeName}`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read Aloud ({activeLang.shortLabel})</span>
                    </>
                  )}
                </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopyExplanation}
                  className="px-3.5 py-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white dark:bg-[#1A1A1A] hover:bg-neutral-50 dark:hover:bg-[#252525]"
                  aria-label="Copy entire explanation"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Explanation'}</span>
                </button>
              </div>
            </div>

            {/* Sections with Thin Dividers */}
            <div className="space-y-6 divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              
              {/* 1. Meaning of the Phrase */}
              <div className="pt-2 space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  1. Meaning of the Phrase / Sentence
                </h3>
                <p className="text-sm font-semibold text-black dark:text-white leading-relaxed">
                  {result.meaning}
                </p>
              </div>

              {/* 2. Communication Context */}
              <div className="pt-5 space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  2. Communication Context & Setting
                </h3>
                <p className="text-sm text-[#555555] dark:text-[#AAAAAA] leading-relaxed">
                  {result.context}
                </p>
              </div>

              {/* 3. Simple Explanation & Deaf Etiquette */}
              <div className="pt-5 space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  3. Accessible Explanation & Deaf Etiquette
                </h3>
                <p className="text-sm text-[#444444] dark:text-[#BBBBBB] leading-relaxed">
                  {result.simpleExplanation}
                </p>
              </div>

              {/* 4. Relevant Sign-Learning Guidance */}
              <div className="pt-5 space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>4. Sign Language Visual & Kinetic Guidance (ISL)</span>
                </h3>
                <div className="p-4 sm:p-5 rounded-xl bg-[#F7F7F7] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#2E2E2E]">
                  <p className="text-xs sm:text-sm text-black dark:text-white font-medium leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                    {result.signGuidance}
                  </p>
                </div>
              </div>

              {/* 5. Alternative Polite Expressions */}
              <div className="pt-5 space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  5. Alternative Expressions & Phrasing
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.politeAlternatives.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => handleExplain(alt)}
                      className="px-3 py-1.5 rounded-lg bg-[#F7F7F7] dark:bg-[#1A1A1A] hover:bg-neutral-200 dark:hover:bg-[#2A2A2A] border border-[#E5E5E5] dark:border-[#2E2E2E] text-xs text-black dark:text-white font-mono transition-colors cursor-pointer text-left"
                      title="Click to analyze this expression"
                    >
                      "{alt}"
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Verified Sign Reference Standard */}
              <div className="pt-5 space-y-1 text-xs">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>6. Verification Standard</span>
                </h3>
                <p className="text-[#666666] dark:text-[#999999] leading-relaxed">
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
