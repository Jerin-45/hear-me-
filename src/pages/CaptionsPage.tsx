import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Copy,
  Download,
  Save,
  Globe,
  Contrast,
  AlertCircle,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { isSpeechRecognitionSupported, createSpeechRecognitionInstance, ISpeechRecognition } from '../services/speech';
import { TEN_LANGUAGES, getLanguageInfo } from '../services/languages';

export const CaptionsPage: React.FC = () => {
  const { settings, updateSetting, saveTranscript, getFontSizeClass } = useSettings();
  
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef(isListening);
  const isPausedRef = useRef(isPaused);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  isListeningRef.current = isListening;
  isPausedRef.current = isPaused;

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    let interval: any = null;
    if (isListening && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening, isPaused]);

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorStatus(null);
    if (!supported) {
      setErrorStatus('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    try {
      const rec = createSpeechRecognitionInstance(settings.speechRecognitionDialect);
      if (!rec) return;

      rec.onstart = () => {
        setIsListening(true);
        setIsPaused(false);
      };

      rec.onresult = (event: any) => {
        if (isPausedRef.current) return;

        let interim = '';
        let finalized = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalized += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        if (finalized) {
          setTranscript((prev) => (prev ? prev + ' ' + finalized.trim() : finalized.trim()));
          setInterimText('');
        } else {
          setInterimText(interim);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorStatus('Microphone permission was denied. Please allow microphone access in your browser.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Idle silence, keep listening
        } else {
          setErrorStatus(`Recognition notice: ${event.error}.`);
        }
      };

      rec.onend = () => {
        if (isListeningRef.current && !isPausedRef.current) {
          try {
            rec.start();
          } catch (e) {}
        } else {
          setIsListening(false);
        }
      };

      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
      setIsPaused(false);
    } catch (err: any) {
      setErrorStatus(err.message || 'Failed to start microphone speech recognition.');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setIsPaused(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const togglePause = () => {
    if (!isListening) return;
    setIsPaused((prev) => !prev);
  };

  const handleClear = () => {
    setTranscript('');
    setInterimText('');
    setElapsedSeconds(0);
  };

  const handleCopy = async () => {
    const fullText = (transcript + ' ' + interimText).trim();
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleDownloadTxt = () => {
    const fullText = (transcript + ' ' + interimText).trim();
    if (!fullText) return;

    const element = document.createElement('a');
    const file = new Blob([
      `HearMe AI - Live Caption Transcript\n` +
      `Date: ${new Date().toLocaleString()}\n` +
      `Dialect: ${settings.speechRecognitionDialect}\n` +
      `Duration: ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s\n` +
      `-----------------------------------------\n\n` +
      fullText
    ], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `hearme-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveToHistory = () => {
    const fullText = (transcript + ' ' + interimText).trim();
    if (!fullText) return;

    saveTranscript({
      title: `Caption Session (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      content: fullText,
      durationSeconds: elapsedSeconds,
      wordCount: fullText.split(/\s+/).filter(Boolean).length,
      dialect: settings.speechRecognitionDialect,
    });

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const wordCount = (transcript + ' ' + interimText).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Toolbar */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black">
                Live Caption Studio
              </h1>
            </div>
            <p className="text-xs text-[#666666] mt-1 font-mono">
              REAL-TIME MULTILINGUAL SPEECH-TO-TEXT (10 LANGUAGES) • ACCESSIBLE TYPOGRAPHY
            </p>
          </div>

          {/* Dialect & Contrast Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 10-Language Selector */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1.5 font-mono text-xs">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={settings.speechRecognitionDialect}
                onChange={(e) => {
                  const newCode = e.target.value as any;
                  if (isListening) {
                    stopListening();
                    updateSetting('speechRecognitionDialect', newCode);
                    setTimeout(() => startListening(), 250);
                  } else {
                    updateSetting('speechRecognitionDialect', newCode);
                  }
                }}
                className="bg-transparent text-xs font-semibold text-black focus:outline-none cursor-pointer"
                title="Select Speech Recognition Language (10 Languages)"
              >
                {TEN_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
                settings.highContrast
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-[#E5E5E5] hover:border-black'
              }`}
            >
              {settings.highContrast ? 'Contrast ON' : 'High Contrast'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorStatus && (
          <div className="p-4 rounded-xl bg-white border border-black text-black text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-black shrink-0" />
              <span className="font-medium">{errorStatus}</span>
            </div>
            <button
              onClick={() => setErrorStatus(null)}
              className="text-xs underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Listening Status & Action Control Bar */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] flex flex-wrap items-center justify-between gap-5">
          
          {/* Main Microphone Button with Animated Expanding Rings */}
          <div className="flex items-center gap-4">
            {!isListening ? (
              <button
                onClick={startListening}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-black text-white hover:bg-[#1C1C1C] active:scale-95 transition-all text-xs sm:text-sm font-semibold tracking-wide shadow-md"
              >
                <Mic className="w-4 h-4" />
                <span>Start Listening</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Animated Black Circular Mic Button with expanding rings */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-12 h-12 rounded-full border border-black animate-ping opacity-25" />
                  <span className="absolute w-16 h-16 rounded-full border border-black animate-ping opacity-10" />
                  <button
                    onClick={stopListening}
                    className="relative z-10 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#1C1C1C] transition-transform active:scale-95"
                    title="Stop Listening"
                  >
                    <MicOff className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={stopListening}
                  className="px-4 py-3 rounded-xl bg-black text-white hover:bg-[#1C1C1C] text-xs font-semibold transition-colors"
                >
                  Stop
                </button>

                <button
                  onClick={togglePause}
                  className="px-3.5 py-3 rounded-xl border border-[#D4D4D4] hover:border-black text-xs font-medium text-black transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 inline mr-1" /> : <Pause className="w-3.5 h-3.5 inline mr-1" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              </div>
            )}

            {/* Clear Button */}
            <button
              onClick={handleClear}
              disabled={!transcript && !interimText}
              className="p-3 rounded-xl border border-[#E5E5E5] hover:border-black text-[#555555] hover:text-black disabled:opacity-30 transition-colors"
              title="Clear transcript"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Minimal Monochrome Waveform & Real Status */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {isListening && !isPaused && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-black bg-white">
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span className="font-semibold text-black uppercase">Listening...</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-2 bg-black rounded-full animate-wave-mono" />
                  <span className="w-1 h-4 bg-[#777777] rounded-full animate-wave-mono" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 h-3 bg-black rounded-full animate-wave-mono" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 h-5 bg-[#777777] rounded-full animate-wave-mono" style={{ animationDelay: '0.45s' }} />
                </div>
              </div>
            )}

            {isPaused && (
              <span className="px-3 py-1 rounded-full border border-[#777777] text-[#555555]">
                PAUSED
              </span>
            )}

            {!isListening && (
              <span className="text-[#777777]">
                MICROPHONE STANDBY
              </span>
            )}

            <div className="hidden sm:flex items-center gap-2 text-[#777777] border-l border-[#E5E5E5] pl-4">
              <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
          </div>

          {/* Caption Font Size Scaling */}
          <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-lg p-1 font-mono text-[11px]">
            <span className="px-1 text-[#777777]">SIZE:</span>
            {(['sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => updateSetting('captionFontSize', sz)}
                className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                  settings.captionFontSize === sz
                    ? 'bg-black text-white'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

        </div>

        {/* Main Caption Workspace (White Background, Thin Gray Border, Large Readable Text) */}
        <div className="relative min-h-[460px] max-h-[640px] overflow-y-auto rounded-2xl bg-white border border-[#E5E5E5] p-8 sm:p-12 shadow-sm flex flex-col justify-between">
          
          <div className="flex-1">
            {!transcript && !interimText ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-[#777777] space-y-3">
                <div className="w-12 h-12 rounded-full border border-[#E5E5E5] flex items-center justify-center text-black">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                  Ready to Capture English Speech
                </h3>
                <p className="text-xs text-[#777777] max-w-sm">
                  Click <strong>"Start Listening"</strong> above and speak clearly. Words will transcribe instantly in large readable print.
                </p>
              </div>
            ) : (
              <div className={`space-y-4 ${getFontSizeClass()} text-black tracking-tight leading-relaxed font-medium`}>
                <span>{transcript}</span>
                {interimText && (
                  <span className="text-[#888888] font-light italic ml-2">
                    {interimText}
                  </span>
                )}
                <div ref={transcriptBottomRef} />
              </div>
            )}
          </div>

          {/* Caption Canvas Action Buttons: Copy, Download, Save */}
          <div className="mt-10 pt-5 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[#777777] font-mono text-[11px]">
              ON-DEVICE AUDIO PROCESSING • ZERO CLOUD RECORDING
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!transcript && !interimText}
                className="px-3.5 py-2 rounded-lg border border-[#D4D4D4] hover:border-black text-black font-semibold disabled:opacity-30 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                disabled={!transcript && !interimText}
                className="px-3.5 py-2 rounded-lg border border-[#D4D4D4] hover:border-black text-black font-semibold disabled:opacity-30 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>

              <button
                onClick={handleSaveToHistory}
                disabled={!transcript && !interimText}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-[#1C1C1C] font-semibold disabled:opacity-30 transition-colors flex items-center gap-1.5"
              >
                {savedNotification ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedNotification ? 'Saved to History' : 'Save Session'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
