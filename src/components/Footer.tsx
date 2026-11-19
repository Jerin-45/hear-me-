import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E5E5E5] bg-white text-black text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-black">
                HearMe <span className="text-[#777777] font-light">AI</span>
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-[#555555] max-w-md leading-relaxed">
              <strong>Communication Without Barriers.</strong> A formal, minimal AI accessibility platform providing real-time multilingual speech captions in 10 languages (including Tamil, Malayalam, Hindi, and English), authentic sign language learning, experimental gesture recognition, and accessible communication tools.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 border border-[#E5E5E5] rounded text-[#444444]">
                10 LANGUAGES (தமிழ் • മലയാളം • हिन्दी • English + 6 more)
              </span>
              <span className="px-2.5 py-1 border border-[#E5E5E5] rounded text-[#444444]">
                WCAG AAA COMPLIANT
              </span>
              <span className="px-2.5 py-1 border border-[#E5E5E5] rounded text-[#444444]">
                PRIVATE ON-DEVICE PROCESSING
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/captions" className="text-[#333333] hover:text-black hover:underline underline-offset-4 flex items-center gap-1">
                  <span>Live Caption Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/sign-language" className="text-[#333333] hover:text-black hover:underline underline-offset-4">
                  Sign Language Library
                </Link>
              </li>
              <li>
                <Link to="/sign-explainer" className="text-[#333333] hover:text-black hover:underline underline-offset-4">
                  AI Sign Explainer
                </Link>
              </li>
              <li>
                <Link to="/sign-recognition" className="text-[#333333] hover:text-black hover:underline underline-offset-4">
                  Camera Sign Recognition
                </Link>
              </li>
              <li>
                <Link to="/communication" className="text-[#333333] hover:text-black hover:underline underline-offset-4">
                  Text-to-Speech Communication
                </Link>
              </li>
              <li>
                <Link to="/summarizer" className="text-[#333333] hover:text-black hover:underline underline-offset-4">
                  AI Conversation Summarizer
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Commitment */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777]">
              Standards
            </h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Prioritizes authentic Indian Sign Language (ISL) referenced from the Indian Sign Language Research and Training Centre (ISLRTC). Zero fabricated AI hand gestures.
            </p>
            <div className="pt-2">
              <Link
                to="/settings"
                className="text-xs font-semibold text-black hover:underline underline-offset-4 flex items-center gap-1"
              >
                <span>Customize Accessibility Settings</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] gap-4">
          <p>© {new Date().getFullYear()} HearMe AI. Communication Without Barriers. Built for hearing accessibility.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Powered by Gemini API • Web Speech • MediaPipe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
