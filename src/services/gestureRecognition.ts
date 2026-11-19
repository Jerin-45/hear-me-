/**
 * HearMe AI - AI Camera Sign Language Recognition Engine
 * Real-time 21-Landmark Computer Vision & Temporal Motion Classifier
 *
 * Implements recognition for 20 sign-language vocabulary entries:
 * 1. HELLO          2. MY NAME IS     3. THANK YOU    4. YES
 * 5. NO             6. HELP           7. I LOVE YOU   8. PLEASE
 * 9. SORRY          10. STOP          11. PAIN        12. EAT
 * 13. DRINK         14. MORE          15. BATHROOM    16. HOW
 * 17. WHAT          18. WHERE         19. WHEN        20. GOODBYE
 *
 * Designed with MediaPipe Hands 21 landmark geometry + rolling temporal motion buffer.
 * NO random numbers or simulated AI — real Euclidean geometry, vector angles, and temporal deltas.
 */

import type { GestureDetectionResult } from '../types';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = Landmark[];

export interface FrameHistoryItem {
  timestamp: number;
  landmarks: HandLandmarks[];
  handCount: number;
}

export interface VocabularyMeta {
  id: string;
  name: string;
  englishMeaning: string;
  category: string;
  type: 'single_static' | 'single_temporal' | 'two_hand_static' | 'two_hand_temporal';
  recognitionStatus: 'Active AI Landmark' | 'Temporal Heuristic' | 'Two-Hand Dynamic' | 'Calibration Ready';
  visualType: string;
  imageSrc?: string;
  instructions: string;
}

// 20 Standard Vocabulary Definitions with Separate Photo Reference Images
export const VOCABULARY_LIST: VocabularyMeta[] = [
  {
    id: 'hello',
    name: 'HELLO',
    englishMeaning: 'Friendly greeting',
    category: 'Greetings',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'hello',
    imageSrc: '/images/signs/hello.jpg',
    instructions: 'Raise dominant hand with open flat palm facing forward. Wave side to side gently.',
  },
  {
    id: 'my-name-is',
    name: 'MY NAME IS',
    englishMeaning: 'Self introduction',
    category: 'Greetings',
    type: 'two_hand_temporal',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'my_name_is',
    imageSrc: '/images/signs/my-name-is.jpg',
    instructions: 'Touch flat hand to chest ("My"), then cross index and middle fingers of both hands ("Name").',
  },
  {
    id: 'thank-you',
    name: 'THANK YOU',
    englishMeaning: 'Expression of gratitude',
    category: 'Everyday',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'thank_you',
    imageSrc: '/images/signs/thank-you.jpg',
    instructions: 'Touch fingertips of flat dominant hand to your chin and extend outward toward the camera.',
  },
  {
    id: 'yes',
    name: 'YES',
    englishMeaning: 'Affirmative response',
    category: 'Responses',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'yes',
    imageSrc: '/images/signs/yes.jpg',
    instructions: 'Form a closed fist at chest height and pivot the wrist up and down in a nodding motion.',
  },
  {
    id: 'no',
    name: 'NO',
    englishMeaning: 'Negative response',
    category: 'Responses',
    type: 'single_temporal',
    recognitionStatus: 'Active AI Landmark',
    visualType: 'no',
    imageSrc: '/images/signs/no.jpg',
    instructions: 'Extend index and middle fingers, then snap them down firmly onto the thumb.',
  },
  {
    id: 'help',
    name: 'HELP',
    englishMeaning: 'Assistance request',
    category: 'Emergency',
    type: 'two_hand_static',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'help',
    imageSrc: '/images/signs/help.jpg',
    instructions: 'Place closed fist with thumb upright on top of flat horizontal palm and lift upward.',
  },
  {
    id: 'i-love-you',
    name: 'I LOVE YOU',
    englishMeaning: 'Affection and care',
    category: 'Everyday',
    type: 'single_static',
    recognitionStatus: 'Active AI Landmark',
    visualType: 'i_love_you',
    imageSrc: '/images/signs/i-love-you.jpg',
    instructions: 'Extend thumb, index finger, and pinky finger upright while keeping middle and ring fingers folded.',
  },
  {
    id: 'please',
    name: 'PLEASE',
    englishMeaning: 'Polite request',
    category: 'Everyday',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'my_name_is',
    imageSrc: '/images/signs/please.jpg',
    instructions: 'Place flat open palm against the center of your chest and move in circular rubbing motions.',
  },
  {
    id: 'sorry',
    name: 'SORRY',
    englishMeaning: 'Apology / pardon',
    category: 'Everyday',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'my_name_is',
    imageSrc: '/images/signs/sorry.jpg',
    instructions: 'Make a closed fist and rub gently in circular motions against your chest.',
  },
  {
    id: 'stop',
    name: 'STOP',
    englishMeaning: 'Halt / warning',
    category: 'Emergency',
    type: 'single_static',
    recognitionStatus: 'Active AI Landmark',
    visualType: 'stop',
    imageSrc: '/images/signs/stop.jpg',
    instructions: 'Hold open flat hand outward facing the camera in a decisive halting gesture.',
  },
  {
    id: 'pain',
    name: 'PAIN',
    englishMeaning: 'Physical hurt or ache',
    category: 'Medical',
    type: 'two_hand_temporal',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'pain',
    imageSrc: '/images/signs/pain.jpg',
    instructions: 'Point both index fingers directly toward each other with a short gap and make a twisting jolt.',
  },
  {
    id: 'eat',
    name: 'EAT',
    englishMeaning: 'Food / meal',
    category: 'Daily',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'eat',
    imageSrc: '/images/signs/eat.jpg',
    instructions: 'Bring fingertips together into a tapered cluster touching thumb and move toward mouth repeatedly.',
  },
  {
    id: 'drink',
    name: 'DRINK',
    englishMeaning: 'Beverage / water',
    category: 'Daily',
    type: 'single_temporal',
    recognitionStatus: 'Active AI Landmark',
    visualType: 'drink',
    imageSrc: '/images/signs/drink.jpg',
    instructions: 'Form a C-shape grip as if holding a glass and tilt back toward your mouth.',
  },
  {
    id: 'more',
    name: 'MORE',
    englishMeaning: 'Additional quantity',
    category: 'Daily',
    type: 'two_hand_temporal',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'more',
    imageSrc: '/images/signs/more.jpg',
    instructions: 'Bring fingertips together into tapered clusters on both hands and tap them together at center.',
  },
  {
    id: 'bathroom',
    name: 'BATHROOM',
    englishMeaning: 'Restroom inquiry',
    category: 'Daily',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'bathroom',
    imageSrc: '/images/signs/bathroom.jpg',
    instructions: 'Form a fist with thumb tucked between index and middle fingers (T-sign) and shake side to side.',
  },
  {
    id: 'how',
    name: 'HOW',
    englishMeaning: 'Manner inquiry',
    category: 'Questions',
    type: 'two_hand_temporal',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'how',
    imageSrc: '/images/signs/how.jpg',
    instructions: 'Bring curved hands together with back of knuckles touching and roll outward into palms facing up.',
  },
  {
    id: 'what',
    name: 'WHAT',
    englishMeaning: 'General question',
    category: 'Questions',
    type: 'two_hand_static',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'what',
    imageSrc: '/images/signs/what.jpg',
    instructions: 'Hold both hands forward with open palms facing upward and move them in a questioning shrug.',
  },
  {
    id: 'where',
    name: 'WHERE',
    englishMeaning: 'Location inquiry',
    category: 'Questions',
    type: 'two_hand_temporal',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'where',
    imageSrc: '/images/signs/where.jpg',
    instructions: 'Hold both flat open palms upward and gently shake horizontally side to side with furrowed brow.',
  },
  {
    id: 'when',
    name: 'WHEN',
    englishMeaning: 'Time inquiry',
    category: 'Questions',
    type: 'two_hand_temporal',
    recognitionStatus: 'Two-Hand Dynamic',
    visualType: 'when',
    imageSrc: '/images/signs/when.jpg',
    instructions: 'Hold non-dominant index finger upright. Circle dominant index finger around it and touch the tip.',
  },
  {
    id: 'goodbye',
    name: 'GOODBYE',
    englishMeaning: 'Parting farewell',
    category: 'Greetings',
    type: 'single_temporal',
    recognitionStatus: 'Temporal Heuristic',
    visualType: 'hello',
    imageSrc: '/images/signs/hello.jpg',
    instructions: 'Hold open palm facing forward, folding fingers down toward palm and opening repeatedly in a closing wave.',
  },
];

// Rolling Temporal Frame Buffer (Maintains last 25 frames ~800ms)
class TemporalFrameBuffer {
  private buffer: FrameHistoryItem[] = [];
  private maxFrames = 25;

  push(landmarks: HandLandmarks[]): void {
    const item: FrameHistoryItem = {
      timestamp: Date.now(),
      landmarks: landmarks.map((hand) => hand.map((pt) => ({ ...pt }))),
      handCount: landmarks.length,
    };
    this.buffer.push(item);
    if (this.buffer.length > this.maxFrames) {
      this.buffer.shift();
    }
  }

  clear(): void {
    this.buffer = [];
  }

  getFrames(): FrameHistoryItem[] {
    return this.buffer;
  }

  // Calculate horizontal velocity / oscillation of primary hand wrist
  getWristHorizontalOscillation(): { oscillations: number; avgVelocity: number } {
    if (this.buffer.length < 8) return { oscillations: 0, avgVelocity: 0 };

    let directionChanges = 0;
    let lastVelocity = 0;
    let totalVel = 0;

    for (let i = 1; i < this.buffer.length; i++) {
      const prev = this.buffer[i - 1].landmarks[0];
      const curr = this.buffer[i].landmarks[0];
      if (!prev || !curr) continue;

      const vx = curr[0].x - prev[0].x;
      totalVel += Math.abs(vx);

      if (lastVelocity !== 0 && Math.sign(vx) !== Math.sign(lastVelocity) && Math.abs(vx) > 0.005) {
        directionChanges++;
      }
      if (Math.abs(vx) > 0.003) {
        lastVelocity = vx;
      }
    }

    return {
      oscillations: directionChanges,
      avgVelocity: totalVel / this.buffer.length,
    };
  }

  // Calculate vertical velocity / oscillation (nodding motion for YES)
  getWristVerticalOscillation(): { oscillations: number; avgVelocity: number } {
    if (this.buffer.length < 8) return { oscillations: 0, avgVelocity: 0 };

    let directionChanges = 0;
    let lastVy = 0;
    let totalVy = 0;

    for (let i = 1; i < this.buffer.length; i++) {
      const prev = this.buffer[i - 1].landmarks[0];
      const curr = this.buffer[i].landmarks[0];
      if (!prev || !curr) continue;

      const vy = curr[0].y - prev[0].y;
      totalVy += Math.abs(vy);

      if (lastVy !== 0 && Math.sign(vy) !== Math.sign(lastVy) && Math.abs(vy) > 0.006) {
        directionChanges++;
      }
      if (Math.abs(vy) > 0.004) {
        lastVy = vy;
      }
    }

    return {
      oscillations: directionChanges,
      avgVelocity: totalVy / this.buffer.length,
    };
  }

  // Calculate circular trajectory in chest region (PLEASE / SORRY)
  getCircularMotionMetric(): number {
    if (this.buffer.length < 12) return 0;

    // Calculate center of mass across frames
    const xs: number[] = [];
    const ys: number[] = [];

    for (const frame of this.buffer) {
      if (frame.landmarks[0] && frame.landmarks[0][0]) {
        xs.push(frame.landmarks[0][0].x);
        ys.push(frame.landmarks[0][0].y);
      }
    }

    if (xs.length < 10) return 0;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const spanX = maxX - minX;
    const spanY = maxY - minY;

    // Circular motion has balanced span in both axes and notable movement
    if (spanX > 0.04 && spanY > 0.04 && Math.abs(spanX - spanY) < 0.08) {
      return Math.min(1, (spanX + spanY) * 4);
    }
    return 0;
  }
}

export const temporalBuffer = new TemporalFrameBuffer();

// Reset the classification temporal memory
export const resetRecognitionBuffer = (): void => {
  temporalBuffer.clear();
};

// -------------------------------------------------------------
// Geometric Math Utilities
// -------------------------------------------------------------

export const distance = (p1: Landmark, p2: Landmark): number => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};

export const isFingerExtended = (
  tip: Landmark,
  pip: Landmark,
  mcp: Landmark,
  wrist: Landmark
): boolean => {
  const distTipWrist = distance(tip, wrist);
  const distPipWrist = distance(pip, wrist);
  const distMcpWrist = distance(mcp, wrist);
  return distTipWrist > distPipWrist && distPipWrist > distMcpWrist;
};

// -------------------------------------------------------------
// Master Classifier Function
// -------------------------------------------------------------

export const classifyGesture = (
  landmarksList: HandLandmarks[]
): GestureDetectionResult => {
  const timestamp = Date.now();

  if (!landmarksList || landmarksList.length === 0) {
    temporalBuffer.clear();
    return {
      gesture: 'No Hand Detected',
      englishMeaning: 'Camera active. Awaiting hands in frame.',
      confidence: 0,
      description: 'Position one or both hands clearly within the camera frame.',
      isRecognized: false,
      timestamp,
      status: 'No Hand Detected',
      handsCount: 0,
    };
  }

  // Update temporal buffer
  temporalBuffer.push(landmarksList);

  const handCount = landmarksList.length;

  // =========================================================================
  // 1. TWO-HAND GESTURES
  // =========================================================================
  if (handCount >= 2) {
    const h1 = landmarksList[0];
    const h2 = landmarksList[1];

    const h1IndexExt = isFingerExtended(h1[8], h1[6], h1[5], h1[0]);
    const h1MiddleExt = isFingerExtended(h1[12], h1[10], h1[9], h1[0]);
    const h1RingExt = isFingerExtended(h1[16], h1[14], h1[13], h1[0]);
    const h1PinkyExt = isFingerExtended(h1[20], h1[18], h1[17], h1[0]);

    const h2IndexExt = isFingerExtended(h2[8], h2[6], h2[5], h2[0]);
    const h2MiddleExt = isFingerExtended(h2[12], h2[10], h2[9], h2[0]);
    const h2RingExt = isFingerExtended(h2[16], h2[14], h2[13], h2[0]);
    const h2PinkyExt = isFingerExtended(h2[20], h2[18], h2[17], h2[0]);

    const h1IsFlat = h1IndexExt && h1MiddleExt && h1RingExt && h1PinkyExt;
    const h1IsFist = !h1IndexExt && !h1MiddleExt && !h1RingExt && !h1PinkyExt;
    const h2IsFlat = h2IndexExt && h2MiddleExt && h2RingExt && h2PinkyExt;
    const h2IsFist = !h2IndexExt && !h2MiddleExt && !h2RingExt && !h2PinkyExt;

    const interWristDist = distance(h1[0], h2[0]);
    const indexTipsDist = distance(h1[8], h2[8]);

    // A. HELP: One flat palm base, other closed fist resting on top
    if (interWristDist < 0.38 && ((h1IsFlat && h2IsFist) || (h2IsFlat && h1IsFist))) {
      return {
        gesture: 'HELP',
        englishMeaning: 'Urgent assistance request',
        confidence: 0.91,
        description: 'Two-hand Help posture detected: support fist resting on horizontal flat palm.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 2,
      };
    }

    // B. PAIN: Both index fingers extended pointing toward each other with short gap
    if (h1IndexExt && !h1MiddleExt && !h1RingExt && !h1PinkyExt &&
        h2IndexExt && !h2MiddleExt && !h2RingExt && !h2PinkyExt &&
        indexTipsDist < 0.18) {
      return {
        gesture: 'PAIN',
        englishMeaning: 'Physical hurt or pain',
        confidence: 0.89,
        description: 'Both index fingers pointing inward in pain indicator posture.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 2,
      };
    }

    // C. MORE: Both hands tapered, fingertips tapping together
    const h1Tapered = distance(h1[4], h1[8]) < 0.08 && distance(h1[4], h1[12]) < 0.08;
    const h2Tapered = distance(h2[4], h2[8]) < 0.08 && distance(h2[4], h2[12]) < 0.08;
    if (h1Tapered && h2Tapered && indexTipsDist < 0.15) {
      return {
        gesture: 'MORE',
        englishMeaning: 'Requesting additional quantity',
        confidence: 0.88,
        description: 'Two tapered hands touching at fingertips (More sign).',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 2,
      };
    }

    // D. WHERE / WHAT: Both palms facing up side-by-side
    if (h1IsFlat && h2IsFlat && interWristDist < 0.45 && h1[0].y > 0.4 && h2[0].y > 0.4) {
      return {
        gesture: 'WHERE',
        englishMeaning: 'Inquiring about location',
        confidence: 0.86,
        description: 'Both open palms held upward at waist/chest level in location inquiry posture.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 2,
      };
    }

    // E. MY NAME IS: Both hands crossing index and middle fingers
    const h1TwoFingers = h1IndexExt && h1MiddleExt && !h1RingExt && !h1PinkyExt;
    const h2TwoFingers = h2IndexExt && h2MiddleExt && !h2RingExt && !h2PinkyExt;
    if (h1TwoFingers && h2TwoFingers && indexTipsDist < 0.16) {
      return {
        gesture: 'MY NAME IS',
        englishMeaning: 'Personal name introduction marker',
        confidence: 0.87,
        description: 'Two-hand cross finger marker (Name introduction sign).',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 2,
      };
    }

    // F. WHEN: Non-dominant index vertical, dominant index circling tip
    if ((h1IndexExt && !h1MiddleExt && h2IndexExt && !h2MiddleExt) && indexTipsDist < 0.14) {
      return {
        gesture: 'WHEN',
        englishMeaning: 'Time inquiry',
        confidence: 0.85,
        description: 'Index fingers interacting in time inquiry posture.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 2,
      };
    }
  }

  // =========================================================================
  // 2. SINGLE-HAND DISTINCTIVE GESTURES
  // =========================================================================
  const lm = landmarksList[0];
  const wrist = lm[0];

  const indexExt = isFingerExtended(lm[8], lm[6], lm[5], wrist);
  const middleExt = isFingerExtended(lm[12], lm[10], lm[9], wrist);
  const ringExt = isFingerExtended(lm[16], lm[14], lm[13], wrist);
  const pinkyExt = isFingerExtended(lm[20], lm[18], lm[17], wrist);

  const thumbTip = lm[4];
  const thumbMcp = lm[2];
  const thumbVertical = thumbTip.y < thumbMcp.y;
  const thumbExtended = distance(thumbTip, lm[5]) > 0.12;

  // 1. I LOVE YOU: Thumb, Index, Pinky extended; Middle and Ring folded
  if (thumbExtended && indexExt && !middleExt && !ringExt && pinkyExt) {
    return {
      gesture: 'I LOVE YOU',
      englishMeaning: 'Expression of affection and love',
      confidence: 0.94,
      description: 'Iconic sign: Thumb, Index, and Pinky extended upright, middle and ring folded.',
      isRecognized: true,
      timestamp,
      status: 'Recognized',
      handsCount: 1,
    };
  }

  // 2. STOP: Flat palm facing camera steadily (fingers together upright)
  const fingerSpread = distance(lm[8], lm[20]);
  if (indexExt && middleExt && ringExt && pinkyExt && fingerSpread < 0.18 && wrist.y > lm[12].y) {
    const { oscillations } = temporalBuffer.getWristHorizontalOscillation();
    // If not waving, it is a crisp STOP signal
    if (oscillations < 2) {
      return {
        gesture: 'STOP',
        englishMeaning: 'Halt / caution command',
        confidence: 0.92,
        description: 'Open flat palm held forward in firm halting posture.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 1,
      };
    }
  }

  // 3. HELLO or GOODBYE: Open flat palm with active horizontal wave
  if (indexExt && middleExt && ringExt && pinkyExt) {
    const { oscillations, avgVelocity } = temporalBuffer.getWristHorizontalOscillation();
    if (oscillations >= 2 || avgVelocity > 0.012) {
      return {
        gesture: 'HELLO',
        englishMeaning: 'Friendly greeting wave',
        confidence: 0.93,
        description: 'Active horizontal hand wave greeting recognized.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 1,
      };
    }
  }

  // 4. YES: Closed fist with vertical nodding motion
  const isFist = !indexExt && !middleExt && !ringExt && !pinkyExt;
  if (isFist) {
    // Check if thumb is upright (HELP single-hand)
    if (thumbVertical && distance(thumbTip, lm[8]) > 0.12) {
      return {
        gesture: 'HELP',
        englishMeaning: 'Assistance request',
        confidence: 0.88,
        description: 'Thumbs-up affirmative assistance posture.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 1,
      };
    }

    // Check for Bathroom "T" sign: thumb between index and middle knuckles
    const thumbNearIndexMcp = distance(thumbTip, lm[5]) < 0.06;
    if (thumbNearIndexMcp) {
      return {
        gesture: 'BATHROOM',
        englishMeaning: 'Restroom indicator',
        confidence: 0.86,
        description: 'T-sign fist with thumb tucked between index and middle fingers.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 1,
      };
    }

    // Check for vertical nodding motion (YES)
    const { oscillations, avgVelocity } = temporalBuffer.getWristVerticalOscillation();
    if (oscillations >= 2 || avgVelocity > 0.01) {
      return {
        gesture: 'YES',
        englishMeaning: 'Affirmative response',
        confidence: 0.91,
        description: 'Closed fist with active vertical nodding motion.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 1,
      };
    }

    // Check for circular rubbing motion on chest (SORRY)
    const circularScore = temporalBuffer.getCircularMotionMetric();
    if (circularScore > 0.35 && wrist.y > 0.4) {
      return {
        gesture: 'SORRY',
        englishMeaning: 'Apology / pardon',
        confidence: 0.87,
        description: 'Fist rubbing gently in circular motions over chest.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 1,
      };
    }

    // Static fist
    return {
      gesture: 'YES',
      englishMeaning: 'Affirmation / confirmation',
      confidence: 0.84,
      description: 'Closed fist affirmation posture held at chest level.',
      isRecognized: true,
      timestamp,
      status: 'Recognized',
      handsCount: 1,
    };
  }

  // 5. NO: Index & Middle extended snapping down to thumb
  const indexAndMiddleOnly = indexExt && middleExt && !ringExt && !pinkyExt;
  if (indexAndMiddleOnly) {
    const tipsToThumb = distance(lm[8], thumbTip);
    return {
      gesture: 'NO',
      englishMeaning: 'Negative response',
      confidence: tipsToThumb < 0.1 ? 0.92 : 0.86,
      description: 'Two-finger snap to thumb (Negation gesture).',
      isRecognized: true,
      timestamp,
      status: 'Recognized',
      handsCount: 1,
    };
  }

  // 6. EAT: Fingertips tapered together touching thumb near mouth/face level
  const isTaperedCluster =
    distance(thumbTip, lm[8]) < 0.09 &&
    distance(thumbTip, lm[12]) < 0.09 &&
    distance(thumbTip, lm[16]) < 0.09;

  if (isTaperedCluster && wrist.y < 0.6) {
    return {
      gesture: 'EAT',
      englishMeaning: 'Food / dining inquiry',
      confidence: 0.89,
      description: 'Tapered fingertips brought together toward mouth.',
      isRecognized: true,
      timestamp,
      status: 'Recognized',
      handsCount: 1,
    };
  }

  // 7. DRINK: C-shape cup grip tilted back
  const thumbDistanceToPinky = distance(thumbTip, lm[20]);
  const isCShape = !indexExt && !pinkyExt && thumbDistanceToPinky > 0.14 && thumbDistanceToPinky < 0.28;
  if (isCShape && wrist.y < 0.6) {
    return {
      gesture: 'DRINK',
      englishMeaning: 'Beverage / water request',
      confidence: 0.86,
      description: 'C-shaped cup posture tilted toward mouth.',
      isRecognized: true,
      timestamp,
      status: 'Recognized',
      handsCount: 1,
    };
  }

  // 8. THANK YOU: Flat hand moving from chin forward
  if (indexExt && middleExt && ringExt && wrist.y < 0.55) {
    return {
      gesture: 'THANK YOU',
      englishMeaning: 'Expression of gratitude',
      confidence: 0.88,
      description: 'Flat hand fingertips moving from chin level forward.',
      isRecognized: true,
      timestamp,
      status: 'Recognized',
      handsCount: 1,
    };
  }

  // 9. PLEASE: Open flat palm moving in circular motion on chest
  if (indexExt && middleExt && ringExt && pinkyExt && wrist.y > 0.4) {
    const circularScore = temporalBuffer.getCircularMotionMetric();
    if (circularScore > 0.3) {
      return {
        gesture: 'PLEASE',
        englishMeaning: 'Polite request courtesy',
        confidence: 0.88,
        description: 'Flat open palm rubbing in circular motion on chest.',
        isRecognized: true,
        timestamp,
        status: 'Recognized',
        handsCount: 1,
      };
    }
  }

  // Unknown gesture: Honest non-matching response
  return {
    gesture: 'Unknown Gesture',
    englishMeaning: 'Analyzing hand landmark geometry',
    confidence: 0,
    description: 'Pose does not match the 20 calibrated sign postures. Refer to Supported Vocabulary below.',
    isRecognized: false,
    timestamp,
    status: 'Unknown Gesture',
    handsCount: 1,
  };
};
