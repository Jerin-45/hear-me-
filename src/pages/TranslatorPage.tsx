import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Languages,
  ArrowRightLeft,
  ArrowRight,
  Volume2,
  Square,
  Copy,
  Check,
  Mic,
  MicOff,
  X,
  Sparkles,
  BookOpen,
  RotateCcw,
  Clock,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { SupportedLanguageCode, TranslationResult } from '../types';
import { TEN_LANGUAGES, getLanguageInfo } from '../services/languages';
import { translateText } from '../services/translator';
import {
  speakText,
  stopSpeech,
  createSpeechRecognitionInstance,
  isSpeechRecognitionSupported,
} from '../services/speech';

interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: SupportedLanguageCode;
  toLang: SupportedLanguageCode;
  timestamp: string;
}

export const TranslatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  // State
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState<string | undefined>(undefined);
  const [fromLang, setFromLang] = useState<SupportedLanguageCode>('en-IN');
  const [toLang, setToLang] = useState<SupportedLanguageCode>('ta-IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingSource, setIsPlayingSource] = useState(false);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('hearme_trans_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recognitionRef = useRef<any>(null);
  const debounceTimerRef = useRef<any>(null);

  const fromInfo = getLanguageInfo(fromLang);
  const toInfo = getLanguageInfo(toLang);

  // Stop speech & mic on unmount
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

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hearme_trans_history', JSON.stringify(history.slice(0, 10)));
    } catch {}
  }, [history]);

  // Execute translation
  const handleTranslate = async (textToTranslate?: string) => {
    const text = (textToTranslate !== undefined ? textToTranslate : sourceText).trim();
    if (!text) {
      setTranslatedText('');
      setPronunciation(undefined);
      return;
    }

    // Stop active audio
    stopSpeech();
    setIsPlayingSource(false);
    setIsPlayingTarget(false);

    setLoading(true);
    setError(null);

    try {
      const result: TranslationResult = await translateText(text, fromLang, toLang);
      setTranslatedText(result.translatedText);
      setPronunciation(result.pronunciation);

      // Add to history if unique
      if (result.translatedText && result.translatedText !== text) {
        setHistory((prev) => {
          const filtered = prev.filter(
            (item) => !(item.sourceText === text && item.toLang === toLang)
          );
          return [
            {
              id: `tr_${Date.now()}`,
              sourceText: text,
              translatedText: result.translatedText,
              fromLang,
              toLang,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...filtered,
          ].slice(0, 8);
        });
      }
    } catch (err: any) {
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    const prevFrom = fromLang;
    const prevTo = toLang;
    const prevSource = sourceText;
    const prevTarget = translatedText;

    setFromLang(prevTo);
    setToLang(prevFrom);
    setSourceText(prevTarget || prevSource);
    setTranslatedText(prevTarget ? prevSource : '');
    setPronunciation(undefined);

    if (prevTarget) {
      setTimeout(() => {
        handleTranslate(prevTarget);
      }, 50);
    }
  };

  // Speech Recognition input
  const toggleListening = () => {
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
      const recognition = createSpeechRecognitionInstance(fromLang);
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
        setSourceText(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (sourceText.trim()) {
          handleTranslate(sourceText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      setIsListening(false);
    }
  };

  // Read aloud source text
  const handleReadSource = () => {
    if (!sourceText.trim()) return;

    if (isPlayingSource) {
      stopSpeech();
      setIsPlayingSource(false);
      return;
    }

    stopSpeech();
    setIsPlayingTarget(false);
    setIsPlayingSource(true);

    speakText(sourceText, {
      lang: fromLang,
      rate: 0.95,
      onEnd: () => setIsPlayingSource(false),
      onError: () => setIsPlayingSource(false),
    });
  };

  // Read aloud translated target text
  const handleReadTarget = () => {
    if (!translatedText.trim()) return;

    if (isPlayingTarget) {
      stopSpeech();
      setIsPlayingTarget(false);
      return;
    }

    stopSpeech();
    setIsPlayingSource(false);
    setIsPlayingTarget(true);

    speakText(translatedText, {
      lang: toLang,
      rate: 0.95,
      onEnd: () => setIsPlayingTarget(false),
      onError: () => setIsPlayingTarget(false),
    });
  };

  // Copy translated text
  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Open in Sign Explainer
  const handleOpenInSignExplainer = () => {
    const textToExplain = translatedText || sourceText;
    if (!textToExplain) return;
    // Store in session storage so Sign Explainer can prefill it
    sessionStorage.setItem('hearme_explainer_prefill', textToExplain);
    navigate('/sign-explainer');
  };

  // Quick phrase select
  const handleSelectQuickPhrase = (phrase: string) => {
    setSourceText(phrase);
    handleTranslate(phrase);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0A0A0A] text-black dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] dark:text-[#999999] flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Universal Multilingual Translator • 10 Languages</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live AI Translation
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
            Multilingual Voice & Text Translator
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#AAAAAA] mt-1.5 max-w-2xl leading-relaxed">
            Translate spoken and typed communication seamlessly between Tamil (தமிழ்), Malayalam (മലയാളം), Hindi (हिन्दी), English, Telugu, Kannada, Bengali, Marathi, Gujarati, and Punjabi with instant speech output and sign-language explanation.
          </p>
        </div>

        {/* Translation Workstation (Two-Pane Grid) */}
        <div className="rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-sm">
          
          {/* Top Bar: Language Selectors & Swap */}
          <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between gap-3 flex-wrap bg-[#FAFAFA] dark:bg-[#161616]">
            
            {/* Source Language Selector */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#777777] dark:text-[#888888]">
                From:
              </span>
              <select
                value={fromLang}
                onChange={(e) => {
                  setFromLang(e.target.value as SupportedLanguageCode);
                  if (sourceText.trim()) {
                    setTimeout(() => handleTranslate(), 50);
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-[#D4D4D4] dark:border-[#333333] rounded-lg text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
              >
                {TEN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              className="p-2.5 rounded-full border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-[#F2F2F2] dark:hover:bg-[#252525] transition-all cursor-pointer shadow-sm active:scale-95"
              title="Swap Languages"
              aria-label="Swap source and target languages"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            {/* Target Language Selector */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#777777] dark:text-[#888888]">
                To:
              </span>
              <select
                value={toLang}
                onChange={(e) => {
                  setToLang(e.target.value as SupportedLanguageCode);
                  if (sourceText.trim()) {
                    setTimeout(() => handleTranslate(), 50);
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-[#D4D4D4] dark:border-[#333333] rounded-lg text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
              >
                {TEN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Panes Grid: Left (Source) & Right (Target) */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5] dark:divide-[#262626]">
            
            {/* Left Pane: Source Input */}
            <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] dark:text-[#888888] mb-2">
                  <span>INPUT ({fromInfo.nativeName})</span>
                  <span>{sourceText.length} characters</span>
                </div>
                
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleTranslate();
                    }
                  }}
                  rows={6}
                  placeholder={`Type or speak text in ${fromInfo.nativeName} (e.g. ${fromInfo.sampleGreeting})...`}
                  className="w-full p-3.5 bg-transparent border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm sm:text-base text-black dark:text-white placeholder-[#888888] dark:placeholder-[#666666] focus:outline-none focus:border-black dark:focus:border-white resize-none transition-colors"
                />
              </div>

              {/* Source Controls */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0F0F0] dark:border-[#1E1E1E] flex-wrap">
                <div className="flex items-center gap-1.5">
                  {/* Voice Input Mic */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E]'
                    }`}
                    title={isListening ? 'Stop listening' : `Speak in ${fromInfo.nativeName}`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                  </button>

                  {/* Speak Source Text */}
                  {sourceText && (
                    <button
                      type="button"
                      onClick={handleReadSource}
                      className="p-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Read aloud source text"
                    >
                      {isPlayingSource ? <Square className="w-3.5 h-3.5 fill-current text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isPlayingSource ? 'Stop' : 'Listen'}</span>
                    </button>
                  )}

                  {/* Clear button */}
                  {sourceText && (
                    <button
                      type="button"
                      onClick={() => {
                        setSourceText('');
                        setTranslatedText('');
                        setPronunciation(undefined);
                      }}
                      className="p-2 rounded-lg text-[#888888] hover:text-black dark:hover:text-white transition-colors"
                      title="Clear source text"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Translate Action Button */}
                <button
                  type="button"
                  onClick={() => handleTranslate()}
                  disabled={loading || !sourceText.trim()}
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold tracking-wide disabled:opacity-40 hover:bg-[#1C1C1C] dark:hover:bg-[#E5E5E5] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>{loading ? 'Translating...' : 'Translate'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Pane: Target Output */}
            <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-[#FAFAFA] dark:bg-[#141414]">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] dark:text-[#888888] mb-2">
                  <span>TRANSLATION ({toInfo.nativeName})</span>
                  {loading && (
                    <span className="flex items-center gap-1 text-black dark:text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <span>Processing...</span>
                    </span>
                  )}
                </div>

                <div className="min-h-[148px] p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-sm sm:text-base font-medium text-black dark:text-white flex flex-col justify-between">
                  {translatedText ? (
                    <div>
                      <p className="leading-relaxed select-all whitespace-pre-wrap">
                        {translatedText}
                      </p>
                      {pronunciation && (
                        <p className="mt-2 text-xs font-mono text-[#777777] dark:text-[#888888] italic">
                          Pronunciation: {pronunciation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-[#888888] dark:text-[#666666] italic">
                      {loading
                        ? 'Translating with HearMe AI Multilingual Engine...'
                        : 'Translation will appear here instantly...'}
                    </p>
                  )}
                </div>
              </div>

              {/* Target Controls */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAEAEA] dark:border-[#222222] flex-wrap">
                <div className="flex items-center gap-1.5">
                  {/* Speak Target Text */}
                  <button
                    type="button"
                    onClick={handleReadTarget}
                    disabled={!translatedText}
                    className="p-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
                    title={`Read aloud in ${toInfo.nativeName}`}
                  >
                    {isPlayingTarget ? <Square className="w-3.5 h-3.5 fill-current text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlayingTarget ? 'Stop Audio' : `Listen (${toInfo.shortLabel})`}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!translatedText}
                    className="p-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
                    title="Copy translated text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* View in Sign Language Explainer Button */}
                <button
                  type="button"
                  onClick={handleOpenInSignExplainer}
                  disabled={!translatedText && !sourceText}
                  className="px-3.5 py-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Explain in Indian Sign Language (ISL)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Explain in Sign (ISL)</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#1A1111] border border-red-300 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Accessibility Phrases */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Everyday Accessibility Quick Phrases ({fromInfo.nativeName})</span>
            </h2>
            <span className="text-[11px] font-mono text-[#777777] dark:text-[#888888]">
              Click to translate instantly
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {fromInfo.quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuickPhrase(phrase)}
                className="px-3.5 py-1.5 rounded-full border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-xs font-medium text-black dark:text-white bg-white dark:bg-[#1A1A1A] hover:bg-neutral-50 dark:hover:bg-[#252525] transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Translation History */}
        {history.length > 0 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Translations ({history.length})</span>
              </h2>
              <button
                onClick={() => setHistory([])}
                className="text-[11px] font-mono text-[#888888] hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((item) => {
                const itemFrom = getLanguageInfo(item.fromLang);
                const itemTo = getLanguageInfo(item.toLang);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setFromLang(item.fromLang);
                      setToLang(item.toLang);
                      setSourceText(item.sourceText);
                      setTranslatedText(item.translatedText);
                    }}
                    className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#161616] hover:border-black dark:hover:border-white transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#777777] dark:text-[#888888]">
                      <span>
                        {itemFrom.flag} {itemFrom.shortLabel} → {itemTo.flag} {itemTo.shortLabel}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="text-xs font-semibold text-black dark:text-white line-clamp-1">
                      {item.sourceText}
                    </p>
                    <p className="text-xs text-[#555555] dark:text-[#AAAAAA] line-clamp-1 font-medium">
                      {item.translatedText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
