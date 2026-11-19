import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mic,
  BookOpen,
  Sparkles,
  Camera,
  Volume2,
  FileText,
  Settings,
  LayoutDashboard,
  ArrowRight,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { settings, updateSetting, savedTranscripts } = useSettings();

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Captions', path: '/captions', icon: Mic },
    { name: 'Sign Learning', path: '/sign-language', icon: BookOpen },
    { name: 'AI Sign Explainer', path: '/sign-explainer', icon: Sparkles },
    { name: 'Camera Recognition', path: '/sign-recognition', icon: Camera },
    { name: 'Text-to-Speech', path: '/communication', icon: Volume2 },
    { name: 'Summarizer', path: '/summarizer', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const tools = [
    {
      title: 'Live Caption Studio',
      desc: 'Convert spoken speech in 10 languages (Tamil, Malayalam, Hindi, English, etc.) into readable captions in real time.',
      path: '/captions',
      icon: Mic,
      tag: 'SPEECH-TO-TEXT',
    },
    {
      title: 'Sign Language Library',
      desc: 'Learn verified Indian Sign Language concepts, movements, and vocabulary.',
      path: '/sign-language',
      icon: BookOpen,
      tag: '8 CATEGORIES',
    },
    {
      title: 'AI Sign Explainer',
      desc: 'Understand conversational context, deaf etiquette, and sign guidance via Gemini AI.',
      path: '/sign-explainer',
      icon: Sparkles,
      tag: 'AI ANALYSIS',
    },
    {
      title: 'Camera Gesture Recognition',
      desc: 'MediaPipe Hands prototype recognizing 5 core gestures via webcam.',
      path: '/sign-recognition',
      icon: Camera,
      tag: 'COMPUTER VISION',
    },
    {
      title: 'Text-to-Speech Communication',
      desc: 'Convert typed text in 10 languages into natural spoken voice audio with localized quick phrases.',
      path: '/communication',
      icon: Volume2,
      tag: 'SPEECH SYNTHESIS',
    },
    {
      title: 'AI Conversation Summarizer',
      desc: 'Extract key points, instructions, and deadlines from meeting notes.',
      path: '/summarizer',
      icon: FileText,
      tag: 'SUMMARIZATION',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col lg:flex-row">
      
      {/* Black Minimal Sidebar for Desktop */}
      <aside className="w-full lg:w-64 bg-black text-white shrink-0 p-6 flex flex-col justify-between border-r border-[#262626]">
        <div>
          {/* Sidebar Brand Label */}
          <div className="pb-6 border-b border-[#262626] mb-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777] block mb-1">
              Platform Workspace
            </span>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>HearMe AI Core</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Dashboard Sidebar">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#AAAAAA] hover:text-white hover:bg-[#1C1C1C]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Bottom */}
        <div className="pt-6 border-t border-[#262626] mt-6">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <span className="block font-semibold text-white truncate">{user?.displayName || 'Active User'}</span>
              <span className="text-[10px] font-mono text-[#777777]">10 Languages Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 space-y-10 max-w-6xl">
        
        {/* Top Greeting & Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#E5E5E5]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
              Welcome back.
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1.5">
              Your communication tools, all in one place.
            </p>
          </div>

          {/* Prominent Quick-Action Start Listening Button */}
          <Link
            to="/captions"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-black text-white hover:bg-[#1C1C1C] active:scale-95 transition-all text-xs sm:text-sm font-semibold tracking-wide self-start sm:self-auto shadow-md"
          >
            <Mic className="w-4 h-4" />
            <span>Start Listening Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Minimalist Feature Cards Grid */}
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block mb-4">
            Available Modules
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={idx}
                  to={tool.path}
                  className="group p-6 rounded-2xl bg-white border border-[#E5E5E5] hover:border-black transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg border border-[#E5E5E5] flex items-center justify-center group-hover:border-black transition-colors">
                        <Icon className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-[#777777]">
                        {tool.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-black tracking-tight">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-xs font-semibold text-black">Launch</span>
                    <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Caption Activity Section (Thin Dividers) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                Recent Caption Sessions
              </h2>
              <p className="text-xs text-[#777777]">Transcripts recorded from Live Caption Studio</p>
            </div>
            <Link
              to="/captions"
              className="text-xs font-semibold text-black hover:underline underline-offset-4 flex items-center gap-1"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {savedTranscripts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#777777] space-y-2">
              <Clock className="w-6 h-6 mx-auto text-[#AAAAAA]" />
              <p className="font-medium text-black">No transcripts recorded yet.</p>
              <p>Speech transcribed during your live sessions will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E5]">
              {savedTranscripts.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-black">{item.title}</h3>
                    <p className="text-xs text-[#555555] line-clamp-2 max-w-xl leading-relaxed">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#777777] pt-1">
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.wordCount} words</span>
                      <span>•</span>
                      <span>{item.dialect.toUpperCase()}</span>
                    </div>
                  </div>
                  <Link
                    to="/summarizer"
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-[#D4D4D4] hover:border-black text-black text-[11px] font-medium transition-colors"
                  >
                    Summarize
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

    </div>
  );
};
