import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export interface SignAnimationProps {
  signId: string;
  visualType?: string;
  className?: string;
  isCardHovered?: boolean;
}

export const SignAnimation: React.FC<SignAnimationProps> = ({
  signId,
  visualType = 'hand_wave',
  className = 'w-full h-44',
  isCardHovered = false,
}) => {
  const { settings } = useSettings();
  
  // Detect system-level or app-level prefers-reduced-motion
  const systemReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isReducedMotion = settings.reducedMotion || systemReducedMotion;

  // Animation playback state
  const [isPlaying, setIsPlaying] = useState(!isReducedMotion);
  const [speed, setSpeed] = useState<1 | 0.5>(1); // 1x or 0.5x slow-motion
  const [myStep, setMyStep] = useState<1 | 2>(1); // For two-step signs like "My Name Is"

  // If card is hovered and not in reduced motion mode, play
  useEffect(() => {
    if (isCardHovered && !isReducedMotion) {
      setIsPlaying(true);
    }
  }, [isCardHovered, isReducedMotion]);

  // Two-step sequential loop timer for "My Name Is"
  useEffect(() => {
    if (signId !== 'sign-my-name-is' && visualType !== 'my_name_is') return;
    if (!isPlaying) return;

    const stepInterval = setInterval(() => {
      setMyStep((prev) => (prev === 1 ? 2 : 1));
    }, (2400 / speed));

    return () => clearInterval(stepInterval);
  }, [signId, visualType, isPlaying, speed]);

  // Toggle speed between 1x and 0.5x
  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeed((prev) => (prev === 1 ? 0.5 : 1));
  };

  // Toggle Play / Pause
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  // Compute animation duration multiplier
  const durationMultiplier = speed === 0.5 ? 2.0 : 1.0;

  // Render the specific animated sign visual based on signId / visualType
  const renderSignGraphic = () => {
    switch (signId) {
      // =========================================================================
      // 1. "HELLO" (Open right hand at head level, waving horizontally from wrist)
      // =========================================================================
      case 'sign-hello':
      case 'hello':
      case 'hand_wave':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              {/* Background ambient container border */}
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Head position & eye level reference outline */}
              <circle cx="50" cy="55" r="16" stroke="#D4D4D4" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M44 54 Q47 52 50 54" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M53 54 Q56 52 59 54" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M48 62 Q50 64 54 62" stroke="#999999" strokeWidth="1.2" strokeLinecap="round" />

              {/* Horizontal Wave Motion Trajectory Arc */}
              <path
                d="M78 40 C95 24 135 24 152 40"
                stroke="#000000"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <path d="M80 43 L76 38 L82 35" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M150 43 L154 38 L148 35" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Smooth Animated Open Waving Hand pivoting from wrist at (115, 115) */}
              <motion.g
                animate={
                  isPlaying
                    ? {
                        rotate: [-16, 16, -16],
                        x: [-6, 6, -6],
                      }
                    : { rotate: 0, x: 0 }
                }
                transition={{
                  duration: 1.6 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '115px 115px' }}
              >
                {/* Wrist / Forearm */}
                <path d="M106 115 L106 142 L124 142 L124 115" stroke="#000000" strokeWidth="1.75" fill="#FFFFFF" />
                {/* Palm Base */}
                <rect x="100" y="70" width="30" height="42" rx="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                
                {/* Thumb extended sideways */}
                <path
                  d="M100 84 C88 80 84 94 94 100 L102 98"
                  stroke="#000000"
                  strokeWidth="2"
                  fill="#FFFFFF"
                  strokeLinecap="round"
                />
                
                {/* 4 Fingers extended upwards */}
                {/* Index */}
                <rect x="101.5" y="34" width="6.5" height="38" rx="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                {/* Middle */}
                <rect x="109.5" y="27" width="6.5" height="45" rx="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                {/* Ring */}
                <rect x="117.5" y="31" width="6.5" height="41" rx="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                {/* Pinky */}
                <rect x="125.5" y="40" width="6" height="32" rx="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />

                {/* Knuckle joint crease lines */}
                <line x1="104" y1="70" x2="127" y2="70" stroke="#777777" strokeWidth="1" strokeLinecap="round" />
              </motion.g>

              {/* Subtitle label */}
              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                OPEN PALM • HORIZONTAL WRIST WAVE
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 2. "MY NAME IS" (Two-step sequential loop: "My" tap chest -> "Name" cross tap)
      // =========================================================================
      case 'sign-my-name-is':
      case 'my_name_is':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              <AnimatePresence mode="wait">
                {myStep === 1 ? (
                  // Step 1: "MY" - Open Flat Palm Tapping Chest
                  <motion.g
                    key="step-my"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Chest torso outline guide */}
                    <path
                      d="M60 135 C60 100 80 85 100 85 C120 85 140 100 140 135"
                      stroke="#E5E5E5"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Animated Hand tapping chest with depth pulse */}
                    <motion.g
                      animate={
                        isPlaying
                          ? {
                              scale: [1, 0.92, 1, 0.92, 1],
                              y: [0, 4, 0, 4, 0],
                            }
                          : { scale: 1, y: 0 }
                      }
                      transition={{
                        duration: 1.8 * durationMultiplier,
                        repeat: isPlaying ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                      style={{ transformOrigin: '100px 90px' }}
                    >
                      {/* Open flat palm resting on chest */}
                      <rect x="85" y="70" width="30" height="38" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                      {/* Thumb */}
                      <path d="M85 82 C76 80 75 90 85 94" stroke="#000000" strokeWidth="2" fill="#FFFFFF" />
                      {/* Fingers together flat on chest */}
                      <rect x="86" y="38" width="6.5" height="34" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      <rect x="93" y="33" width="6.5" height="39" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      <rect x="100" y="35" width="6.5" height="37" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      <rect x="107" y="42" width="6" height="30" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      
                      {/* Gentle tap contact ripple */}
                      <circle cx="100" cy="85" r="22" stroke="#000000" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                    </motion.g>

                    {/* Step label pill */}
                    <rect x="45" y="12" width="110" height="18" rx="9" fill="#000000" />
                    <text x="100" y="24" fill="#FFFFFF" fontSize="8.5" textAnchor="middle" fontFamily="monospace" fontWeight="700">
                      STEP 1/2: TAP CHEST ("MY")
                    </text>
                  </motion.g>
                ) : (
                  // Step 2: "NAME" - Two H-hands tapping in cross shape
                  <motion.g
                    key="step-name"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Cross tap contact indicator */}
                    <circle cx="100" cy="75" r="16" stroke="#000000" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />

                    {/* Non-dominant Left Hand (Horizontal base H-hand) */}
                    <g transform="translate(62, 65)">
                      <rect x="0" y="8" width="22" height="16" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      {/* Index & Middle extended horizontally */}
                      <rect x="22" y="8" width="34" height="6" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      <rect x="22" y="16" width="34" height="6" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                    </g>

                    {/* Dominant Right Hand (Tapping down vertically across) */}
                    <motion.g
                      animate={
                        isPlaying
                          ? {
                              y: [-8, 0, -8, 0, -8],
                            }
                          : { y: 0 }
                      }
                      transition={{
                        duration: 1.6 * durationMultiplier,
                        repeat: isPlaying ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                      transform="translate(90, 30)"
                    >
                      <rect x="5" y="0" width="18" height="22" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      {/* Index & Middle extended vertically down across the base hand */}
                      <rect x="6" y="22" width="6.5" height="34" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      <rect x="14" y="22" width="6.5" height="34" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                      {/* Tap impact indicator sparkles */}
                      <path d="M4 48 L-1 52 M24 48 L29 52" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
                    </motion.g>

                    {/* Step label pill */}
                    <rect x="40" y="12" width="120" height="18" rx="9" fill="#000000" />
                    <text x="100" y="24" fill="#FFFFFF" fontSize="8.5" textAnchor="middle" fontFamily="monospace" fontWeight="700">
                      STEP 2/2: CROSS TAP ("NAME")
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>

              {/* Subtitle label */}
              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                TWO-STEP ISL GRAMMAR SEQUENCE
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 3. "NAMASTE / WELCOME" (Palms pressed in prayer position, gentle lift & nod)
      // =========================================================================
      case 'sign-namaste':
      case 'namaste':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Radiating respectful harmony circles from the prayer center */}
              <motion.circle
                cx="100"
                cy="75"
                r="38"
                stroke="#000000"
                strokeWidth="1"
                strokeDasharray="4 4"
                animate={
                  isPlaying
                    ? {
                        scale: [0.9, 1.15, 0.9],
                        opacity: [0.2, 0.5, 0.2],
                      }
                    : { scale: 1, opacity: 0.3 }
                }
                transition={{
                  duration: 2.2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '100px 75px' }}
              />

              {/* Upward respectful motion guideline arrows */}
              <path d="M68 62 L68 50 M64 54 L68 49 L72 54" stroke="#777777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M132 62 L132 50 M128 54 L132 49 L136 54" stroke="#777777" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Two palms pressed together in prayer position (Anjali Mudra) */}
              <motion.g
                animate={
                  isPlaying
                    ? {
                        y: [4, -6, 4],
                        scale: [0.98, 1.02, 0.98],
                      }
                    : { y: 0, scale: 1 }
                }
                transition={{
                  duration: 2.2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '100px 85px' }}
              >
                {/* Both hands pressed symmetrically */}
                <g transform="translate(76, 25)">
                  {/* Left hand pressing right */}
                  <path
                    d="M16 92 L19 50 C20 34 24 34 24 50 L24 92"
                    stroke="#000000"
                    strokeWidth="2"
                    fill="#FFFFFF"
                    strokeLinejoin="round"
                  />
                  {/* Right hand pressing left */}
                  <path
                    d="M32 92 L29 50 C28 34 24 34 24 50 L24 92"
                    stroke="#000000"
                    strokeWidth="2"
                    fill="#FFFFFF"
                    strokeLinejoin="round"
                  />
                  {/* Center seam where palms meet */}
                  <line x1="24" y1="34" x2="24" y2="92" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Wrist cuffs */}
                  <path d="M14 92 Q24 98 34 92" stroke="#000000" strokeWidth="2" fill="none" />
                </g>
              </motion.g>

              {/* Subtitle label */}
              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                PALMS PRESSED • RESPECTFUL LIFT & NOD
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 4. "THANK YOU" (Flat hand sweeps forward & downward from chin)
      // =========================================================================
      case 'sign-thank-you':
      case 'thank_you':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              {/* Chin reference guide */}
              <circle cx="65" cy="45" r="14" stroke="#CCCCCC" strokeWidth="1" strokeDasharray="2 2" />
              {/* Forward gratitude motion arc */}
              <path d="M75 58 C95 62 125 78 145 92" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M145 92 L137 89 M145 92 L141 84" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [0, 35, 0],
                        y: [0, 15, 0],
                        rotate: [0, -10, 0],
                      }
                    : { x: 0, y: 0, rotate: 0 }
                }
                transition={{
                  duration: 2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                transform="translate(75, 40)"
              >
                <rect x="10" y="14" width="24" height="30" rx="5" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                <rect x="34" y="16" width="28" height="6" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="34" y="24" width="30" height="6" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="34" y="32" width="28" height="6" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <path d="M10 20 C2 18 2 28 10 32" stroke="#000000" strokeWidth="1.75" fill="#FFFFFF" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                CHIN TO FORWARD GRATITUDE ARC
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 5. "I LOVE YOU" (Thumb, index & pinky extended, pulsing warmth)
      // =========================================================================
      case 'sign-i-love-you':
      case 'i_love_you':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Radiating pulse ring */}
              <motion.circle
                cx="100"
                cy="70"
                r="36"
                stroke="#000000"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                animate={
                  isPlaying
                    ? {
                        scale: [0.92, 1.15, 0.92],
                        opacity: [0.2, 0.6, 0.2],
                      }
                    : { scale: 1, opacity: 0.3 }
                }
                transition={{
                  duration: 1.8 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '100px 70px' }}
              />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        rotate: [-6, 6, -6],
                        scale: [0.98, 1.03, 0.98],
                      }
                    : { rotate: 0, scale: 1 }
                }
                transition={{
                  duration: 1.8 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '100px 95px' }}
              >
                <g transform="translate(80, 32)">
                  <rect x="10" y="40" width="30" height="38" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                  {/* Thumb extended out */}
                  <path d="M10 52 C-3 48 -3 36 6 36 L12 42" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="#FFFFFF" />
                  {/* Index extended up */}
                  <rect x="11" y="8" width="6.5" height="35" rx="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                  {/* Middle & Ring curled into palm */}
                  <path d="M19 40 C19 32 25 32 25 40" stroke="#000000" strokeWidth="1.75" fill="#FFFFFF" />
                  <path d="M26 40 C26 32 32 32 32 40" stroke="#000000" strokeWidth="1.75" fill="#FFFFFF" />
                  {/* Pinky extended up */}
                  <rect x="33" y="14" width="6" height="30" rx="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                </g>
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                THUMB + INDEX + PINKY EXTENDED
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 6. "HELP" (Thumbs-up fist lifted upward by supportive flat palm)
      // =========================================================================
      case 'sign-help':
      case 'help':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Upward lift arrows */}
              <path d="M50 85 L50 55 M46 62 L50 55 L54 62" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M150 85 L150 55 M146 62 L150 55 L154 62" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        y: [8, -10, 8],
                      }
                    : { y: 0 }
                }
                transition={{
                  duration: 1.8 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {/* Base flat palm */}
                <rect x="55" y="96" width="90" height="12" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {/* Supported thumbs-up fist */}
                <g transform="translate(85, 45)">
                  <rect x="6" y="24" width="24" height="28" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                  {/* Thumb up */}
                  <path d="M11 24 C11 10 17 8 20 8 C23 8 25 15 23 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="#FFFFFF" />
                </g>
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                SUPPORTIVE PALM • UPWARD LIFT
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 7. "PLEASE" (Flat hand circular rub on chest)
      // =========================================================================
      case 'sign-please':
      case 'please':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Circular rubbing path indicator */}
              <circle cx="100" cy="72" r="24" stroke="#777777" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M124 72 L121 66 M124 72 L129 68" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [0, 10, 0, -10, 0],
                        y: [-10, 0, 10, 0, -10],
                        rotate: [0, 8, 0, -8, 0],
                      }
                    : { x: 0, y: 0, rotate: 0 }
                }
                transition={{
                  duration: 2.2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'linear',
                }}
                transform="translate(85, 45)"
              >
                <rect x="5" y="15" width="28" height="34" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                <rect x="6" y="-8" width="6" height="26" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="13" y="-12" width="6" height="30" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="20" y="-10" width="6" height="28" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="27" y="-4" width="5.5" height="22" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                FLAT PALM • CIRCULAR CHEST RUB
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 8. "YES" (Fist nodding up and down from wrist)
      // =========================================================================
      case 'sign-yes':
      case 'yes':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Nodding arc */}
              <path d="M135 50 C142 62 142 80 135 92" stroke="#000000" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M135 92 L140 86 M135 92 L132 86" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        rotate: [-18, 16, -18],
                        y: [-6, 6, -6],
                      }
                    : { rotate: 0, y: 0 }
                }
                transition={{
                  duration: 1.5 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '90px 105px' }}
                transform="translate(85, 45)"
              >
                {/* Arm / Wrist */}
                <path d="M5 60 L5 80 L25 80 L25 60" stroke="#000000" strokeWidth="1.75" fill="#FFFFFF" />
                {/* S-fist */}
                <rect x="0" y="20" width="30" height="34" rx="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {/* Thumb folded across knuckles */}
                <path d="M2 32 C12 32 20 32 28 32" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                <path d="M0 24 C10 24 15 36 28 36" stroke="#777777" strokeWidth="1.5" strokeLinecap="round" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                S-FIST • VERTICAL NOD FROM WRIST
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 9. "NO" (Index & middle fingers snapping down against thumb)
      // =========================================================================
      case 'sign-no':
      case 'no':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Snap contact lines */}
              <path d="M120 72 L126 68 M120 78 L126 82" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />

              <g transform="translate(80, 45)">
                {/* Palm base */}
                <rect x="0" y="20" width="28" height="34" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {/* Thumb extended below */}
                <path d="M5 36 C18 42 26 40 32 38" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

                {/* Index & middle snapping down against thumb */}
                <motion.g
                  animate={
                    isPlaying
                      ? {
                          rotate: [-25, 0, -25, 0, -25],
                        }
                      : { rotate: 0 }
                  }
                  transition={{
                    duration: 1.6 * durationMultiplier,
                    repeat: isPlaying ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: '20px 20px' }}
                >
                  <rect x="22" y="14" width="22" height="6" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                  <rect x="22" y="22" width="22" height="6" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                </motion.g>
              </g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                FINGERS SNAP TO THUMB • "NO"
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 10. "STOP" (Open palm chops down on horizontal flat hand)
      // =========================================================================
      case 'sign-stop':
      case 'stop':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Base horizontal hand */}
              <rect x="55" y="90" width="90" height="14" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />

              {/* Chopping vertical hand */}
              <motion.g
                animate={
                  isPlaying
                    ? {
                        y: [-25, 0, -25, 0, -25],
                      }
                    : { y: 0 }
                }
                transition={{
                  duration: 1.8 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                transform="translate(90, 42)"
              >
                <rect x="5" y="0" width="14" height="48" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                <path d="M-4 44 L-9 40 M23 44 L28 40" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                SHARP DOWNWARD CHOP ONTO PALM
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 11. "SORRY" (A-Fist circular rubbing on chest)
      // =========================================================================
      case 'sign-sorry':
      case 'sorry':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              <circle cx="100" cy="72" r="22" stroke="#777777" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M122 72 L119 66 M122 72 L127 68" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [0, 8, 0, -8, 0],
                        y: [-8, 0, 8, 0, -8],
                      }
                    : { x: 0, y: 0 }
                }
                transition={{
                  duration: 2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'linear',
                }}
                transform="translate(85, 48)"
              >
                <rect x="5" y="8" width="28" height="34" rx="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {/* Thumb across knuckles */}
                <path d="M5 24 C14 24 22 24 33 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                A-FIST • CIRCULAR CHEST RUB
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 12. "PAIN" (Two index fingers pointing at each other twisting & tapping)
      // =========================================================================
      case 'sign-pain':
      case 'pain':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Pain center pulse spark */}
              <motion.circle
                cx="100"
                cy="70"
                r="12"
                stroke="#000000"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                animate={
                  isPlaying
                    ? {
                        scale: [0.8, 1.4, 0.8],
                        opacity: [0.3, 0.8, 0.3],
                      }
                    : { scale: 1, opacity: 0.5 }
                }
                transition={{
                  duration: 1.2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '100px 70px' }}
              />

              {/* Left index finger pointing right */}
              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [-10, 0, -10],
                        rotate: [-8, 8, -8],
                      }
                    : { x: 0, rotate: 0 }
                }
                transition={{
                  duration: 1.2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                transform="translate(42, 54)"
              >
                <rect x="0" y="6" width="22" height="20" rx="5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="22" y="12" width="28" height="7" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
              </motion.g>

              {/* Right index finger pointing left */}
              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [10, 0, 10],
                        rotate: [8, -8, 8],
                      }
                    : { x: 0, rotate: 0 }
                }
                transition={{
                  duration: 1.2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                transform="translate(110, 54)"
              >
                <rect x="26" y="6" width="22" height="20" rx="5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="-2" y="12" width="28" height="7" rx="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                INDEX FINGERS TWIST & TAP • "PAIN"
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 13. "EAT" (Flattened O-fingers tapping toward mouth)
      // =========================================================================
      case 'sign-eat':
      case 'eat':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              {/* Mouth guide */}
              <path d="M50 48 Q58 58 66 48" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [18, -4, 18, -4, 18],
                        y: [12, -4, 12, -4, 12],
                      }
                    : { x: 0, y: 0 }
                }
                transition={{
                  duration: 1.8 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                transform="translate(75, 45)"
              >
                <circle cx="28" cy="24" r="14" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                <rect x="22" y="16" width="12" height="16" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
                <path d="M12 24 L22 24" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                FLAT-O FINGERTIPS TAP TOWARD MOUTH
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 14. "DRINK" / "WATER" (C-hand tilting like a cup toward mouth)
      // =========================================================================
      case 'sign-drink':
      case 'drink':
      case 'sign-water':
      case 'water':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              {/* Head reference */}
              <circle cx="55" cy="50" r="14" stroke="#D4D4D4" strokeWidth="1" strokeDasharray="2 2" />

              {/* Tipping motion arc */}
              <path d="M120 40 C130 50 130 65 120 75" stroke="#777777" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M120 40 L126 42 M120 40 L122 46" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        rotate: [0, -32, 0, -32, 0],
                        x: [0, -10, 0, -10, 0],
                      }
                    : { rotate: 0, x: 0 }
                }
                transition={{
                  duration: 2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '80px 70px' }}
                transform="translate(80, 42)"
              >
                {/* C-Hand holding virtual cup */}
                <path
                  d="M10 12 C28 6 36 24 30 38 C24 48 10 42 10 42"
                  stroke="#000000"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <rect x="0" y="18" width="16" height="24" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                C-HAND TILT TOWARD MOUTH • "DRINK"
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 15. "MORE" (Both flattened O-hands tapping fingertips together)
      // =========================================================================
      case 'sign-more':
      case 'more':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Contact point indicator */}
              <circle cx="100" cy="70" r="12" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />

              {/* Left O-hand moving right */}
              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [-12, 0, -12, 0, -12],
                      }
                    : { x: 0 }
                }
                transition={{
                  duration: 1.6 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                transform="translate(50, 52)"
              >
                <ellipse cx="20" cy="18" rx="14" ry="12" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <path d="M28 12 C34 16 34 20 28 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
              </motion.g>

              {/* Right O-hand moving left */}
              <motion.g
                animate={
                  isPlaying
                    ? {
                        x: [12, 0, 12, 0, 12],
                      }
                    : { x: 0 }
                }
                transition={{
                  duration: 1.6 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                transform="translate(108, 52)"
              >
                <ellipse cx="22" cy="18" rx="14" ry="12" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <path d="M14 12 C8 16 8 20 14 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                BOTH O-HANDS TAP FINGERTIPS • "MORE"
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 16. "BATHROOM" (T-hand shaking side to side)
      // =========================================================================
      case 'sign-bathroom':
      case 'bathroom':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              {/* Shaking vibration lines */}
              <path d="M68 65 Q64 72 68 80" stroke="#777777" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M132 65 Q136 72 132 80" stroke="#777777" strokeWidth="1.5" strokeLinecap="round" />

              <motion.g
                animate={
                  isPlaying
                    ? {
                        rotate: [-16, 16, -16],
                        x: [-6, 6, -6],
                      }
                    : { rotate: 0, x: 0 }
                }
                transition={{
                  duration: 1.2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '100px 85px' }}
                transform="translate(84, 45)"
              >
                {/* T-fist (thumb poking between index & middle) */}
                <rect x="0" y="18" width="32" height="34" rx="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {/* Thumb poking out top */}
                <path d="M8 18 C8 6 16 4 18 4 C20 4 22 10 20 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="#FFFFFF" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                T-FIST SHAKING SIDE TO SIDE • "BATHROOM"
              </text>
            </svg>
          </div>
        );

      // =========================================================================
      // 11. Generic fallback: Crisp animated ISL hand gesture illustration
      // =========================================================================
      default:
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
              <rect width="200" height="150" rx="8" fill="#FAFAFA" stroke="#EAEAEA" strokeWidth="1" />
              
              <motion.g
                animate={
                  isPlaying
                    ? {
                        scale: [0.97, 1.03, 0.97],
                        y: [-3, 3, -3],
                      }
                    : { scale: 1, y: 0 }
                }
                transition={{
                  duration: 2 * durationMultiplier,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '100px 75px' }}
              >
                <circle cx="100" cy="72" r="32" stroke="#000000" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.35" />
                <rect x="85" y="55" width="30" height="36" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                <rect x="87" y="24" width="6.5" height="34" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="94" y="20" width="6.5" height="38" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="101" y="22" width="6.5" height="36" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <rect x="108" y="28" width="6" height="30" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.75" />
                <path d="M85 64 C76 62 76 72 85 76" stroke="#000000" strokeWidth="2" fill="#FFFFFF" />
              </motion.g>

              <text x="100" y="140" fill="#777777" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                ISL VERIFIED HAND POSTURE
              </text>
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-center select-none group transition-all duration-200 ${className}`}
      onMouseEnter={() => !isReducedMotion && setIsPlaying(true)}
    >
      {/* Interactive Controls Overlay */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
        {/* Speed Toggle (1x / 0.5x Slow-Motion) */}
        <button
          onClick={toggleSpeed}
          title="Toggle animation playback speed"
          aria-label={`Toggle animation speed, current: ${speed}x`}
          className="px-1.5 py-0.5 rounded-md bg-white/90 hover:bg-white text-black border border-[#D4D4D4] hover:border-black text-[9px] font-mono font-bold transition-all shadow-xs flex items-center gap-0.5"
        >
          <Clock className="w-2.5 h-2.5" />
          <span>{speed}x</span>
        </button>

        {/* Multi-step indicator badge for "My Name Is" */}
        {signId === 'sign-my-name-is' && (
          <span className="px-1.5 py-0.5 rounded-md bg-black text-white text-[8px] font-mono font-bold">
            Step {myStep}/2
          </span>
        )}
      </div>

      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
        {/* Play / Pause Toggle Button */}
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pause animation' : 'Play animation'}
          aria-label={isPlaying ? 'Pause sign animation' : 'Play sign animation'}
          className="p-1 rounded-md bg-white/90 hover:bg-white text-black border border-[#D4D4D4] hover:border-black transition-all shadow-xs"
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 text-black" />
          ) : (
            <Play className="w-3 h-3 text-black fill-black" />
          )}
        </button>
      </div>

      {/* Main Animated Sign Illustration */}
      <div className="w-full h-full p-2 flex items-center justify-center">
        {renderSignGraphic()}
      </div>

      {/* Subtle indicator bar when paused */}
      {!isPlaying && (
        <div className="absolute bottom-1 right-2 z-10 pointer-events-none">
          <span className="text-[8px] font-mono text-[#888888] bg-white/80 px-1 py-0.5 rounded border border-[#E5E5E5]">
            PAUSED
          </span>
        </div>
      )}
    </div>
  );
};

export default SignAnimation;
