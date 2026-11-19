import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import {
  speakEnglishText,
  stopSpeech,
  getAvailableEnglishVoices,
  isSpeechSynthesisSupported,
} from '../services/speech';

const QUICK_PHRASES = [
  'Hello.',
  'Thank you.',
  'Please help me.',
  'I cannot hear clearly.',
  'Please type your message.',
  'Could you repeat that?',
  'Where is the hospital?',
  'I need assistance.',
  'Please speak slowly and face me.',
  'Could you please write that down?',
];

export const CommunicationPage: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(settings.ttsSpeed || 1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(settings.ttsPitch || 1.0);

  const supported = isSpeechSynthesisSupported();

  useEffect(() => {
    getAvailableEnglishVoices().then((available) => {
      setVoices(available);
      if (available.length > 0 && !selectedVoiceURI) {
        const preferred =
          available.find((v) => v.lang.toLowerCase().includes('in')) ||
          available.find((v) => v.lang.toLowerCase().includes('us')) ||
          available[0];
        setSelectedVoiceURI(preferred.voiceURI);
      }
    });

    return () => {
      stopSpeech();
    };
  }, []);

  const handleSpeak = () => {
    if (!text.trim() || !supported) return;

    setIsSpeaking(true);
    speakEnglishText(text.trim(), {
      rate: speechRate,
      pitch: speechPitch,
      voiceURI: selectedVoiceURI,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStop = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  const handleClear = () => {
    stopSpeech();
    setText('');
    setIsSpeaking(false);
  };

  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleSelectQuickPhrase = (phrase: string) => {
    setText(phrase);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block mb-1">
              Assistive Vocalization
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              Text-to-Speech Communication
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-mono">
              BROWSER SPEECH SYNTHESIS • ENGLISH AUDIO PLAYBACK
            </p>
          </div>

          {isSpeaking && (
            <div className="px-3.5 py-1.5 rounded-full border border-black bg-white text-black text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              <span>SPEAKING OUT LOUD</span>
            </div>
          )}
        </div>

        {/* Large Text Editor Workspace */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              Typed Message:
            </label>
            <span className="text-xs font-mono text-[#777777]">
              {text.length} chars • {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message in English or select an everyday phrase below..."
            className="w-full p-4 rounded-xl bg-white border border-[#D4D4D4] text-sm sm:text-base text-black placeholder-[#777777] focus:outline-none focus:border-black focus:ring-1 focus:ring-black leading-relaxed"
          />

          {/* Minimal Black & White Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5">
              {/* Black Speak Button */}
              <button
                onClick={handleSpeak}
                disabled={!text.trim() || isSpeaking}
                className="px-6 py-3 rounded-xl bg-black hover:bg-[#1C1C1C] text-white text-xs sm:text-sm font-semibold tracking-wide disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Speak Message</span>
              </button>

              {/* White Stop Button with Border */}
              {isSpeaking && (
                <button
                  onClick={handleStop}
                  className="px-4 py-3 rounded-xl bg-white border border-black hover:bg-[#F7F7F7] text-black text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              )}

              {/* Clear */}
              <button
                onClick={handleClear}
                disabled={!text.trim()}
                className="p-3 rounded-xl border border-[#E5E5E5] hover:border-black text-[#555555] hover:text-black disabled:opacity-30 transition-colors"
                title="Clear text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={!text.trim()}
              className="px-4 py-2.5 rounded-xl border border-[#D4D4D4] hover:border-black text-black text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Voice Selection & Monochrome Speech Rate Slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5]">
          
          {/* Voice Selector */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-black block mb-2">
              English Voice
            </label>
            <select
              value={selectedVoiceURI}
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                updateSetting('ttsVoiceURI', e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D4D4D4] text-xs text-black focus:outline-none focus:border-black"
            >
              {voices.length === 0 ? (
                <option value="">Default English Voice</option>
              ) : (
                voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Monochrome Speech Rate Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Speech Rate
              </label>
              <span className="text-xs font-mono font-bold text-black">{speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.1"
              value={speechRate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeechRate(val);
                updateSetting('ttsSpeed', val);
              }}
              className="w-full accent-black bg-[#E5E5E5] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#777777] mt-1">
              <span>0.5x Slow</span>
              <span>1.0x Normal</span>
              <span>1.8x Fast</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Voice Pitch
              </label>
              <span className="text-xs font-mono font-bold text-black">{speechPitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              value={speechPitch}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeechPitch(val);
                updateSetting('ttsPitch', val);
              }}
              className="w-full accent-black bg-[#E5E5E5] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#777777] mt-1">
              <span>Lower</span>
              <span>Balanced</span>
              <span>Higher</span>
            </div>
          </div>

        </div>

        {/* Quick Phrases (Simple Outlined Buttons) */}
        <div className="space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#777777] block">
            Everyday Communication Phrases
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuickPhrase(phrase)}
                className="p-4 rounded-xl bg-white border border-[#D4D4D4] hover:border-black text-left text-xs text-black font-medium transition-all flex items-center justify-between group shadow-sm"
              >
                <span>"{phrase}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#AAAAAA] group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
