import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Clock, Play, Pause } from 'lucide-react';
import { SignLanguageCard } from '../types';
import { SignVisualIllustration } from './SignVisualIllustration';
import { getAssetUrl } from '../utils/assets';
import { useSettings } from '../contexts/SettingsContext';

interface SignCardVisualProps {
  card: SignLanguageCard;
  viewMode?: 'photos' | 'diagrams';
}

export const SignCardVisual: React.FC<SignCardVisualProps> = ({ card, viewMode = 'photos' }) => {
  const { settings } = useSettings();
  
  // Detect reduced-motion
  const systemReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isReducedMotion = settings.reducedMotion || systemReducedMotion;

  // Animation states (auto-play loop by default)
  const [isPlaying, setIsPlaying] = useState(!isReducedMotion);
  const [speed, setSpeed] = useState<1 | 0.5>(1);
  const [replayKey, setReplayKey] = useState(0);

  // Two-step state for "My Name Is"
  const [myStep, setMyStep] = useState<1 | 2>(1);

  // Replay trigger
  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    setMyStep(1);
    setReplayKey((prev) => prev + 1);
  };

  // Toggle speed 1x / 0.5x
  const handleToggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeed((prev) => (prev === 1 ? 0.5 : 1));
  };

  // Toggle play / pause
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  // Two-step sequential loop for "My Name Is"
  // Step 1: 1.2s -> Step 2: 1.4s (Total ~2.6s cycle at 1x)
  useEffect(() => {
    if (card.id !== 'sign-my-name-is') return;
    if (!isPlaying) return;

    const step1Duration = 1200 / speed;
    const step2Duration = 1400 / speed;

    const timer = setTimeout(() => {
      setMyStep((prev) => (prev === 1 ? 2 : 1));
    }, myStep === 1 ? step1Duration : step2Duration);

    return () => clearTimeout(timer);
  }, [card.id, isPlaying, speed, myStep, replayKey]);

  // If user selected static vector diagrams view mode
  if (viewMode === 'diagrams') {
    return (
      <div className="rounded-xl overflow-hidden mb-4 border border-[#E5E5E5] bg-white h-44 flex items-center justify-center p-2">
        <SignVisualIllustration type={card.svgVisualType} className="w-full h-full object-contain" />
      </div>
    );
  }

  // =========================================================================
  // 1. "HELLO" Card (Pivot Wave)
  // Mechanics:
  // - Existing "Hello" illustration
  // - transformOrigin: "bottom center" (at wrist)
  // - rotate: [-12, 14, -10, 12, 0]
  // - x: [-4, 4, -3, 3, 0]
  // - duration: 1.8s, easeInOut, infinite loop
  // =========================================================================
  if (card.id === 'sign-hello') {
    return (
      <div className="relative rounded-xl overflow-hidden mb-4 border border-[#E5E5E5] bg-white h-44 flex items-center justify-center p-2 group select-none">
        {/* Top-Left Controls: Replay & Speed Toggle */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
          <button
            onClick={handleToggleSpeed}
            title="Toggle playback speed"
            className="px-2 py-0.5 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black text-[10px] font-mono font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <Clock className="w-2.5 h-2.5" />
            <span>{speed === 0.5 ? 'Slow-Mo (0.5x)' : '1x'}</span>
          </button>
          <button
            onClick={handleReplay}
            title="Replay animation"
            className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Top-Right Control: Play / Pause */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-black" />}
          </button>
        </div>

        {/* Smooth natural damped wave transform */}
        <motion.div
          key={`hello-anim-${replayKey}`}
          className="w-full h-full flex items-center justify-center"
          style={{ transformOrigin: 'bottom center' }}
          animate={
            isPlaying
              ? {
                  rotate: [-12, 14, -10, 12, 0],
                  x: [-4, 4, -3, 3, 0],
                }
              : { rotate: 0, x: 0 }
          }
          transition={{
            duration: 1.8 / speed,
            repeat: isPlaying ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <img
            src={getAssetUrl(card.imageSrc || '/images/signs/hello.jpg')}
            alt="Sign for Hello"
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
          />
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // 2. "MY NAME IS" Card (Two-Step Sequence)
  // Mechanics:
  // - Step 1 (0s–1.2s): "My" flat palm moves smoothly inward toward center/chest
  //   with scale: [0.95, 1.05, 1], while "Name" is faded to 25% opacity.
  // - Step 2 (1.2s–2.6s): Crossfade to "Name" crossed-fingers pose and animate
  //   double-tap bounce (y: [0, -8, 0, -6, 0]).
  // - Step label pill underneath ("1. MY" → "2. NAME") synced to the active step.
  // =========================================================================
  if (card.id === 'sign-my-name-is') {
    return (
      <div className="relative rounded-xl overflow-hidden mb-4 border border-[#E5E5E5] bg-white h-44 flex flex-col items-center justify-between p-2 group select-none">
        {/* Top-Left Controls: Replay & Speed Toggle */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
          <button
            onClick={handleToggleSpeed}
            title="Toggle playback speed"
            className="px-2 py-0.5 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black text-[10px] font-mono font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <Clock className="w-2.5 h-2.5" />
            <span>{speed === 0.5 ? 'Slow-Mo (0.5x)' : '1x'}</span>
          </button>
          <button
            onClick={handleReplay}
            title="Replay animation"
            className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Top-Right Control: Play / Pause */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-black" />}
          </button>
        </div>

        {/* Two-Step Animated Stage Display */}
        <div className="w-full flex-1 flex items-center justify-center gap-3 pt-4 px-2">
          {/* Pose 1: "My" (Flat palm moving toward center/chest with scale pulse) */}
          <motion.div
            className="h-28 w-1/2 flex items-center justify-center transition-opacity duration-300"
            animate={
              isPlaying && myStep === 1
                ? {
                    opacity: 1,
                    scale: [0.95, 1.05, 1],
                    x: [0, 5, 0],
                  }
                : { opacity: 0.25, scale: 0.95, x: 0 }
            }
            transition={{
              duration: 1.2 / speed,
              ease: 'easeInOut',
            }}
          >
            <img
              src={getAssetUrl('/images/signs/my-pose.jpg')}
              alt="Step 1: My (Flat palm to chest)"
              className="h-full w-auto object-contain pointer-events-none"
              loading="lazy"
            />
          </motion.div>

          {/* Pose 2: "Name" (Crossed index/middle fingers with double-tap bounce) */}
          <motion.div
            className="h-28 w-1/2 flex items-center justify-center transition-opacity duration-300"
            animate={
              isPlaying && myStep === 2
                ? {
                    opacity: 1,
                    y: [0, -8, 0, -6, 0],
                    scale: 1,
                  }
                : { opacity: 0.25, y: 0, scale: 0.95 }
            }
            transition={{
              duration: 1.4 / speed,
              ease: 'easeInOut',
            }}
          >
            <img
              src={getAssetUrl('/images/signs/name-pose.jpg')}
              alt="Step 2: Name (Crossed fingers tapping)"
              className="h-full w-auto object-contain pointer-events-none"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Synced Step Label Pill Underneath ("1. MY" → "2. NAME") */}
        <div className="flex items-center gap-1.5 pb-1">
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
              myStep === 1
                ? 'bg-black text-white shadow-xs'
                : 'bg-[#F0F0F0] text-[#888888]'
            }`}
          >
            1. MY
          </span>
          <span className="text-[9px] font-mono text-[#888888]">→</span>
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
              myStep === 2
                ? 'bg-black text-white shadow-xs'
                : 'bg-[#F0F0F0] text-[#888888]'
            }`}
          >
            2. NAME
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. "NAMASTE / WELCOME" Card (Respectful Bow & Lift)
  // Mechanics:
  // - Existing prayer-position hands illustration
  // - Gentle upward lift: y: [4, -6, -6, 4]
  // - Subtle scale expansion: scale: [0.98, 1.03, 1.03, 0.98]
  // - Brief hold at top peak (times: [0, 0.35, 0.65, 1])
  // =========================================================================
  if (card.id === 'sign-namaste') {
    return (
      <div className="relative rounded-xl overflow-hidden mb-4 border border-[#E5E5E5] bg-white h-44 flex items-center justify-center p-2 group select-none">
        {/* Top-Left Controls: Replay & Speed Toggle */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
          <button
            onClick={handleToggleSpeed}
            title="Toggle playback speed"
            className="px-2 py-0.5 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black text-[10px] font-mono font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <Clock className="w-2.5 h-2.5" />
            <span>{speed === 0.5 ? 'Slow-Mo (0.5x)' : '1x'}</span>
          </button>
          <button
            onClick={handleReplay}
            title="Replay animation"
            className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Top-Right Control: Play / Pause */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-black" />}
          </button>
        </div>

        {/* Gentle upward lift with respectful hold at peak */}
        <motion.div
          key={`namaste-anim-${replayKey}`}
          className="w-full h-full flex items-center justify-center"
          animate={
            isPlaying
              ? {
                  y: [4, -6, -6, 4],
                  scale: [0.98, 1.03, 1.03, 0.98],
                }
              : { y: 0, scale: 1 }
          }
          transition={{
            duration: 2.2 / speed,
            repeat: isPlaying ? Infinity : 0,
            ease: 'easeInOut',
            times: [0, 0.35, 0.65, 1],
          }}
        >
          {card.imageSrc ? (
            <img
              src={getAssetUrl(card.imageSrc)}
              alt="Sign for Namaste"
              className="w-full h-full object-contain pointer-events-none"
              loading="lazy"
            />
          ) : (
            <SignVisualIllustration type="namaste" className="w-full h-full object-contain" />
          )}
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // 4. Other Sign Cards (Realistic 2D Motion Transforms on Existing Illustrations)
  // =========================================================================
  const getMotionAnimation = () => {
    switch (card.id) {
      case 'sign-thank-you':
        // Forward gratitude translation
        return {
          animate: { y: [0, 6, 0], scale: [0.98, 1.03, 0.98] },
          transition: { duration: 2.0 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-help':
        // Upward supportive lift
        return {
          animate: { y: [5, -7, 5] },
          transition: { duration: 1.8 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-i-love-you':
        // Warm heartbeat pulse
        return {
          animate: { scale: [0.97, 1.04, 0.97], rotate: [-2, 2, -2] },
          transition: { duration: 1.8 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-stop':
        // Downward chopping press
        return {
          animate: { y: [-8, 2, -8] },
          transition: { duration: 1.6 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-yes':
        // Vertical nodding
        return {
          animate: { y: [-5, 5, -5], rotate: [-4, 4, -4] },
          transition: { duration: 1.5 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-no':
        // Side-to-side snap
        return {
          animate: { rotate: [-6, 6, -6], x: [-3, 3, -3] },
          transition: { duration: 1.4 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-please':
      case 'sign-sorry':
        // Gentle circular chest rub
        return {
          animate: { x: [0, 4, 0, -4, 0], y: [-4, 0, 4, 0, -4] },
          transition: { duration: 2.0 / speed, repeat: isPlaying ? Infinity : 0, ease: 'linear' },
        };
      case 'sign-pain':
        // Twisting and tapping
        return {
          animate: { x: [-3, 3, -3], scale: [0.97, 1.03, 0.97] },
          transition: { duration: 1.2 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-eat':
        // Tapping toward mouth
        return {
          animate: { y: [4, -4, 4], scale: [0.97, 1.03, 0.97] },
          transition: { duration: 1.6 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-drink':
        // Tipping like cup
        return {
          animate: { rotate: [0, -18, 0], x: [0, -4, 0] },
          transition: { duration: 1.9 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-more':
        // Fingertips tapping together
        return {
          animate: { scale: [0.96, 1.03, 0.96] },
          transition: { duration: 1.5 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      case 'sign-bathroom':
        // Shaking side to side
        return {
          animate: { rotate: [-10, 10, -10], x: [-3, 3, -3] },
          transition: { duration: 1.2 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
      default:
        // Gentle organic pulse for other cards
        return {
          animate: { scale: [0.98, 1.02, 0.98] },
          transition: { duration: 2.2 / speed, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        };
    }
  };

  const motionConfig = getMotionAnimation();

  return (
    <div className="relative rounded-xl overflow-hidden mb-4 border border-[#E5E5E5] bg-white h-44 flex items-center justify-center p-2 group select-none">
      {/* Top-Left Controls: Replay & Speed Toggle */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
        <button
          onClick={handleToggleSpeed}
          title="Toggle playback speed"
          className="px-2 py-0.5 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black text-[10px] font-mono font-bold transition-all shadow-xs flex items-center gap-1"
        >
          <Clock className="w-2.5 h-2.5" />
          <span>{speed === 0.5 ? 'Slow-Mo (0.5x)' : '1x'}</span>
        </button>
        <button
          onClick={handleReplay}
          title="Replay animation"
          className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Top-Right Control: Play / Pause */}
      <div className="absolute top-2 right-2 z-20">
        <button
          onClick={handleTogglePlay}
          title={isPlaying ? 'Pause' : 'Play'}
          className="p-1 rounded-md bg-white/95 text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-black" />}
        </button>
      </div>

      {/* Motion-animated existing illustration */}
      <motion.div
        key={`card-anim-${replayKey}`}
        className="w-full h-full flex items-center justify-center"
        animate={isPlaying ? motionConfig.animate : { scale: 1, y: 0, x: 0, rotate: 0 }}
        transition={motionConfig.transition}
      >
        {card.imageSrc ? (
          <img
            src={getAssetUrl(card.imageSrc)}
            alt={`Sign for ${card.phrase}`}
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
          />
        ) : (
          <SignVisualIllustration type={card.svgVisualType} className="w-full h-full object-contain" />
        )}
      </motion.div>
    </div>
  );
};

export default SignCardVisual;
