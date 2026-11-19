import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Plus,
  Square,
  Copy,
  Check,
  Volume2,
  VolumeX,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { askAccessibilityAssistant, getStoredApiKey, setStoredApiKey } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import { speakEnglishText, stopSpeech } from '../services/speech';

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  sender: 'assistant',
  content:
    '### Welcome to Universal AI Assistant\n\n' +
    'I am your general-purpose AI tutor and assistant. I can answer questions across **any topic**—from programming and computer science to mathematics, artificial intelligence, career prep, science, everyday life, and hearing accessibility.\n\n' +
    'Feel free to type any question below or click one of the suggested prompts to get started!',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_PROMPTS = [
  'Explain Artificial Intelligence.',
  'Write a Python program.',
  'What is Machine Learning?',
  'Help me prepare for an interview.',
  'Explain sign language.',
  'How does the human brain work?',
  'Give me a career roadmap.',
];

export const AIAssistantModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  
  // Active AbortController for "Stop Generating"
  const abortControllerRef = useRef<AbortController | null>(null);

  // Message Actions States
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // API Key Settings Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(getStoredApiKey());
  const [keySavedNotice, setKeySavedNotice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      stopSpeech();
      setSpeakingMsgId(null);
    }
  }, [isOpen, messages]);

  // Handle Send Question
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Stop ongoing speech
    stopSpeech();
    setSpeakingMsgId(null);

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const reply = await askAccessibilityAssistant(query, newHistory, controller.signal);
      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err.message?.includes('stopped by user')) {
        const stoppedMsg: ChatMessage = {
          id: 'ast_stop_' + Date.now(),
          sender: 'assistant',
          content: '_Generation stopped._',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, stoppedMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          content: `### Response Notice\n\n${err.message || 'Unable to connect to AI engine.'}\n\n*Tip: You can configure an optional free Google Gemini API key by clicking the key icon in the header.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generating
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  // New Chat
  const handleNewChat = () => {
    stopSpeech();
    setSpeakingMsgId(null);
    setMessages([
      {
        ...DEFAULT_WELCOME_MESSAGE,
        id: 'msg_welcome_' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Clear Chat
  const handleClearChat = () => {
    stopSpeech();
    setSpeakingMsgId(null);
    setMessages([]);
  };

  // Copy Message Content
  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Read Aloud Message (TTS)
  const handleToggleReadAloud = (content: string, id: string) => {
    if (speakingMsgId === id) {
      stopSpeech();
      setSpeakingMsgId(null);
      return;
    }

    stopSpeech();
    // Clean markdown hashes/backticks before speech
    const plainText = content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*_`]/g, '')
      .trim();

    speakEnglishText(plainText, 1.0, 1.0, undefined, () => {
      setSpeakingMsgId(null);
    });
    setSpeakingMsgId(id);
  };

  // Save Custom API Key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(customApiKey);
    setKeySavedNotice(true);
    setTimeout(() => {
      setKeySavedNotice(false);
      setShowKeyModal(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-black text-white border border-[#333333] shadow-xl hover:bg-[#1C1C1C] hover:scale-105 active:scale-95 transition-all text-xs font-semibold group focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Open Universal AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>AI Assistant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </button>
      )}

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <div
          role="region"
          aria-label="Universal AI Assistant Chat"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] h-[600px] max-h-[88vh] bg-white border border-black rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 bg-black text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Universal AI Assistant
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-black font-bold">
                    ANY TOPIC
                  </span>
                </h3>
                <p className="text-[10px] text-[#999999] font-mono">
                  Coding, math, science, careers, general knowledge & ISL
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyModal((prev) => !prev)}
                className="p-1.5 text-[#AAAAAA] hover:text-white rounded-lg transition-colors hover:bg-white/10"
                title="Configure Gemini API Key"
                aria-label="Configure Gemini API Key"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleNewChat}
                className="p-1.5 text-[#AAAAAA] hover:text-white rounded-lg transition-colors hover:bg-white/10"
                title="New Chat Session"
                aria-label="New Chat Session"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClearChat}
                className="p-1.5 text-[#AAAAAA] hover:text-white rounded-lg transition-colors hover:bg-white/10"
                title="Clear Current Messages"
                aria-label="Clear Messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#AAAAAA] hover:text-white rounded-lg transition-colors hover:bg-white/10"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Settings Drawer */}
          {showKeyModal && (
            <div className="p-3 bg-[#F7F7F7] border-b border-[#E5E5E5] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-black text-[11px] uppercase">
                  Google Gemini API Key (Optional)
                </span>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-black hover:underline flex items-center gap-0.5 font-mono font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Paste AI Studio API key here..."
                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#D4D4D4] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-[#1C1C1C]"
                >
                  {keySavedNotice ? 'Saved!' : 'Save'}
                </button>
              </form>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" tabIndex={0}>
            {messages.length === 0 ? (
              <div className="py-16 text-center text-[#888888] space-y-2">
                <Bot className="w-8 h-8 mx-auto text-[#BBBBBB]" />
                <p className="text-xs font-mono">Chat cleared. Type any question to begin.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-6 h-6 rounded-md bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-tr-none'
                        : 'bg-[#F9F9F9] text-black border border-[#EAEAEA] rounded-tl-none shadow-xs'
                    }`}
                  >
                    {/* Rich Markdown Prose & Code Formatter */}
                    <MarkdownRenderer content={msg.content} isUser={msg.sender === 'user'} />

                    {/* Footer Actions: Copy, Read Aloud & Timestamp */}
                    <div className="mt-2.5 pt-1.5 border-t border-[#E5E5E5]/60 flex items-center justify-between gap-3 text-[10px] font-mono text-[#777777]">
                      <span>{msg.timestamp}</span>

                      {msg.sender === 'assistant' && (
                        <div className="flex items-center gap-2">
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopyMessage(msg.content, msg.id)}
                            className="hover:text-black transition-colors flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-black" />
                                <span className="text-black font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Read Aloud (TTS) Button */}
                          <button
                            onClick={() => handleToggleReadAloud(msg.content, msg.id)}
                            className="hover:text-black transition-colors flex items-center gap-1"
                            title={speakingMsgId === msg.id ? 'Stop reading' : 'Read aloud'}
                          >
                            {speakingMsgId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-black animate-pulse" />
                                <span className="text-black font-semibold">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Read</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading / Generating State */}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-md bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="bg-[#F9F9F9] border border-[#EAEAEA] rounded-2xl rounded-tl-none p-3.5 text-xs text-[#555555] flex items-center gap-3 shadow-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-black font-semibold">
                    Reasoning & generating answer...
                  </span>

                  {/* Stop Generating Button */}
                  <button
                    onClick={handleStopGenerating}
                    className="ml-2 px-2 py-0.5 rounded-md bg-white border border-[#D4D4D4] hover:border-black text-black text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs"
                    title="Stop Generating"
                  >
                    <Square className="w-2.5 h-2.5 fill-black" />
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Section */}
          <div className="px-3 py-2 bg-[#F7F7F7] border-t border-[#E5E5E5] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] font-mono font-bold uppercase text-[#777777] shrink-0 mr-1">
              SUGGESTIONS:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white text-black border border-[#D4D4D4] hover:border-black transition-colors font-medium disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#E5E5E5] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (Coding, math, science, interview prep, sign language)..."
              disabled={loading}
              className="flex-1 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-black placeholder-[#777777] focus:outline-none focus:border-black transition-all"
            />
            {loading ? (
              <button
                type="button"
                onClick={handleStopGenerating}
                className="px-3 py-2.5 rounded-xl bg-black hover:bg-[#1C1C1C] text-white transition-all flex items-center gap-1 text-xs font-mono font-bold"
                aria-label="Stop Generating"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-black hover:bg-[#1C1C1C] disabled:opacity-30 text-white transition-all"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistantModal;
