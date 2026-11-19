import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Camera,
  Sparkles,
  CheckCircle2,
  Activity,
  Volume2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../utils/assets';

// 21-point Hand Landmarks for 4 distinct gestures
interface LandmarkPoint {
  x: number;
  y: number;
}

const GESTURE_DATA: Record<
  string,
  {
    name: string;
    subtext: string;
    confidence: number;
    imageSrc: string;
    points: LandmarkPoint[];
  }
> = {
  'I LOVE YOU': {
    name: 'I LOVE YOU',
    subtext: 'Thumb, index & pinky extended',
    confidence: 99.4,
    imageSrc: '/images/signs/i-love-you.jpg',
    points: [
      { x: 120, y: 220 }, // 0: Wrist
      // Thumb (out)
      { x: 96, y: 190 }, { x: 70, y: 170 }, { x: 44, y: 155 }, { x: 26, y: 145 },
      // Index (up)
      { x: 95, y: 140 }, { x: 90, y: 102 }, { x: 84, y: 68 }, { x: 80, y: 38 },
      // Middle (curled)
      { x: 120, y: 135 }, { x: 120, y: 160 }, { x: 120, y: 175 }, { x: 120, y: 185 },
      // Ring (curled)
      { x: 145, y: 140 }, { x: 145, y: 165 }, { x: 145, y: 175 }, { x: 145, y: 185 },
      // Pinky (up)
      { x: 168, y: 150 }, { x: 178, y: 118 }, { x: 188, y: 82 }, { x: 196, y: 52 },
    ],
  },
  'HELLO': {
    name: 'HELLO',
    subtext: 'Open hand wave motion',
    confidence: 98.7,
    imageSrc: '/images/signs/hello.jpg',
    points: [
      { x: 120, y: 220 }, // 0: Wrist
      // Thumb (wide)
      { x: 95, y: 190 }, { x: 70, y: 170 }, { x: 48, y: 152 }, { x: 30, y: 140 },
      // Index (wide)
      { x: 95, y: 140 }, { x: 84, y: 98 }, { x: 76, y: 62 }, { x: 70, y: 32 },
      // Middle (wide)
      { x: 120, y: 135 }, { x: 118, y: 90 }, { x: 116, y: 55 }, { x: 115, y: 22 },
      // Ring (wide)
      { x: 145, y: 140 }, { x: 148, y: 96 }, { x: 152, y: 62 }, { x: 156, y: 35 },
      // Pinky (wide)
      { x: 168, y: 150 }, { x: 178, y: 115 }, { x: 188, y: 80 }, { x: 196, y: 55 },
    ],
  },
  'PEACE': {
    name: 'PEACE / TWO',
    subtext: 'Index & middle form V shape',
    confidence: 99.1,
    imageSrc: '/images/signs/yes.jpg',
    points: [
      { x: 120, y: 220 }, // 0: Wrist
      // Thumb (curled over ring)
      { x: 100, y: 190 }, { x: 106, y: 170 }, { x: 120, y: 160 }, { x: 130, y: 162 },
      // Index (extended left)
      { x: 100, y: 140 }, { x: 90, y: 100 }, { x: 82, y: 65 }, { x: 75, y: 32 },
      // Middle (extended right)
      { x: 125, y: 138 }, { x: 132, y: 100 }, { x: 140, y: 65 }, { x: 148, y: 32 },
      // Ring (curled)
      { x: 148, y: 145 }, { x: 148, y: 170 }, { x: 145, y: 180 }, { x: 140, y: 185 },
      // Pinky (curled)
      { x: 168, y: 155 }, { x: 168, y: 175 }, { x: 162, y: 182 }, { x: 155, y: 185 },
    ],
  },
  'THANK YOU': {
    name: 'THANK YOU',
    subtext: 'Flat hand forward motion',
    confidence: 98.3,
    imageSrc: '/images/signs/thank-you.jpg',
    points: [
      { x: 120, y: 220 }, // 0: Wrist
      // Thumb
      { x: 105, y: 185 }, { x: 95, y: 160 }, { x: 88, y: 145 }, { x: 82, y: 130 },
      // Index
      { x: 108, y: 140 }, { x: 104, y: 105 }, { x: 100, y: 75 }, { x: 96, y: 48 },
      // Middle
      { x: 124, y: 138 }, { x: 122, y: 102 }, { x: 120, y: 70 }, { x: 118, y: 42 },
      // Ring
      { x: 140, y: 142 }, { x: 138, y: 108 }, { x: 136, y: 78 }, { x: 134, y: 52 },
      // Pinky
      { x: 155, y: 150 }, { x: 152, y: 120 }, { x: 150, y: 95 }, { x: 148, y: 72 },
    ],
  },
};

const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Knuckles
  [5, 9], [9, 13], [13, 17],
];

export const HeroInteractiveShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'landmark' | 'captions' | 'vocab'>('landmark');
  const [activeGesture, setActiveGesture] = useState<string>('I LOVE YOU');

  // Auto-cycle gestures
  useEffect(() => {
    const gestures = Object.keys(GESTURE_DATA);
    const interval = setInterval(() => {
      setActiveGesture((prev) => {
        const nextIdx = (gestures.indexOf(prev) + 1) % gestures.length;
        return gestures[nextIdx];
      });
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // Caption typing stream simulation
  const captionPhrases = [
    "Hello! Welcome to HearMe AI.",
    "Real-time captions running with 0.2s latency.",
    "Detecting 21 hand landmarks across gestures.",
    "Communication without any sound barriers.",
  ];
  const [captionIdx, setCaptionIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let charIdx = 0;
    const currentPhrase = captionPhrases[captionIdx];
    setDisplayedText("");

    const typeTimer = setInterval(() => {
      if (charIdx < currentPhrase.length) {
        setDisplayedText(currentPhrase.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(typeTimer);
        setTimeout(() => {
          setCaptionIdx((prev) => (prev + 1) % captionPhrases.length);
        }, 2200);
      }
    }, 45);

    return () => clearInterval(typeTimer);
  }, [captionIdx]);

  const currentGesture = GESTURE_DATA[activeGesture];

  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto select-none">
      
      {/* Ambient background glow & rotating orbital rings */}
      <div className="absolute -inset-6 -z-10 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Outer orbital ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="w-[480px] h-[480px] rounded-full border border-dashed border-[#E5E5E5] opacity-60"
        />
        {/* Inner orbital ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[360px] h-[360px] rounded-full border border-[#ECECEC] opacity-50"
        />
        {/* Soft center ambient radial shimmer */}
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#F5F5F5] to-transparent blur-2xl opacity-70" />
      </div>

      {/* Floating Badge 1: Top Right */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-2 sm:-right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white text-[11px] font-mono shadow-xl border border-[#333333]"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span className="font-semibold tracking-wide">Speech Latency: 0.2s</span>
      </motion.div>

      {/* Floating Badge 2: Bottom Left */}
      <motion.div
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 -left-2 sm:-left-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-[11px] font-mono shadow-xl border border-[#D4D4D4]"
      >
        <Camera className="w-3.5 h-3.5 text-black" />
        <span className="font-semibold tracking-wide">21 Landmarks • 60 FPS</span>
      </motion.div>

      {/* Main Glassmorphic Showcase Console */}
      <div className="relative rounded-2xl bg-white border border-[#E5E5E5] shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* Console Header Bar */}
        <div className="px-5 py-3.5 bg-[#FAFAFA] border-b border-[#E5E5E5] flex items-center justify-between">
          
          {/* Simulated Terminal Status Dots */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4D4]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
            <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
              HearMe Engine
            </span>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#EFEFEF] border border-[#E5E5E5]">
            <button
              onClick={() => setActiveTab('landmark')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'landmark'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[#666666] hover:text-black'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Vision CV</span>
            </button>
            <button
              onClick={() => setActiveTab('captions')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'captions'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[#666666] hover:text-black'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>Captions</span>
            </button>
            <button
              onClick={() => setActiveTab('vocab')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'vocab'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[#666666] hover:text-black'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>ISL 20</span>
            </button>
          </div>

        </div>

        {/* Tab 1: Vision Hand Landmark Skeleton Visualizer */}
        {activeTab === 'landmark' && (
          <div className="p-6">
            
            {/* Gesture Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-[#F0F0F0]">
              <span className="text-[10px] font-mono text-[#777777] uppercase mr-1">GESTURE:</span>
              {Object.keys(GESTURE_DATA).map((gKey) => (
                <button
                  key={gKey}
                  onClick={() => setActiveGesture(gKey)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                    activeGesture === gKey
                      ? 'bg-black text-white scale-105 shadow-sm'
                      : 'bg-[#F7F7F7] text-[#666666] border border-[#E5E5E5] hover:border-black'
                  }`}
                >
                  {gKey}
                </button>
              ))}
            </div>

            {/* Landmark Motion Canvas Display */}
            <div className="relative rounded-xl bg-gradient-to-b from-[#FBFBFB] to-[#F5F5F5] border border-[#EBEBEB] p-4 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
              
              {/* Subtle coordinate grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

              {/* Dynamic 21-Node Animated Hand Skeleton SVG */}
              <svg
                viewBox="0 0 240 260"
                className="w-56 h-56 relative z-10 filter drop-shadow-sm transition-all duration-300"
              >
                {/* Connective Bones */}
                {HAND_CONNECTIONS.map(([start, end], idx) => {
                  const p1 = currentGesture.points[start];
                  const p2 = currentGesture.points[end];
                  if (!p1 || !p2) return null;
                  return (
                    <motion.line
                      key={`bone-${idx}`}
                      initial={false}
                      animate={{
                        x1: p1.x,
                        y1: p1.y,
                        x2: p2.x,
                        y2: p2.y,
                      }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                      stroke="#111111"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* 21 Hand Landmarks */}
                {currentGesture.points.map((pt, idx) => {
                  const isTip = [4, 8, 12, 16, 20].includes(idx);
                  const isWrist = idx === 0;

                  return (
                    <g key={`pt-${idx}`}>
                      {/* Tip pulsing aura */}
                      {isTip && (
                        <motion.circle
                          initial={false}
                          animate={{
                            cx: pt.x,
                            cy: pt.y,
                            r: [6, 10, 6],
                            opacity: [0.3, 0.7, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: idx * 0.1,
                          }}
                          fill="#000000"
                        />
                      )}

                      {/* Main Landmark Circle */}
                      <motion.circle
                        initial={false}
                        animate={{
                          cx: pt.x,
                          cy: pt.y,
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        r={isTip ? 5 : isWrist ? 6 : 3.5}
                        fill={isTip ? '#000000' : isWrist ? '#000000' : '#FFFFFF'}
                        stroke="#000000"
                        strokeWidth={isTip ? 2 : 2}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Live Recognition Status Tag Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  <span className="font-bold text-black">{currentGesture.name}</span>
                </div>
                <span className="text-[#666666]">
                  Confidence: <strong className="text-black">{currentGesture.confidence}%</strong>
                </span>
              </div>
            </div>

            {/* Bottom info link */}
            <div className="mt-4 flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] font-mono text-[#777777]">
                MediaPipe Hands Landmark Pipeline
              </span>
              <Link
                to="/sign-recognition"
                className="font-semibold text-black hover:underline flex items-center gap-1 text-[11px] font-mono"
              >
                <span>Launch Camera AI</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        )}

        {/* Tab 2: Live Captions & Dynamic Audio Waveform */}
        {activeTab === 'captions' && (
          <div className="p-6 space-y-5">
            
            {/* Status bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                <span className="text-xs font-mono font-bold text-black uppercase">
                  Listening Stream Active
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#E5E5E5] text-[#666666]">
                en-IN (Dialect Adaptive)
              </span>
            </div>

            {/* Simulated Live Caption Streaming Box */}
            <div className="p-5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] min-h-[110px] flex items-center">
              <p className="text-xl sm:text-2xl font-black text-black tracking-tight leading-snug">
                "{displayedText}"
                <span className="inline-block w-2 h-5 bg-black ml-1 animate-pulse" />
              </p>
            </div>

            {/* Real-time Dynamic Equalizer Frequency Bars */}
            <div className="p-4 rounded-xl bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="flex items-end gap-1 h-6">
                  {[12, 22, 16, 26, 14, 28, 20, 10, 24, 18, 30, 15, 22, 14, 25, 18].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        scaleY: [0.3, 1.2, 0.4, 0.9, 0.3],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: 'easeInOut',
                      }}
                      className="w-1 bg-white rounded-full origin-bottom"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#AAAAAA] uppercase tracking-wider">
                Native Web Speech API
              </span>
            </div>

            {/* Bottom link */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] font-mono text-[#777777]">
                Zero Cloud Storage • 100% Private
              </span>
              <Link
                to="/captions"
                className="font-semibold text-black hover:underline flex items-center gap-1 text-[11px] font-mono"
              >
                <span>Open Live Studio</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        )}

        {/* Tab 3: Official 20 ISL Vocabulary Flashcard */}
        {activeTab === 'vocab' && (
          <div className="p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black">
                20 Essential Signs Reference
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white">
                ISLRTC Standard
              </span>
            </div>

            {/* Photo Card Preview */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="rounded-xl overflow-hidden border border-[#E5E5E5] bg-white p-2 h-36 flex items-center justify-center">
                <img
                  src={getAssetUrl(currentGesture.imageSrc)}
                  alt={`Sign for ${currentGesture.name}`}
                  className="w-full h-full object-contain hover:scale-105 transition-transform"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono uppercase text-[#777777] block">
                  Active Gesture
                </span>
                <h4 className="text-xl font-black text-black tracking-tight">
                  {currentGesture.name}
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  {currentGesture.subtext}
                </p>
                <div className="pt-1">
                  <span className="inline-block text-[10px] font-mono font-bold text-black border border-black px-2 py-0.5 rounded">
                    Verified Match
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom link */}
            <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#777777]">
                Complete 20 Signs Photo Library
              </span>
              <Link
                to="/sign-language"
                className="font-semibold text-black hover:underline flex items-center gap-1 text-[11px] font-mono"
              >
                <span>Browse All 20 Signs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        )}

      </div>

      {/* Decorative Bottom Floating Metric Pill */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-4 flex items-center justify-center gap-4 text-center"
      >
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#666666] bg-[#F7F7F7] border border-[#E5E5E5] px-3 py-1 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-black" />
          <span>Interactive Live AI Prototype</span>
        </span>
      </motion.div>

    </div>
  );
};
export default HeroInteractiveShowcase;
