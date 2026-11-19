import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Info,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { askAccessibilityAssistant } from '../services/api';

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  sender: 'assistant',
  content:
    'Hello. I am your HearMe AI Accessibility Assistant. I provide guidance on hearing accessibility, communication etiquette, Indian Sign Language (ISL) concepts, and how to use any HearMe AI feature in English. How can I assist you today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_PROMPTS = [
  'How do I communicate with someone who is deaf?',
  'What is Indian Sign Language (ISL)?',
  'How do I use Live Caption Studio?',
  'Tips for classroom hearing accessibility',
  'What gestures can Camera Recognition detect?',
];

export const AIAssistantModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

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

    try {
      const reply = await askAccessibilityAssistant(query, newHistory);
      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        content: `Service Notice: ${err.message || 'Connection issue'}. To enable dynamic live Gemini AI responses, please ensure GEMINI_API_KEY is configured in your server/.env file.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-black text-white border border-[#333333] shadow-xl hover:bg-[#1C1C1C] hover:scale-105 active:scale-95 transition-all text-xs font-semibold group focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Open AI Accessibility Assistant"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>AI Assistant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </button>
      )}

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[85vh] bg-white border border-[#000000] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-black text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  HearMe AI Assistant
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded border border-white/30 text-white">
                    EN-ONLY
                  </span>
                </h3>
                <p className="text-[10px] text-[#999999]">Accessibility & Communication Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-[#999999] hover:text-white rounded transition-colors"
                title="Clear Chat History"
                aria-label="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#999999] hover:text-white rounded transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ethical Disclaimer Notice */}
          <div className="px-3.5 py-2 bg-[#F7F7F7] border-b border-[#E5E5E5] flex items-start gap-2 text-[11px] text-[#555555]">
            <Info className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
            <p>
              Provides guidance in English. Does not replace certified human sign language interpreters.
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-black" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-black text-white rounded-tr-none'
                      : 'bg-[#F7F7F7] text-black border border-[#E5E5E5] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1.5 font-mono ${
                      msg.sender === 'user' ? 'text-[#888888] text-right' : 'text-[#777777]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl rounded-tl-none p-3 text-xs text-[#555555] flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="font-mono text-[11px]">Processing response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompt Chips */}
          <div className="px-3 py-2 bg-[#F7F7F7] border-t border-[#E5E5E5] overflow-x-auto flex gap-1.5 scrollbar-none">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white text-black border border-[#D4D4D4] hover:border-black transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-[#E5E5E5] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an accessibility question (English)..."
              disabled={loading}
              className="flex-1 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-black placeholder-[#777777] focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-black hover:bg-[#1C1C1C] disabled:opacity-30 text-white transition-all"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
