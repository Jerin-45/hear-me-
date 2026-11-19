import { SignLanguageCard } from '../types';

export const SIGN_LANGUAGE_CARDS: SignLanguageCard[] = [
  // Greetings
  {
    id: 'sign-hello',
    phrase: 'Hello',
    category: 'Greetings',
    meaning: 'A warm universal friendly greeting used to initiate conversation.',
    context: 'Everyday meetings, classrooms, professional intros, greeting friends.',
    instructions: [
      'Raise dominant hand to head level with open flat palm facing forward.',
      'Gently wave from side to side in a small horizontal arc, smiling politely.',
      'Maintain comfortable eye contact with the viewer.'
    ],
    isISLVerified: true,
    referenceSource: 'Indian Sign Language Research and Training Centre (ISLRTC)',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/hello.jpg',
  },
  {
    id: 'sign-my-name-is',
    phrase: 'My Name Is',
    category: 'Greetings',
    meaning: 'Used to introduce your personal name to someone.',
    context: 'First-time introductions, classes, meeting new colleagues.',
    instructions: [
      'Touch open flat palm to chest indicating "My".',
      'Extend index and middle fingers on both hands and tap them together in a cross shape indicating "Name".'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Basic Conversational Grammar',
    svgVisualType: 'namaste',
    imageSrc: '/images/signs/my-name-is.jpg',
  },
  {
    id: 'sign-namaste',
    phrase: 'Namaste / Welcome',
    category: 'Greetings',
    meaning: 'Traditional respectful greeting and welcoming gesture in Indian Sign Language.',
    context: 'Formal greetings, welcoming guests, addressing elders or groups.',
    instructions: [
      'Bring both hands in front of your chest with palms together (prayer position).',
      'Fingers pointing upwards with a slight respectful head nod.',
      'Hold steadily for a brief second.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Standard Vocabulary (ISL Dictionary)',
    svgVisualType: 'namaste',
  },
  {
    id: 'sign-good-morning',
    phrase: 'Good Morning',
    category: 'Greetings',
    meaning: 'Morning greeting wishing a positive start to the day.',
    context: 'Beginning of school, office start hours, breakfast encounters.',
    instructions: [
      'Sign "Good": Thumb up from dominant hand moving slightly forward with a nod.',
      'Sign "Morning": Non-dominant arm rests flat horizontally representing the horizon, dominant hand rises from below like a rising sun.',
    ],
    isISLVerified: true,
    referenceSource: 'ISL Conversational Guidelines',
    svgVisualType: 'hand_wave',
  },

  // Everyday Communication
  {
    id: 'sign-thank-you',
    phrase: 'Thank You',
    category: 'Everyday Communication',
    meaning: 'Expressing genuine gratitude and appreciation.',
    context: 'When receiving assistance, gifts, food, or helpful directions.',
    instructions: [
      'Place fingertips of flat dominant hand gently near your lips or chin.',
      'Move your hand smoothly outward and slightly downward toward the person.',
      'Accompany with a pleasant facial expression or slight nod.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Standard ISL Dictionary',
    svgVisualType: 'thank_you',
    imageSrc: '/images/signs/thank-you.jpg',
  },
  {
    id: 'sign-please',
    phrase: 'Please',
    category: 'Everyday Communication',
    meaning: 'Polite request marker showing courtesy.',
    context: 'Asking for assistance, requesting someone to write something down or repeat.',
    instructions: [
      'Place the flat palm of your dominant hand on the center of your chest.',
      'Move the hand in gentle circular clockwise motions.',
      'Keep your facial expression respectful and gentle.'
    ],
    isISLVerified: true,
    referenceSource: 'ISL Courtesy Expressions',
    svgVisualType: 'namaste',
    imageSrc: '/images/signs/please.jpg',
  },
  {
    id: 'sign-sorry',
    phrase: 'Sorry / Excuse Me',
    category: 'Everyday Communication',
    meaning: 'Expressing apology, remorse, or asking for passage.',
    context: 'Accidental bumps, needing clarification, or apologizing for misunderstanding.',
    instructions: [
      'Make a loose fist with your dominant hand.',
      'Rub the knuckle side gently in circular motions over your chest.',
      'Show an apologetic facial expression.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Standard Vocabulary',
    svgVisualType: 'namaste',
    imageSrc: '/images/signs/sorry.jpg',
  },
  {
    id: 'sign-i-love-you',
    phrase: 'I Love You',
    category: 'Everyday Communication',
    meaning: 'Affection, care, warmth, and close personal connection.',
    context: 'Family gatherings, greeting close loved ones or friends.',
    instructions: [
      'Extend dominant hand upright with thumb, index finger, and pinky finger open.',
      'Keep middle finger and ring finger folded flat against the palm.',
      'Smile and present the hand facing forward.'
    ],
    isISLVerified: true,
    referenceSource: 'Universal & ISL Deaf Culture Sign',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/i-love-you.jpg',
  },

  // Emergency
  {
    id: 'sign-help',
    phrase: 'Help / Emergency Assistance',
    category: 'Emergency',
    meaning: 'Urgent request for immediate assistance or support.',
    context: 'Accidents, feeling lost, sudden danger, medical distress.',
    instructions: [
      'Hold non-dominant hand flat horizontally, palm facing upward like a sturdy base.',
      'Form a closed fist with dominant hand with thumb pointing upward.',
      'Place the fist on the flat palm and raise both hands upward together firmly.'
    ],
    isISLVerified: true,
    referenceSource: 'Universal Sign Language Emergency Standard & ISL',
    svgVisualType: 'help',
    imageSrc: '/images/signs/help.jpg',
  },
  {
    id: 'sign-stop',
    phrase: 'Stop / Danger',
    category: 'Emergency',
    meaning: 'Halting an activity or signaling caution/danger.',
    context: 'Traffic safety, stopping someone from stepping into harm, emergencies.',
    instructions: [
      'Hold dominant hand out with open palm facing outward firmly toward the person.',
      'Make a decisive, crisp halting motion.',
      'Serious, focused facial expression.'
    ],
    isISLVerified: true,
    referenceSource: 'Standard Safety Visual Signals',
    svgVisualType: 'stop',
    imageSrc: '/images/signs/stop.jpg',
  },

  // Medical Communication
  {
    id: 'sign-pain',
    phrase: 'Pain / Hurt',
    category: 'Medical Communication',
    meaning: 'Indicating physical pain or ache.',
    context: 'Describing illness or symptoms to nurses, doctors, or caregivers.',
    instructions: [
      'Point both index fingers toward each other with a short gap between them.',
      'Bring them toward each other repeatedly with a twisting jolt near the affected body part (e.g. head, stomach).',
      'Facial expression should reflect discomfort.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Medical Signs Guide',
    svgVisualType: 'doctor',
    imageSrc: '/images/signs/pain.jpg',
  },
  {
    id: 'sign-doctor',
    phrase: 'Doctor / Medical Professional',
    category: 'Medical Communication',
    meaning: 'Referring to a physician or medical facility.',
    context: 'Hospitals, clinics, requesting medical consultation.',
    instructions: [
      'Hold non-dominant wrist out facing upward.',
      'Touch the pulse point of the wrist using the index and middle fingertips of your dominant hand, as if checking pulse.',
      'Can be followed by signing "hospital" or pointing in direction.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Healthcare Vocabulary Module',
    svgVisualType: 'doctor',
  },
  {
    id: 'sign-medicine',
    phrase: 'Medicine / Tablets',
    category: 'Medical Communication',
    meaning: 'Referring to prescription drugs or pills.',
    context: 'Pharmacy counters, nurse interactions, scheduling dosage.',
    instructions: [
      'Hold open palm of non-dominant hand flat.',
      'Grind the middle finger of the dominant hand into the center of the palm as if grinding in a mortar, or mimic placing a pill into mouth with glass of water.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Healthcare Standards',
    svgVisualType: 'doctor',
  },

  // Food and Drinks
  {
    id: 'sign-eat',
    phrase: 'Eat / Food',
    category: 'Food and Drinks',
    meaning: 'Having a meal or asking for food.',
    context: 'Dining, meal times, purchasing food.',
    instructions: [
      'Bring the fingertips of dominant hand together into a tapered cluster touching thumb (like holding a small bite).',
      'Bring the fingertips toward your mouth repeatedly with a natural chewing expression.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Common Daily Lexicon',
    svgVisualType: 'water',
    imageSrc: '/images/signs/eat.jpg',
  },
  {
    id: 'sign-drink',
    phrase: 'Drink / Beverage',
    category: 'Food and Drinks',
    meaning: 'Drinking water, tea, or requesting any beverage.',
    context: 'Cafeterias, dining, hospitality counters.',
    instructions: [
      'Form a C-shape grip with dominant hand as if holding a small cup.',
      'Tilt the hand back toward your mouth mimicking taking a drink.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Daily Expressions',
    svgVisualType: 'water',
    imageSrc: '/images/signs/drink.jpg',
  },
  {
    id: 'sign-water',
    phrase: 'Water / Thirst',
    category: 'Food and Drinks',
    meaning: 'Drinking water or requesting water.',
    context: 'Restaurants, cafeterias, travel, asking for potable water.',
    instructions: [
      'Form a "W" shape with dominant hand (index, middle, ring finger extended) or cupped hand.',
      'Tap index finger lightly against the side of the lower lip twice.',
      'Alternatively in ISL: Cupped hand brought toward mouth simulating pouring drink.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Food & Beverages Lexicon',
    svgVisualType: 'water',
    imageSrc: '/images/signs/drink.jpg',
  },
  {
    id: 'sign-more',
    phrase: 'More',
    category: 'Food and Drinks',
    meaning: 'Asking for additional quantity, repetition, or seconds.',
    context: 'Dining table, classroom instructions, requests.',
    instructions: [
      'Bring fingertips together into tapered clusters on both hands.',
      'Tap the fingertips of both hands together at center repeatedly.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Common Requests',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/more.jpg',
  },

  // Travel & Questions
  {
    id: 'sign-where',
    phrase: 'Where is...?',
    category: 'Travel',
    meaning: 'Inquiring about locations, routes, or destinations.',
    context: 'Train stations, airports, street navigation, finding restrooms.',
    instructions: [
      'Hold dominant index finger upright at shoulder level.',
      'Wag gently from side to side with a questioning facial expression, or hold both open palms facing upward moving gently side-to-side.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Question Markers',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/where.jpg',
  },
  {
    id: 'sign-how',
    phrase: 'How',
    category: 'Travel',
    meaning: 'Inquiring about method, process, or condition.',
    context: 'Asking for instructions, travel routes, or procedures.',
    instructions: [
      'Hold curved hands together with backs of fingers/knuckles touching.',
      'Roll hands smoothly outward until palms are facing upward.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Question Lexicon',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/how.jpg',
  },
  {
    id: 'sign-what',
    phrase: 'What',
    category: 'Travel',
    meaning: 'Inquiring about objects, events, or clarification.',
    context: 'Conversational questioning, asking for repetition.',
    instructions: [
      'Hold both hands forward at waist height with palms facing upward.',
      'Shake hands gently side-to-side with questioning eyebrows.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Question Lexicon',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/what.jpg',
  },
  {
    id: 'sign-when',
    phrase: 'When',
    category: 'Travel',
    meaning: 'Inquiring about time, schedule, or appointment hour.',
    context: 'Train arrival, doctor appointments, class timing.',
    instructions: [
      'Hold non-dominant index finger vertically like a clock marker.',
      'Circle dominant index finger around it and touch the tip.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Time Markers',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/when.jpg',
  },
  {
    id: 'sign-bathroom',
    phrase: 'Bathroom / Restroom',
    category: 'Travel',
    meaning: 'Inquiring for or indicating restroom facilities.',
    context: 'Public transit, malls, airports, offices.',
    instructions: [
      'Form a fist with dominant hand, tucking thumb between index and middle fingers (letter "T").',
      'Shake the hand gently side-to-side.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Public Facilities',
    svgVisualType: 'hand_wave',
    imageSrc: '/images/signs/bathroom.jpg',
  },
  {
    id: 'sign-bus',
    phrase: 'Bus / Public Transit',
    category: 'Travel',
    meaning: 'Public bus, metro, or transit system.',
    context: 'Bus stops, ticketing booths, commuting.',
    instructions: [
      'Hold both hands forward as if gripping a large steering wheel.',
      'Rotate gently side-to-side simulating driving a bus, or mimic pulling a stop cord.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Transportation Lexicon',
    svgVisualType: 'stop',
  },

  // Common Responses
  {
    id: 'sign-yes',
    phrase: 'Yes / Agreed',
    category: 'Common Responses',
    meaning: 'Affirmative response, agreeing, or confirming.',
    context: 'Answering questions, acknowledging understanding, confirming orders.',
    instructions: [
      'Form a fist with dominant hand at chest height.',
      'Bend the wrist up and down repeatedly like a head nodding "yes".',
      'Nod head affirmatively in sync.'
    ],
    isISLVerified: true,
    referenceSource: 'Universal Sign Language & ISLRTC',
    svgVisualType: 'yes',
    imageSrc: '/images/signs/yes.jpg',
  },
  {
    id: 'sign-no',
    phrase: 'No / Disagree',
    category: 'Common Responses',
    meaning: 'Negative response, refusal, or correction.',
    context: 'Declining offers, correcting misunderstandings, setting boundaries.',
    instructions: [
      'Extend index and middle finger with thumb open.',
      'Snap index and middle fingers together down onto the thumb firmly, resembling a mouth closing "no".',
      'Shake head gently side to side.'
    ],
    isISLVerified: true,
    referenceSource: 'ISLRTC Basic Expressions',
    svgVisualType: 'no',
    imageSrc: '/images/signs/no.jpg',
  },
  {
    id: 'sign-slow',
    phrase: 'Please Speak Slowly',
    category: 'Common Responses',
    meaning: 'Requesting a hearing speaker to reduce their pace or articulate clearly.',
    context: 'Classrooms, rapid conversations, public counters.',
    instructions: [
      'Hold non-dominant arm forward, palm facing down.',
      'Draw the fingertips of dominant hand gently and slowly up the forearm from wrist toward elbow.',
      'Calm, steady facial expression.'
    ],
    isISLVerified: true,
    referenceSource: 'Accessibility & Deaf Awareness Guidelines',
    svgVisualType: 'slow',
  },
];
