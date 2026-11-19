import React from 'react';

interface SignVisualProps {
  type: string;
  className?: string;
}

export const SignVisualIllustration: React.FC<SignVisualProps> = ({ type, className = 'w-full h-44' }) => {
  switch (type) {
    case 'hand_wave':
    case 'hello':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <path d="M45 40 Q55 25 70 30" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M130 30 Q145 25 155 40" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M60 85 C60 65 75 45 100 45 C125 45 140 65 140 85" stroke="#777777" strokeWidth="1" strokeDasharray="4 4" />
          <g transform="translate(75, 45)">
            <rect x="12" y="42" width="26" height="38" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M12 55 C5 52 0 62 8 68 L14 66" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="13" y="10" width="5.5" height="34" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <rect x="20" y="5" width="5.5" height="39" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <rect x="27" y="8" width="5.5" height="36" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <rect x="34" y="16" width="5" height="28" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          </g>
          <path d="M72 38 L65 32 M72 38 L65 44" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M128 38 L135 32 M128 38 L135 44" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            OPEN PALM • HORIZONTAL WAVE
          </text>
        </svg>
      );

    case 'i_love_you':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <circle cx="100" cy="80" r="48" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="3 3" />
          <g transform="translate(80, 40)">
            <rect x="10" y="40" width="28" height="36" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            {/* Thumb extended */}
            <path d="M10 52 C-2 50 -2 38 6 36 L12 42" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="#FFFFFF" />
            {/* Index extended */}
            <rect x="12" y="8" width="6" height="34" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            {/* Middle & Ring curled */}
            <path d="M19 40 C19 32 25 32 25 40" stroke="#000000" strokeWidth="1.5" fill="#FFFFFF" />
            <path d="M25 40 C25 32 31 32 31 40" stroke="#000000" strokeWidth="1.5" fill="#FFFFFF" />
            {/* Pinky extended */}
            <rect x="32" y="14" width="5.5" height="28" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            THUMB + INDEX + PINKY EXTENDED
          </text>
        </svg>
      );

    case 'namaste':
    case 'my_name_is':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <circle cx="100" cy="80" r="46" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="3 3" />
          <g transform="translate(70, 35)">
            <path d="M22 85 L26 40 C27 28 33 28 34 40 L38 85" stroke="#000000" strokeWidth="2" fill="#FFFFFF" strokeLinejoin="round" />
            <line x1="30" y1="26" x2="30" y2="85" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M15 88 Q30 96 45 88" stroke="#000000" strokeWidth="1.5" fill="none" />
          </g>
          <path d="M85 30 Q100 18 115 30" stroke="#777777" strokeWidth="1.5" strokeLinecap="round" />
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            PALMS PRESSED • CHEST LEVEL
          </text>
        </svg>
      );

    case 'help':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <path d="M50 102 C60 102 140 102 150 102 C155 102 155 114 150 114 L50 114 C45 114 45 102 50 102 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          <g transform="translate(82, 45)">
            <rect x="8" y="24" width="24" height="28" rx="5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M12 24 C12 12 18 10 20 10 C22 10 24 16 22 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="#FFFFFF" />
            <path d="M-8 25 L-8 6 M-13 11 L-8 5 L-3 11" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M48 25 L48 6 M43 11 L48 5 L53 11" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            SUPPORT FIST • UPWARD LIFT
          </text>
        </svg>
      );

    case 'thank_you':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <circle cx="65" cy="45" r="14" stroke="#CCCCCC" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M65 59 Q65 75 75 80" stroke="#CCCCCC" strokeWidth="1" strokeLinecap="round" />
          <g transform="translate(85, 45)">
            <rect x="15" y="15" width="22" height="30" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <line x1="37" y1="20" x2="52" y2="20" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="37" y1="26" x2="55" y2="26" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="37" y1="32" x2="53" y2="32" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M-5 12 Q20 5 45 10" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M40 5 L46 10 L41 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            CHIN CONTACT • FORWARD EXTENSION
          </text>
        </svg>
      );

    case 'yes':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(85, 48)">
            <rect x="0" y="10" width="30" height="36" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <circle cx="8" cy="20" r="2" fill="#000000" />
            <circle cx="15" cy="20" r="2" fill="#000000" />
            <circle cx="22" cy="20" r="2" fill="#000000" />
            <path d="M-15 15 L-15 42 M-19 36 L-15 42 L-11 36" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M45 42 L45 15 M41 21 L45 15 L49 21" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            FIST • VERTICAL NODDING MOTION
          </text>
        </svg>
      );

    case 'no':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(75, 40)">
            <path d="M15 50 C25 48 35 45 42 40" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 15 C30 20 40 32 42 38" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <circle cx="43" cy="39" r="6" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" />
            <path d="M30 25 L36 32" stroke="#777777" strokeWidth="1.5" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            INDEX + MIDDLE • SNAP TO THUMB
          </text>
        </svg>
      );

    case 'stop':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(82, 35)">
            <rect x="0" y="30" width="36" height="42" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <rect x="4" y="5" width="6" height="30" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <rect x="12" y="0" width="6" height="35" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <rect x="20" y="3" width="6" height="32" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <rect x="28" y="10" width="5.5" height="25" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          </g>
          <path d="M60 80 Q100 65 140 80" stroke="#777777" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            OPEN PALM FORWARD • CRISP HALT
          </text>
        </svg>
      );

    case 'eat':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <circle cx="70" cy="50" r="14" stroke="#CCCCCC" strokeWidth="1" strokeDasharray="2 2" />
          <g transform="translate(88, 48)">
            <path d="M10 20 C14 12 24 12 28 20 L24 40 L14 40 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M-10 24 L-2 24 M-6 19 L-1 24 L-6 29" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            TAPERED CLUSTER • TO MOUTH
          </text>
        </svg>
      );

    case 'drink':
    case 'water':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(85, 38)">
            <path d="M12 15 C-2 25 -2 50 12 60" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="18" y="18" width="18" height="38" rx="4" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M-15 32 Q-10 15 10 12" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M5 8 L11 12 L7 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            C-SHAPED CUP • TILT TOWARD MOUTH
          </text>
        </svg>
      );

    case 'more':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(60, 48)">
            <path d="M5 25 C10 15 20 15 25 25 L20 45 L10 45 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M75 25 C70 15 60 15 55 25 L60 45 L70 45 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M28 25 L40 25 M36 20 L41 25 L36 30" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M52 25 L40 25 M44 20 L39 25 L44 30" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            TWO CLUSTERED HANDS • TAP TOGETHER
          </text>
        </svg>
      );

    case 'pain':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(60, 50)">
            <line x1="0" y1="25" x2="32" y2="25" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="25" x2="48" y2="25" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M36 15 L40 35 L44 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            INDEX FINGERS • POINTING JOLT
          </text>
        </svg>
      );

    case 'bathroom':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(85, 45)">
            <rect x="0" y="15" width="30" height="36" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <circle cx="10" cy="18" r="5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M-12 30 L-6 30 M-9 26 L-5 30 L-9 34" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M42 30 L36 30 M39 26 L35 30 L39 34" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            T-HAND FIST • HORIZONTAL SHAKE
          </text>
        </svg>
      );

    case 'where':
    case 'what':
    case 'how':
    case 'when':
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <g transform="translate(65, 52)">
            <path d="M0 25 C10 25 25 35 30 35 L30 45 L0 45 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <path d="M70 25 C60 25 45 35 40 35 L40 45 L70 45 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
            <text x="35" y="15" fill="#000000" fontSize="20" textAnchor="middle" fontWeight="bold">?</text>
          </g>
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            PALMS UP • QUESTION MARKER
          </text>
        </svg>
      );

    case 'slow':
    default:
      return (
        <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="8" fill="#F7F7F7" stroke="#E5E5E5" strokeWidth="1" />
          <rect x="45" y="80" width="110" height="16" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          <path d="M130 65 L70 65 M80 58 L70 65 L80 72" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy="88" r="3" fill="#000000" />
          <text x="100" y="145" fill="#777777" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="500">
            FINGERTIP GLIDE ALONG FOREARM
          </text>
        </svg>
      );
  }
};
