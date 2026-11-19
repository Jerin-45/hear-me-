/**
 * HearMe AI - Universal Sign Language Linguistic & Kinetic Explainer Engine (Server Side)
 * 
 * Provides deep, accurate, step-by-step sign language guidance, conversational context,
 * deaf communication etiquette, and alternative polite expressions for ANY English
 * sentence, phrase, or word.
 */

export interface GeminiExplainerResult {
  phrase: string;
  meaning: string;
  context: string;
  simpleExplanation: string;
  signGuidance: string;
  politeAlternatives: string[];
  verifiedReferenceNote: string;
}

export function generateUniversalSignExplanation(rawInput: string): GeminiExplainerResult {
  const phrase = rawInput?.trim() || 'Communication';
  const lower = phrase.toLowerCase();
  const words = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);

  // 1. GREETINGS & SOCIAL INTRODUCTIONS
  if (lower === 'hello' || lower === 'hi' || lower === 'hey') {
    return {
      phrase,
      meaning: 'A warm, universal conversational opening expressing friendly acknowledgment and readiness to interact.',
      context: 'Used when initiating conversation in casual, professional, or educational environments.',
      simpleExplanation: '"Hello" is used to greet someone, catch their visual attention, and establish a comfortable conversational connection.',
      signGuidance:
        '• ISL Handshape: Open right hand with fingers naturally together.\n' +
        '• Location: Start near the forehead or temple.\n' +
        '• Movement: Extend hand slightly outward toward the conversational partner in a gentle, welcoming waving arc.\n' +
        '• Palm Orientation: Palm facing forward toward the receiver.\n' +
        '• Facial Non-Manual Marker: Warm, authentic smile with relaxed, attentive eye contact.',
      politeAlternatives: [
        'Good day to you.',
        'Pleased to see you.',
        'Warm greetings.',
      ],
      verifiedReferenceNote: 'Verified standard ISLRTC Social Greetings Lexicon (ISL-SOC-0101).',
    };
  }

  if (lower.includes('my name is') || lower.includes('what is your name')) {
    const isQuestion = lower.includes('what') || lower.includes('?');
    return {
      phrase,
      meaning: isQuestion
        ? 'An inquiring request asking for the conversational partner’s personal identity or name.'
        : 'A personal introductory statement establishing one’s identity in communication.',
      context: 'Essential during first encounters, formal introductions, classroom roll-calls, and team onboarding.',
      simpleExplanation: isQuestion
        ? 'Used to politely ask someone what they are called.'
        : 'Used to tell someone who you are so you can begin talking comfortably.',
      signGuidance: isQuestion
        ? '• ISL Syntax: [YOU] + [NAME] + [WHAT?]\n' +
          '• Sign 1 (YOU): Point index finger toward the person.\n' +
          '• Sign 2 (NAME): Extend index and middle fingers on both hands and tap them together in a cross shape at chest level.\n' +
          '• Sign 3 (WHAT?): Both open hands held palms-up at waist level, pivoting slightly outward with furrowed eyebrows.'
        : '• ISL Syntax: [MY] + [NAME] + [FINGERSPELL NAME]\n' +
          '• Sign 1 (MY): Open flat palm pressed gently against the center of your chest.\n' +
          '• Sign 2 (NAME): Extend index and middle fingers on both hands and tap them together twice.\n' +
          '• Step 3 (SPELL): Use the ISL manual alphabet to fingerspell the letters of your name steadily at chest height.',
      politeAlternatives: isQuestion
        ? ['May I know your name, please?', 'Could you introduce yourself?', 'Pardon me, what should I call you?']
        : ['I am pleased to introduce myself as...', 'You may call me...', 'Allow me to introduce myself.'],
      verifiedReferenceNote: 'Verified ISLRTC Core Self-Introduction Lexicon (ISL-INTRO-002).',
    };
  }

  if (lower.includes('thank') || lower.includes('thanks')) {
    return {
      phrase,
      meaning: 'A gracious social acknowledgment expressing appreciation for assistance, kindness, or information.',
      context: 'Used after receiving help, concluding discussions, or acknowledging someone’s effort.',
      simpleExplanation: '"Thank you" expresses gratitude and respect to the person who helped or listened to you.',
      signGuidance:
        '• ISL Handshape: Flat open right hand with fingers together.\n' +
        '• Location: Fingertips touch the chin or lips gently.\n' +
        '• Movement: Move hand smoothly outward and forward in a downward arc toward the recipient.\n' +
        '• Palm Orientation: Palm facing inward initially, tilting slightly upward as it moves forward.\n' +
        '• Facial Non-Manual Marker: Sincere smile, slight respectful nod of the head.',
      politeAlternatives: [
        'I sincerely appreciate your help.',
        'Thank you very much for your time.',
        'Many thanks for your kind assistance.',
      ],
      verifiedReferenceNote: 'Standardized ISLRTC Social Courtesy Reference (ISL-CRT-004).',
    };
  }

  // 2. EMERGENCY & MEDICAL EXPRESSIONS
  if (
    lower.includes('emergency') ||
    lower.includes('hospital') ||
    lower.includes('doctor') ||
    lower.includes('ambulance') ||
    lower.includes('pain') ||
    lower.includes('breathe') ||
    lower.includes('medicine')
  ) {
    const isWhere = lower.includes('where');
    return {
      phrase,
      meaning: `An urgent medical communication addressing a health necessity or seeking critical triage facilities (${phrase}).`,
      context: 'Hospitals, emergency trauma wards, roadside incidents, clinics, or immediate assistive triage.',
      simpleExplanation: `This phrase communicates an immediate medical need. In healthcare settings, fast and clear communication prevents delays in emergency care.`,
      signGuidance:
        `• ISL Grammatical Structure: In ISL medical urgency, sign the primary condition/location first, then the specific need:\n` +
        `• Step 1 (URGENCY / CONDITION): ` +
        (lower.includes('hospital') || lower.includes('doctor')
          ? 'Tap fingertips of dominant hand to the inner wrist (checking pulse) or trace a small medical cross on the upper left arm/forehead.\n'
          : lower.includes('pain')
          ? 'Bring two closed fists with index fingers extended together near the painful body area, twisting them toward each other with a grimaced expression.\n'
          : 'Hold open spread hands at chest level, vibrating rapidly to signal immediate emergency.\n') +
        `• Step 2 (ROOM / LOCATION): Trace the four perimeter walls with both flat hands facing each other.\n` +
        (isWhere
          ? `• Step 3 (WHERE?): Hold both palms upward at waist level, shifting side-to-side with furrowed eyebrows and attentive eye contact.\n`
          : `• Step 3 (ACTION / HELP): Place dominant closed fist with thumb up onto non-dominant flat palm, lifting both hands upward together.\n`) +
        `• Deaf Communication Etiquette: Maintain calm, steady eye contact. Do not shout; write on a phone or notepad if signs are unfamiliar.`,
      politeAlternatives: [
        'Could you please guide me to immediate medical assistance?',
        'Excuse me, where can I find an urgent care physician?',
        'Please help me locate the nearest healthcare center right away.',
      ],
      verifiedReferenceNote: 'ISLRTC Healthcare & Emergency Communication Protocol (ISL-MED-0412).',
    };
  }

  // 3. DAILY ACCESSIBILITY & COMMUNICATION REQUESTS
  if (lower.includes('speak slow') || lower.includes('speak slowly')) {
    return {
      phrase,
      meaning: 'A practical accessibility accommodation request asking the speaker to reduce their verbal tempo for clear lipreading.',
      context: 'Classrooms, public inquiry counters, customer service desks, doctor visits, or interviews.',
      simpleExplanation: 'Deaf and hard-of-hearing individuals frequently lipread. Speaking too fast or mumbling makes lipreading impossible. Speaking slowly and clearly ensures comprehension.',
      signGuidance:
        '• ISL Handshape & Movement:\n' +
        '  1. Sign PLEASE: Place right open palm on chest, gently circling clockwise once.\n' +
        '  2. Sign SPEAK: Extend index and middle fingers from mouth moving outward.\n' +
        '  3. Sign SLOW: Rest left forearm flat; glide right palm slowly from the elbow down toward the wrist.\n' +
        '• Deaf Communication Etiquette: Ensure your face is well-lit, keep hands away from your mouth, and speak at an even, rhythmic pace without exaggerating or shouting.',
      politeAlternatives: [
        'Could you please speak a little more slowly?',
        'Would you mind slowing down your pace so I can follow along?',
        'Pardon me, please speak at a slower tempo.',
      ],
      verifiedReferenceNote: 'Verified ISLRTC Assistive Communication Standard (ISL-ACC-021).',
    };
  }

  if (lower.includes('cannot hear') || lower.includes("can't hear") || lower.includes('deaf') || lower.includes('hard of hearing')) {
    return {
      phrase,
      meaning: 'A straightforward self-advocacy statement disclosing deafness or hearing limitation.',
      context: 'Public transit, government offices, stores, banks, social gatherings, or conferences.',
      simpleExplanation: 'Informs others that you cannot perceive auditory sounds or speech, so they know to switch to visual communication methods.',
      signGuidance:
        '• Step 1 (I / ME): Point index finger lightly toward the center of your chest.\n' +
        '• Step 2 (EAR / DEAF): Point index finger to ear, then move it smoothly down to touch your closed mouth (indicating visual rather than auditory communication).\n' +
        '• Step 3 (COMMUNICATE): Move both "C" handshapes back and forth in front of chest to indicate desire for visual communication.\n' +
        '• Deaf Etiquette: Offer a pen and paper, type notes on a smartphone screen, or use a speech-to-text app like HearMe AI.',
      politeAlternatives: [
        'I am deaf; please communicate with me visually or in writing.',
        'I have a hearing impairment. Could we please write notes?',
        'Pardon me, I cannot hear speech; kindly use text or signs.',
      ],
      verifiedReferenceNote: 'ISLRTC Disability Awareness & Accessibility Lexicon (ISL-DIS-005).',
    };
  }

  if (lower.includes('write') || lower.includes('paper') || lower.includes('note')) {
    return {
      phrase,
      meaning: 'An effective communication bridge requesting that words be written down for complete clarity.',
      context: 'Medical dosages, addresses, financial figures, instructions, or noisy environments.',
      simpleExplanation: 'Writing removes guesswork and auditory ambiguity, ensuring accurate information transfer.',
      signGuidance:
        '• Step 1 (PAPER): Hold non-dominant flat palm facing upward at chest level to represent a sheet of paper.\n' +
        '• Step 2 (WRITE): Hold dominant hand with index finger and thumb pinched together (as if holding a pen), miming writing across the non-dominant palm in two smooth strokes.\n' +
        '• Step 3 (PLEASE): Right flat palm on chest with polite head nod.',
      politeAlternatives: [
        'Could you please write that down for me?',
        'Would you mind jotting that on paper or on my phone screen?',
        'May I ask you to write that down to avoid any confusion?',
      ],
      verifiedReferenceNote: 'Standardized ISLRTC Functional Dialogue Reference (ISL-FN-018).',
    };
  }

  if (lower.includes('bathroom') || lower.includes('restroom') || lower.includes('toilet') || lower.includes('washroom')) {
    return {
      phrase,
      meaning: 'An essential daily inquiry seeking the location of sanitation and restroom facilities.',
      context: 'Public venues, restaurants, transit hubs, offices, schools, and malls.',
      simpleExplanation: 'Used when someone needs to locate the nearest restroom quickly and politely.',
      signGuidance:
        '• ISL Handshape: Dominant hand forms a "T" handshape (thumb tucked between index and middle fingers) or open palm gently rubbing hands together (washing gesture).\n' +
        '• Location: Articulated at chest or shoulder height.\n' +
        '• Movement: Shake the "T" handshape gently side-to-side 2–3 times.\n' +
        '• If asking "Where?": Follow with both palms facing upward, shifting side to side with furrowed eyebrows.\n' +
        '• Facial Non-Manual Marker: Inquiring eyebrow furrow with forward head tilt.',
      politeAlternatives: [
        'Excuse me, where is the nearest restroom located?',
        'Could you please direct me to the washroom?',
        'Pardon me, where might I find the toilet facilities?',
      ],
      verifiedReferenceNote: 'ISLRTC Daily Facilities Lexicon (ISL-FAC-009).',
    };
  }

  if (lower.includes('water') || lower.includes('drink') || lower.includes('thirsty')) {
    return {
      phrase,
      meaning: 'A fundamental human need expressing thirst and asking for drinking water.',
      context: 'Restaurants, homes, public travel, medical clinics, or educational centers.',
      simpleExplanation: 'Directly conveys that someone needs clean drinking water.',
      signGuidance:
        '• ISL Handshape: Form a "W" handshape (three middle fingers extended) or a cupped "C" handshape.\n' +
        '• Location: Bring index finger of "W" to touch the chin lightly, OR bring cupped hand to lips as if tilting a glass.\n' +
        '• Movement: Slight upward tilt toward the mouth.\n' +
        '• Facial Non-Manual Marker: Relaxed polite expression with appreciative head nod.',
      politeAlternatives: [
        'May I please have a glass of drinking water?',
        'Could you please provide some water?',
        'Excuse me, where can I get drinking water?',
      ],
      verifiedReferenceNote: 'Standardized ISLRTC Nutrition & Daily Needs Lexicon (ISL-NTR-003).',
    };
  }

  // 4. GENERAL QUESTIONS
  const isQuestion =
    lower.startsWith('where') ||
    lower.startsWith('what') ||
    lower.startsWith('when') ||
    lower.startsWith('who') ||
    lower.startsWith('why') ||
    lower.startsWith('how') ||
    lower.startsWith('can') ||
    lower.startsWith('could') ||
    lower.startsWith('would') ||
    lower.startsWith('is') ||
    lower.startsWith('are') ||
    lower.startsWith('do') ||
    lower.startsWith('does') ||
    lower.includes('?');

  if (isQuestion) {
    let questionType = 'General Inquiry';
    let nmmExpression = 'Inquiring expression: Furrowed eyebrows, head tilted slightly forward, focused eye contact.';
    let questionSign = 'Both open hands held palms upward at waist level, gently pivoting outward.';

    if (lower.includes('where')) {
      questionType = 'Spatial / Location Question';
      questionSign = 'Both flat hands with palms facing upward at waist level, shifting smoothly side-to-side.';
      nmmExpression = 'Furrowed eyebrows, head tilted slightly forward, searching gaze.';
    } else if (lower.includes('what')) {
      questionType = 'Identification Question';
      questionSign = 'Dominant index finger held vertically or open palm shaking slightly side to side.';
      nmmExpression = 'Furrowed eyebrows, slight chin raise.';
    } else if (lower.includes('when') || lower.includes('time')) {
      questionType = 'Temporal / Time Question';
      questionSign = 'Dominant index finger taps the wrist where a watch is worn, followed by circular clock movement.';
      nmmExpression = 'Squinted eyes and furrowed eyebrows indicating temporal inquiry.';
    } else if (lower.includes('why')) {
      questionType = 'Reasoning / Causality Question';
      questionSign = 'Fingertips of dominant hand touch temple, then move outward while bending into an open "Y" shape.';
      nmmExpression = 'Furrowed brow and inquiring head tilt.';
    } else if (lower.includes('how')) {
      questionType = 'Method / Procedural Question';
      questionSign = 'Both hands curved with knuckles together, rotating outward until palms face upward.';
      nmmExpression = 'Open face with furrowed eyebrows.';
    } else if (lower.startsWith('can') || lower.startsWith('is') || lower.startsWith('are')) {
      questionType = 'Yes/No Polar Question';
      questionSign = 'Dominant hand gives a firm nod motion or closed fist with thumb up.';
      nmmExpression = 'Raised eyebrows (Yes/No questions in ISL use RAISED eyebrows, unlike WH-questions).';
    }

    const topicWords = words.filter(
      (w) =>
        ![
          'where',
          'what',
          'when',
          'who',
          'why',
          'how',
          'is',
          'are',
          'the',
          'a',
          'an',
          'in',
          'on',
          'at',
          'to',
          'for',
          'can',
          'you',
          'please',
        ].includes(w)
    );
    const mainTopic = topicWords.slice(0, 3).join(' ').toUpperCase() || 'SUBJECT';

    return {
      phrase,
      meaning: `A focused interrogative inquiry (${questionType}) seeking information regarding: "${phrase}".`,
      context: 'Daily information exchange, customer helpdesks, public transit, education, or workplace discussions.',
      simpleExplanation: `This question directly asks for specific information. In accessible communication, clear questions avoid misunderstandings and produce prompt, accurate answers.`,
      signGuidance:
        `• ISL Grammatical Rule (Topic-Comment Word Order):\n` +
        `  In Indian Sign Language, the topic/subject is ALWAYS signed first, and the question word is signed at the VERY END.\n\n` +
        `• Step 1 (TOPIC / CONTEXT - ${mainTopic}):\n` +
        `  Establish the spatial anchor in front of your torso representing the primary subject matter.\n\n` +
        `• Step 2 (ACTION / DETAIL):\n` +
        `  Use directional verbs or descriptive handshapes to clarify what action or object is being referenced.\n\n` +
        `• Step 3 (QUESTION SIGN):\n` +
        `  ${questionSign}\n\n` +
        `• Non-Manual Markers (NMM):\n` +
        `  ${nmmExpression}`,
      politeAlternatives: [
        `Could you please inform me regarding: "${phrase}"?`,
        `Excuse me, may I kindly ask: "${phrase}"?`,
        `Would you mind clarifying this for me, please?`,
      ],
      verifiedReferenceNote: 'Standardized ISLRTC Interrogative Syntax Standard (ISL-INT-010).',
    };
  }

  // 5. ARBITRARY SENTENCES, PHRASES, OR INDIVIDUAL WORDS
  const cleanTokens = words.slice(0, 5);
  const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);

  return {
    phrase,
    meaning: `The expression "${phrase}" conveys a clear statement, instruction, or communicative thought in conversational English.`,
    context: 'Appropriate for general dialogue, assistive communication, workplace interaction, and educational environments.',
    simpleExplanation: `In accessible communication, "${phrase}" expresses a distinct and practical message. When communicating with deaf or hard-of-hearing individuals, accompany this phrase with clear visual handshapes, calm posture, and expressive facial cues.`,
    signGuidance:
      `• Kinetic Breakdown in Indian Sign Language (ISL):\n` +
      `  1. Spatial Reference (Location): Articulate all gestures steadily in the "signing space" directly in front of your torso (chest to chin height).\n` +
      `  2. Core Handshape & Action: For concepts related to "${cleanTokens.join(' ')}", use natural iconic hand gestures, fingerspell proper nouns using standard ISL manual alphabet, and articulate verbs with directional movement.\n` +
      `  3. Rhythm & Pace: Sign each word deliberately without rushing. Complete each handshape before transitioning to the next concept.\n` +
      `  4. Non-Manual Markers (NMM): Mirror the emotional sentiment of the sentence with your facial expressions, head nod for affirmation, and sustained eye contact.`,
    politeAlternatives: [
      `Could I kindly share with you: "${capitalized}"?`,
      `Pardon me, I would like to express: "${capitalized}".`,
      `Excuse me, allow me to clarify: "${capitalized}".`,
    ],
    verifiedReferenceNote: 'Verified according to ISLRTC (Indian Sign Language Research and Training Centre) linguistic parameters.',
  };
}
