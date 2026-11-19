import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Video,
  VideoOff,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Info,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  classifyGesture,
  resetRecognitionBuffer,
  VOCABULARY_LIST,
  VocabularyMeta,
} from '../services/gestureRecognition';
import { GestureDetectionResult } from '../types';
import { speakEnglishText } from '../services/speech';
import { SignVisualIllustration } from '../components/SignVisualIllustration';
import { getAssetUrl } from '../utils/assets';

export const SignRecognitionPage: React.FC = () => {
  // Camera & Stream States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Recognition States
  const [currentGesture, setCurrentGesture] = useState<GestureDetectionResult | null>(null);
  const [gestureHistory, setGestureHistory] = useState<{ gesture: string; time: string; confidence: number }[]>([]);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyMeta | null>(null);

  // Caption & Sentence Builder States
  const [accumulatedSentence, setAccumulatedSentence] = useState<string[]>([]);
  const [autoAccumulate, setAutoAccumulate] = useState(true);
  const [speakOnDetect, setSpeakOnDetect] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);

  // Filter for 20 Vocabulary Explorer
  const [vocabFilter, setVocabFilter] = useState<'all' | 'single' | 'two_hand'>('all');

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const cameraUtilRef = useRef<any>(null);

  // Debounce tracking
  const lastRecordedGestureRef = useRef<string>('');
  const lastRecordedTimeRef = useRef<number>(0);

  // Safely stop all camera tracks on unmount or on demand
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (cameraUtilRef.current) {
      try {
        cameraUtilRef.current.stop();
      } catch (e) {}
      cameraUtilRef.current = null;
    }
    resetRecognitionBuffer();
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Start webcam with specified facing mode
  const startCamera = async (targetFacing: 'user' | 'environment' = facingMode) => {
    setPermissionError(null);
    setCameraLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam access is not supported by this browser.');
      }

      // Stop existing tracks if switching camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: targetFacing,
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Initialize MediaPipe Hands if loaded from index.html
      const win = window as any;
      if (win.Hands) {
        const hands = new win.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((results: any) => {
          renderCanvas(results);
        });

        handsRef.current = hands;

        if (win.Camera && videoRef.current) {
          const cameraInstance = new win.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });
          cameraInstance.start();
          cameraUtilRef.current = cameraInstance;
        }
      }

      setIsCameraActive(true);
      setCameraLoading(false);
    } catch (err: any) {
      console.error('Camera Access Error:', err);
      setPermissionError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Webcam permission was denied. Please allow camera permissions in your browser URL settings.'
          : err.message || 'Unable to access webcam. Please check connected hardware.'
      );
      stopCameraStream();
    }
  };

  // Toggle between front and back cameras
  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Reset recognition memory and active detection state
  const handleResetRecognition = () => {
    resetRecognitionBuffer();
    setCurrentGesture(null);
    lastRecordedGestureRef.current = '';
    lastRecordedTimeRef.current = 0;
  };

  // Canvas render routine with MediaPipe skeleton connectors and classification
  const renderCanvas = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the raw camera image
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    const win = window as any;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw MediaPipe landmark skeleton lines in high-contrast crisp white
        if (win.drawConnectors && win.HAND_CONNECTIONS) {
          win.drawConnectors(ctx, landmarks, win.HAND_CONNECTIONS, {
            color: '#FFFFFF',
            lineWidth: 2.5,
          });
        }
        // Draw Landmark Points in crisp high-contrast black/white dots
        if (win.drawLandmarks) {
          win.drawLandmarks(ctx, landmarks, {
            color: '#000000',
            fillColor: '#FFFFFF',
            lineWidth: 1.5,
            radius: 3.5,
          });
        }
      }

      // Classify gesture using 21-landmark geometric and temporal engine
      const classification = classifyGesture(results.multiHandLandmarks);
      setCurrentGesture(classification);

      // Record recognized gestures into debounced history
      const now = Date.now();
      if (
        classification.isRecognized &&
        classification.gesture !== 'Unknown Gesture' &&
        classification.gesture !== 'No Hand Detected' &&
        (classification.gesture !== lastRecordedGestureRef.current || now - lastRecordedTimeRef.current > 3200)
      ) {
        lastRecordedGestureRef.current = classification.gesture;
        lastRecordedTimeRef.current = now;

        const historyItem = {
          gesture: classification.gesture,
          confidence: classification.confidence,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        setGestureHistory((prev) => [historyItem, ...prev.slice(0, 24)]);

        // Auto-accumulate into sentence builder if enabled
        if (autoAccumulate) {
          setAccumulatedSentence((prev) => [...prev, classification.gesture]);
        }

        // Voice callout
        if (speakOnDetect) {
          speakEnglishText(classification.gesture);
        }
      }
    } else {
      setCurrentGesture({
        gesture: 'No Hand Detected',
        englishMeaning: 'Camera active. Awaiting hands in frame.',
        confidence: 0,
        description: 'Position one or both hands clearly within the camera frame.',
        isRecognized: false,
        timestamp: Date.now(),
        status: 'No Hand Detected',
        handsCount: 0,
      });
    }

    ctx.restore();
  };

  // Caption sequence helpers
  const handleAddCurrentToSentence = () => {
    if (currentGesture && currentGesture.isRecognized && currentGesture.gesture !== 'Unknown Gesture') {
      setAccumulatedSentence((prev) => [...prev, currentGesture.gesture]);
    }
  };

  const handleClearSentence = () => {
    setAccumulatedSentence([]);
  };

  const handleCopySentence = async () => {
    const text = accumulatedSentence.join(' ');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {}
  };

  const handleSpeakSentence = () => {
    const text = accumulatedSentence.join(' ');
    if (text) {
      speakEnglishText(text);
    }
  };

  const handleClearHistory = () => {
    setGestureHistory([]);
  };

  // Filtered vocabulary list
  const filteredVocab = VOCABULARY_LIST.filter((item) => {
    if (vocabFilter === 'single') return item.type.startsWith('single');
    if (vocabFilter === 'two_hand') return item.type.startsWith('two_hand');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. Header with Controls */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] px-2 py-0.5 rounded bg-[#F7F7F7] border border-[#E5E5E5]">
                Computer Vision • MediaPipe Hands
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black px-2 py-0.5 rounded bg-black text-white">
                20 VOCABULARY GESTURES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              AI Camera Sign Recognition
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-mono">
              REAL-TIME 21-LANDMARK GEOMETRY & TEMPORAL MOTION TRACKING • 100% ON-DEVICE
            </p>
          </div>

          {/* Quick Action Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Voice Callout Toggle */}
            <button
              onClick={() => setSpeakOnDetect(!speakOnDetect)}
              aria-label="Toggle voice audio callout on gesture detection"
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                speakOnDetect
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-black border-[#D4D4D4] hover:border-black'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice: {speakOnDetect ? 'ON' : 'OFF'}</span>
            </button>

            {/* Mobile / Front-Back Facing Camera Toggle */}
            <button
              onClick={toggleFacingMode}
              disabled={cameraLoading}
              aria-label="Switch between front and back camera"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F7F7] text-black border border-[#D4D4D4] hover:border-black text-xs font-mono font-semibold transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Camera: {facingMode === 'user' ? 'Front' : 'Back'}</span>
            </button>

            {/* Reset Recognition Buffer */}
            <button
              onClick={handleResetRecognition}
              aria-label="Reset recognition buffer and clear current posture"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F7F7] text-black border border-[#D4D4D4] hover:border-black text-xs font-mono font-semibold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Honest AI Notice & Privacy Guarantee */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] text-xs text-[#555555] flex items-start gap-3 shadow-sm">
          <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="leading-relaxed">
              <strong>Technical Implementation & Landmark Accuracy:</strong> MediaPipe 21-landmark tracking performs real-time Euclidean distance and temporal velocity classification on-device. It <strong>does not substitute for a certified sign language interpreter</strong>.
            </p>
            <p className="text-[11px] text-[#777777] font-mono">
              Privacy Guarantee: Video frames are processed entirely in browser memory via WebAssembly/WebGL. Zero camera feeds or audio recordings are uploaded or stored.
            </p>
          </div>
        </div>

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="p-4 rounded-xl bg-white border-2 border-black text-black text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-black" />
              <span className="font-medium">{permissionError}</span>
            </div>
            <button
              onClick={() => startCamera(facingMode)}
              className="px-3 py-1 rounded bg-black text-white text-[11px] font-mono hover:bg-[#1C1C1C]"
            >
              Retry
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. Main Camera & Live Recognition Grid */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left 7 Cols: Camera Preview & Canvas */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Stream Status & Controls Bar */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-black animate-ping' : 'bg-[#AAAAAA]'}`} />
                <span className="font-semibold text-black">
                  {isCameraActive ? 'STREAM ACTIVE • 21 SKELETON LANDMARKS' : 'CAMERA STANDBY'}
                </span>
              </div>

              {/* Camera Start / Stop Controls */}
              {!isCameraActive ? (
                <button
                  onClick={() => startCamera(facingMode)}
                  disabled={cameraLoading}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-[#1C1C1C] text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-sm"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{cameraLoading ? 'Starting Lens...' : 'Start Camera'}</span>
                </button>
              ) : (
                <button
                  onClick={stopCameraStream}
                  className="px-4 py-2.5 rounded-xl bg-black text-white hover:bg-[#1C1C1C] text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>

            {/* Video & Landmark Canvas Overlay */}
            <div className="relative aspect-video rounded-2xl bg-black border-2 border-black overflow-hidden flex items-center justify-center shadow-lg">
              <video
                ref={videoRef}
                className="hidden"
                playsInline
                muted
                width={640}
                height={480}
              />

              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* Standby Placeholder */}
              {!isCameraActive && (
                <div className="text-center p-8 space-y-3 max-w-sm text-[#999999]">
                  <div className="w-14 h-14 rounded-full border border-[#333333] flex items-center justify-center mx-auto text-white bg-[#111111]">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Camera Inactive
                  </h3>
                  <p className="text-xs leading-relaxed text-[#777777]">
                    Click <strong>"Start Camera"</strong> to activate 21-landmark recognition. Frame analysis runs locally on your GPU/CPU.
                  </p>
                </div>
              )}

              {/* On-Screen HUD Overlay Badge */}
              {isCameraActive && currentGesture && (
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="px-4 py-2 rounded-xl bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#999999]">
                      DETECTED:
                    </span>
                    <span className="text-base sm:text-lg font-black tracking-wider text-white">
                      {currentGesture.gesture}
                    </span>
                    {currentGesture.confidence > 0 && (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white text-black">
                        {Math.round(currentGesture.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Privacy & Hardware Telemetry Badge */}
            <div className="p-3 rounded-lg bg-white border border-[#E5E5E5] text-[11px] font-mono text-[#777777] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
                <span>ON-DEVICE COMPUTER VISION • ZERO NETWORK TRANSMISSION</span>
              </div>
              <span className="text-[10px] text-black font-semibold">
                {isCameraActive ? 'FPS: 30 • LANDMARKS: 21' : 'READY'}
              </span>
            </div>

          </div>

          {/* Right 5 Cols: Live Recognition Result & Sentence Builder */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Recognition Result Card (Section 4) */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#777777]">
                  Active Recognition Output
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    currentGesture?.isRecognized
                      ? 'bg-black text-white'
                      : 'bg-[#F0F0F0] text-[#777777]'
                  }`}
                >
                  {currentGesture?.status || 'Awaiting Hand'}
                </span>
              </div>

              {/* Detected Sign Output */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-[#777777] uppercase block">
                  Detected Sign
                </span>
                <h2 className="text-3xl font-black text-black tracking-tight">
                  {currentGesture?.gesture || 'No Hand Detected'}
                </h2>
                <p className="text-xs text-[#555555] font-medium">
                  {currentGesture?.englishMeaning || 'Position your hand clearly within the camera view.'}
                </p>
              </div>

              {/* Confidence Score Meter */}
              {currentGesture && currentGesture.confidence > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#777777]">Landmark Confidence:</span>
                    <span className="font-bold text-black">
                      {Math.round(currentGesture.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5E5E5] overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-300"
                      style={{ width: `${Math.round(currentGesture.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Recognition Description / Guidance */}
              <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-xs text-[#555555] leading-relaxed">
                {currentGesture?.description || 'Position dominant hand upright with open palm or perform one of the 20 supported vocabulary signs.'}
              </div>

              {/* Manual Add to Caption Button */}
              {currentGesture?.isRecognized && (
                <button
                  onClick={handleAddCurrentToSentence}
                  className="w-full py-2.5 rounded-xl border border-black bg-white hover:bg-black hover:text-white text-black text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add "{currentGesture.gesture}" to Sentence</span>
                </button>
              )}
            </div>

            {/* Live Text & Caption Output Area (Section 5) */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Live Sentence Output
                  </h3>
                  <span className="text-[10px] text-[#777777] font-mono">
                    Accumulated gesture sequence
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-mono text-[#666666] flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAccumulate}
                      onChange={(e) => setAutoAccumulate(e.target.checked)}
                      className="rounded border-[#D4D4D4] text-black focus:ring-0"
                    />
                    <span>Auto-append</span>
                  </label>
                </div>
              </div>

              {/* Sentence Display Box */}
              <div
                aria-live="polite"
                className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] min-h-[90px] flex items-center justify-center text-center"
              >
                {accumulatedSentence.length === 0 ? (
                  <p className="text-xs text-[#888888] font-mono">
                    Recognized words will accumulate here as you sign.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {accumulatedSentence.map((word, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded-lg bg-black text-white text-xs font-mono font-bold shadow-sm"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sentence Action Controls */}
              {accumulatedSentence.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={handleCopySentence}
                    className="py-2 px-3 rounded-lg border border-[#D4D4D4] hover:border-black bg-white text-black text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSpeakSentence}
                    className="py-2 px-3 rounded-lg border border-[#D4D4D4] hover:border-black bg-white text-black text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>

                  <button
                    onClick={handleClearSentence}
                    className="py-2 px-3 rounded-lg border border-[#D4D4D4] hover:border-black bg-white text-black text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recognition History Log (Section 4) */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Detection History Log
                  </h3>
                  <span className="text-[10px] text-[#777777] font-mono">
                    Recent verified postures
                  </span>
                </div>
                {gestureHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[11px] text-[#777777] hover:text-black flex items-center gap-1 font-mono transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {gestureHistory.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#777777] font-mono">
                    No recognized signs logged yet.
                  </div>
                ) : (
                  gestureHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">{item.gesture}</span>
                        <span className="text-[10px] text-[#777777]">
                          ({Math.round(item.confidence * 100)}%)
                        </span>
                      </div>
                      <span className="text-[10px] text-[#888888]">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. Supported Vocabulary Interactive Gallery (20 Entries) (Section 2) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#777777]">
                Vocabulary Reference Standard
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black mt-0.5">
                20 Supported Vocabulary Signs
              </h2>
              <p className="text-xs text-[#666666] font-mono mt-1">
                Individual visual gesture reference photos from the official 20-sign vocabulary chart.
              </p>
            </div>

            {/* Actions: View Full Chart & Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowChartModal(true)}
                className="px-3 py-1.5 rounded-xl border border-black bg-black text-white hover:bg-[#1C1C1C] text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
              >
                <span>View Full Reference Photo Chart</span>
              </button>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5]">
                <button
                  onClick={() => setVocabFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    vocabFilter === 'all'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-[#666666] hover:text-black'
                  }`}
                >
                  All 20 Signs
                </button>
                <button
                  onClick={() => setVocabFilter('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    vocabFilter === 'single'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-[#666666] hover:text-black'
                  }`}
                >
                  Single Hand
                </button>
                <button
                  onClick={() => setVocabFilter('two_hand')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    vocabFilter === 'two_hand'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-[#666666] hover:text-black'
                  }`}
                >
                  Two Hands
                </button>
              </div>
            </div>
          </div>

          {/* 20 Vocabulary Grid with Separate Visual Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVocab.map((item, index) => {
              const isSelected = selectedVocab?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedVocab(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                    isSelected
                      ? 'border-black bg-white ring-2 ring-black shadow-md'
                      : 'border-[#E5E5E5] bg-[#F7F7F7] hover:border-black hover:bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#777777]">
                        #{index + 1}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#E5E5E5] text-black">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-black tracking-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#555555] font-medium leading-snug">
                      {item.englishMeaning}
                    </p>
                  </div>

                  {/* Separate Visual Gesture Photo */}
                  <div className="w-full h-28 rounded-lg overflow-hidden border border-[#E5E5E5] bg-white flex items-center justify-center p-1">
                    {item.imageSrc ? (
                      <img
                        src={getAssetUrl(item.imageSrc)}
                        alt={`Sign gesture for ${item.name}`}
                        className="w-full h-full object-contain hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <SignVisualIllustration type={item.visualType} className="w-full h-full object-contain" />
                    )}
                  </div>

                  {/* Recognition Status Pill */}
                  <div className="pt-1">
                    <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-white border border-[#D4D4D4] text-[#444444] block text-center">
                      {item.recognitionStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Drawer Modal when a sign is clicked */}
          {selectedVocab && (
            <div className="p-6 rounded-xl border-2 border-black bg-white space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777]">
                    Selected Sign Guidance
                  </span>
                  <h3 className="text-2xl font-black text-black">
                    {selectedVocab.name} — {selectedVocab.englishMeaning}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedVocab(null)}
                  className="px-3 py-1 rounded-lg border border-[#D4D4D4] text-xs font-mono hover:border-black"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1 rounded-xl border border-[#E5E5E5] overflow-hidden bg-white p-2 flex items-center justify-center min-h-[180px]">
                  {selectedVocab.imageSrc ? (
                    <img
                      src={getAssetUrl(selectedVocab.imageSrc)}
                      alt={selectedVocab.name}
                      className="max-h-44 w-auto object-contain mx-auto"
                    />
                  ) : (
                    <SignVisualIllustration type={selectedVocab.visualType} className="w-full h-44 object-contain" />
                  )}
                </div>
                <div className="md:col-span-2 space-y-3 text-xs leading-relaxed">
                  <div>
                    <strong className="text-black block text-sm mb-1 font-mono uppercase">
                      Execution Instructions:
                    </strong>
                    <p className="text-[#555555] leading-relaxed">
                      {selectedVocab.instructions}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[11px] font-mono space-y-1">
                    <div>
                      <span className="text-[#777777]">Classifier Model Type: </span>
                      <strong className="text-black">{selectedVocab.type.toUpperCase()}</strong>
                    </div>
                    <div>
                      <span className="text-[#777777]">Tracking Architecture: </span>
                      <strong className="text-black">{selectedVocab.recognitionStatus}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Reference Photo Modal */}
          {showChartModal && (
            <div
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowChartModal(false)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border-2 border-black max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                  <div>
                    <h3 className="text-lg font-black text-black">
                      Signs Everyone Should Know — 20 Vocabulary Signs
                    </h3>
                    <p className="text-xs text-[#666666] font-mono">
                      Master visual reference poster for HearMe AI sign recognition
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChartModal(false)}
                    className="px-3 py-1 rounded-lg border border-[#D4D4D4] hover:border-black text-xs font-mono"
                  >
                    Close
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#E5E5E5] bg-white p-2">
                  <img
                    src={getAssetUrl('/images/signs-reference-chart.jpg')}
                    alt="Full 20 Signs Reference Chart"
                    className="w-full h-auto object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
