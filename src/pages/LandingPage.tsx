import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  BookOpen,
  Sparkles,
  Camera,
  Volume2,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Languages,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { HeroInteractiveShowcase } from '../components/HeroInteractiveShowcase';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  
  // Real-time simulated transcription text stream for hero preview
  const demoTranscript = "Good morning. How can I help you today?";
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    let timer: any = null;

    const runStream = () => {
      setDisplayedText("");
      index = 0;
      setIsTyping(true);

      timer = setInterval(() => {
        if (index < demoTranscript.length) {
          setDisplayedText(demoTranscript.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
          // Wait and restart typing stream loop
          setTimeout(() => {
            runStream();
          }, 3500);
        }
      }, 55);
    };

    runStream();

    return () => clearInterval(timer);
  }, []);

  const featureCards = [
    {
      title: 'Live Captions (10 Languages)',
      desc: 'Convert spoken Tamil, Malayalam, Hindi, English, and 6 other Indian languages into clear readable captions in real time.',
      icon: Mic,
      path: '/captions',
      badge: '10 Languages Supported',
    },
    {
      title: 'Sign Language Learning',
      desc: 'Learn categorized Indian Sign Language vocabulary with verified references, step-by-step guides, and progress tracking.',
      icon: BookOpen,
      path: '/sign-language',
      badge: 'ISLRTC Verified',
    },
    {
      title: 'AI Sign Explainer',
      desc: 'Understand conversational nuance, respectful context, and visual sign guidance for phrases in Tamil, Malayalam, Hindi, English, etc.',
      icon: Sparkles,
      path: '/sign-explainer',
      badge: 'Multilingual Gemini AI',
    },
    {
      title: 'Multilingual AI Translator',
      desc: 'Instant two-way voice and text translation across 10 languages (Tamil, Malayalam, Hindi, English, etc.) with sign language integration.',
      icon: Languages,
      path: '/translator',
      badge: '10 Languages',
    },
    {
      title: 'Gesture Recognition',
      desc: 'Experimental camera-based hand landmark prototype detecting 5 core gestures via MediaPipe without recording video.',
      icon: Camera,
      path: '/sign-recognition',
      badge: 'MediaPipe Hands',
    },
    {
      title: 'Text-to-Speech (10 Languages)',
      desc: 'Type messages in Tamil, Malayalam, Hindi, English, etc., and vocalize natural speech with localized everyday phrases.',
      icon: Volume2,
      path: '/communication',
      badge: 'SpeechSynthesis',
    },
    {
      title: 'AI Conversation Summary',
      desc: 'Distill long spoken meetings, lectures, or healthcare conversations into concise action items, instructions, and deadlines.',
      icon: FileText,
      path: '/summarizer',
      badge: 'Gemini AI',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-black selection:bg-black selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-[#E5E5E5] overflow-hidden">
        {/* Subtle geometric dot matrix background */}
        <div className="absolute inset-0 bg-[radial-gradient(#E0E0E0_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />
        
        {/* Ambient subtle light sweep */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-b from-[#F7F7F7] to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* 2-Column Responsive Layout for Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines, Pitch & Action Buttons */}
            <div className="lg:col-span-7 max-w-2xl">
              {/* Small Monospace Label with Live Status Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black bg-white text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-8 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>AI ACCESSIBILITY PLATFORM</span>
              </motion.div>

              {/* Oversized Headline (72px - 92px desktop) */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-7xl lg:text-[84px] font-black tracking-tight text-black leading-[1.02]"
              >
                Communication<br />
                <span className="text-[#666666] font-light">Without Barriers.</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 text-lg sm:text-xl text-[#555555] max-w-xl leading-relaxed"
              >
                Making everyday communication more accessible through real-time captions, sign language learning, and intelligent communication tools.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              >
                <Link
                  to={user ? '/dashboard' : '/captions'}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-black text-white hover:bg-[#1C1C1C] active:scale-[0.98] transition-all text-sm font-semibold tracking-wide shadow-md hover:shadow-xl"
                >
                  <span>Explore HearMe AI</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-black border border-[#D4D4D4] hover:border-black active:scale-[0.98] transition-all text-sm font-semibold tracking-wide"
                >
                  <span>Get Started</span>
                </Link>
              </motion.div>

              {/* Trust & Architecture Assurance Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-10 pt-6 border-t border-[#EAEAEA] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#666666] font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  <span>20+ ISL Signs Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  <span>0.2s Low-Latency Captions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  <span>100% On-Device Privacy</span>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Interactive Animated Showcase ("Above the Page") */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="lg:col-span-5 w-full flex justify-center"
            >
              <HeroInteractiveShowcase />
            </motion.div>

          </div>

          {/* High-Tech Metrics & Capabilities Ticker Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-16 pt-8 border-t border-[#E5E5E5] grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="p-4 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA]">
              <span className="text-[10px] font-mono uppercase text-[#777777] block">Speech Latency</span>
              <p className="text-xl sm:text-2xl font-black text-black font-mono mt-0.5">&lt; 200 ms</p>
              <span className="text-[11px] text-[#666666] mt-1 block">Real-time Web Speech</span>
            </div>

            <div className="p-4 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA]">
              <span className="text-[10px] font-mono uppercase text-[#777777] block">Hand Tracking</span>
              <p className="text-xl sm:text-2xl font-black text-black font-mono mt-0.5">21 Points</p>
              <span className="text-[11px] text-[#666666] mt-1 block">MediaPipe 3D Mesh</span>
            </div>

            <div className="p-4 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA]">
              <span className="text-[10px] font-mono uppercase text-[#777777] block">Sign Standard</span>
              <p className="text-xl sm:text-2xl font-black text-black font-mono mt-0.5">20 Vocabulary</p>
              <span className="text-[11px] text-[#666666] mt-1 block">ISLRTC Verified Signs</span>
            </div>

            <div className="p-4 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA]">
              <span className="text-[10px] font-mono uppercase text-[#777777] block">Privacy & Security</span>
              <p className="text-xl sm:text-2xl font-black text-black font-mono mt-0.5">Zero Audio Stored</p>
              <span className="text-[11px] text-[#666666] mt-1 block">100% Client-Side Audio</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section id="features" className="py-24 bg-[#F7F7F7] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block mb-2">
              Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
              Designed for better communication.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={idx}
                  to={feat.path}
                  className="group relative p-7 rounded-2xl bg-white border border-[#E5E5E5] hover:border-black hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-11 h-11 rounded-lg border border-[#E5E5E5] flex items-center justify-center group-hover:border-black group-hover:scale-105 transition-all">
                        <Icon className="w-5 h-5 text-black" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-[#E5E5E5] text-[#777777]">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-black tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-xs font-semibold text-black">
                      Open Tool
                    </span>
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section className="py-24 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block mb-2">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
              How HearMe AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 01 */}
            <div className="p-8 rounded-2xl border border-[#E5E5E5] bg-white flex flex-col justify-between">
              <div>
                <span className="text-4xl sm:text-5xl font-black font-mono text-black block mb-4">
                  01
                </span>
                <h3 className="text-xl font-bold text-black mb-2">
                  Capture
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  Convert speech across 10 languages (Tamil, Malayalam, Hindi, English, etc.) into readable captions in real time.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E5E5] text-[11px] font-mono text-[#777777]">
                MICROPHONE & ACCENTS
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-8 rounded-2xl border border-[#E5E5E5] bg-white flex flex-col justify-between">
              <div>
                <span className="text-4xl sm:text-5xl font-black font-mono text-black block mb-4">
                  02
                </span>
                <h3 className="text-xl font-bold text-black mb-2">
                  Understand
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  Learn sign-language concepts and use AI explanations to clarify communication nuances and deaf etiquette.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E5E5] text-[11px] font-mono text-[#777777]">
                ISL & GEMINI AI
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-8 rounded-2xl border border-[#E5E5E5] bg-white flex flex-col justify-between">
              <div>
                <span className="text-4xl sm:text-5xl font-black font-mono text-black block mb-4">
                  03
                </span>
                <h3 className="text-xl font-bold text-black mb-2">
                  Communicate
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  Type messages and vocalize them in 10 languages, or summarize complex meeting transcripts into tasks.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E5E5] text-[11px] font-mono text-[#777777]">
                TEXT-TO-SPEECH & DIGEST
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. IMPACT SECTION (Black Background, White Text) */}
      <section className="py-28 bg-black text-white relative overflow-hidden">
        {/* Subtle white animated geometric grid lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#999999] block mb-4">
              Accessibility Statement
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Accessibility isn't an extra feature.<br />
              It's the foundation.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#AAAAAA] leading-relaxed max-w-xl">
              Technology should help everyone participate in conversations, classrooms, and everyday life. HearMe AI prioritizes zero sound dependence and authentic visual communication.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/captions"
                className="px-8 py-3.5 rounded-xl bg-white text-black hover:bg-[#E5E5E5] text-xs sm:text-sm font-semibold tracking-wide transition-all"
              >
                Start Live Captions
              </Link>
              <Link
                to="/sign-language"
                className="px-7 py-3.5 rounded-xl bg-transparent border border-[#444444] text-white hover:border-white text-xs sm:text-sm font-semibold tracking-wide transition-all"
              >
                Browse Sign Library
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
