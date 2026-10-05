import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Lightbulb, Code2, MessageSquare, 
  ArrowRight, CheckCircle, Clock, AlertCircle, Sparkles, Loader2, Play
} from 'lucide-react';
import WebcamView from '../components/WebcamView';
import CodeEditor from '../components/CodeEditor';
import VoiceVisualizer from '../components/VoiceVisualizer';
import { api } from '../services/api';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/speechService';

export default function ActiveInterview({ interview, onInterviewCompleted, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questions, setQuestions] = useState(interview.questions || []);
  const [userAnswer, setUserAnswer] = useState('');
  const [userCode, setUserCode] = useState('');
  const [activeTab, setActiveTab] = useState('answer'); // 'answer' | 'code'
  
  // Audio & Speech State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognizerRef = useRef(null);

  // Follow-up state
  const [followUp, setFollowUp] = useState(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Timer
  const [seconds, setSeconds] = useState(0);

  const currentQ = questions[currentIdx] || {};

  // Stopwatch timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds as MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Read current question when index changes
  useEffect(() => {
    if (currentQ?.questionText && !isVoiceMuted) {
      speakQuestion(currentQ.questionText);
    }
    // Preload existing answers if revisiting
    setUserAnswer(currentQ?.userAnswer || '');
    setUserCode(currentQ?.userCode || currentQ?.starterCode || '');
    setFollowUp(currentQ?.followUp?.questionText ? currentQ.followUp : null);
    setFollowUpAnswer(currentQ?.followUp?.userAnswer || '');
    setShowHint(false);

    // Default tab based on category
    if (currentQ?.category === 'coding') {
      setActiveTab('code');
    } else {
      setActiveTab('answer');
    }

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [currentIdx]);

  const speakQuestion = (text) => {
    if (isVoiceMuted) return;
    setIsAiSpeaking(true);
    speakText(
      text,
      () => setIsAiSpeaking(true),
      () => setIsAiSpeaking(false)
    );
  };

  const toggleVoiceMute = () => {
    if (!isVoiceMuted) {
      stopSpeaking();
      setIsAiSpeaking(false);
    } else {
      speakQuestion(followUp ? followUp.questionText : currentQ?.questionText);
    }
    setIsVoiceMuted(!isVoiceMuted);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechSupported(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: (err) => {
        console.warn('Speech error:', err);
        setIsListening(false);
      },
      onResult: ({ final, interim }) => {
        if (final) {
          setUserAnswer((prev) => (prev ? prev + ' ' + final : final));
        }
      }
    });

    recognizerRef.current = recognizer;

    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognizerRef.current) {
      alert('Speech Recognition is not supported in this browser. You can type your answer directly!');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      // Stop AI voice if speaking
      stopSpeaking();
      setIsAiSpeaking(false);
      try {
        recognizerRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognizer start error:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognizerRef.current && isListening) {
      try {
        recognizerRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  // Submit current answer to get follow-up probing
  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim() && !userCode.trim()) {
      alert('Please provide a spoken or written response, or code solution before continuing.');
      return;
    }

    setIsSubmitting(true);
    stopListening();
    stopSpeaking();

    try {
      const res = await api.submitAnswer(interview._id, {
        questionIndex: currentIdx,
        userAnswer,
        userCode
      });

      if (res.success && res.followUp) {
        setFollowUp(res.followUp);
        // Speak follow-up question
        if (!isVoiceMuted && res.followUp.followUpText) {
          speakQuestion(res.followUp.followUpText);
        }
      }
    } catch (err) {
      console.error('Answer submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit follow-up response and go to next question or complete
  const handleFollowUpOrNext = async () => {
    stopListening();
    stopSpeaking();

    if (followUp && followUpAnswer.trim()) {
      try {
        await api.submitFollowUp(interview._id, {
          questionIndex: currentIdx,
          followUpAnswer
        });
      } catch (err) {
        console.warn('Followup submit warning:', err.message);
      }
    }

    // Save answer into local questions list
    const updated = [...questions];
    updated[currentIdx] = {
      ...updated[currentIdx],
      userAnswer,
      userCode,
      followUp: followUp ? { ...followUp, userAnswer: followUpAnswer } : undefined
    };
    setQuestions(updated);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Complete interview
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setIsCompleting(true);
    stopSpeaking();
    stopListening();

    try {
      const durationMins = Math.max(1, Math.round(seconds / 60));
      const res = await api.completeInterview(interview._id, {
        durationMinutes: durationMins
      });

      if (res.success && res.interview) {
        onInterviewCompleted(res.interview);
      }
    } catch (err) {
      console.error('Completion error:', err);
      alert('Failed to evaluate interview. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Top Session Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{interview.role}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                {interview.level}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Question {currentIdx + 1} of {questions.length} • {currentQ?.category?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{formatTime(seconds)}</span>
          </div>

          <button
            onClick={toggleVoiceMute}
            className={`p-2 rounded-xl border transition-colors ${
              isVoiceMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isVoiceMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column: AI Interviewer & Question Prompt (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* AI Interviewer Avatar Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="relative mb-3">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-500 shadow-xl transition-all duration-300 ${
                  isAiSpeaking ? 'scale-105 ring-4 ring-teal-400/40 glow-teal' : ''
                }`}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              {isAiSpeaking && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white">AI Senior Hiring Manager</h3>
            <p className="text-xs text-slate-400 mb-2">
              {isAiSpeaking ? 'Speaking question...' : 'Listening attentively'}
            </p>

            {/* Audio Waveform Indicator */}
            <VoiceVisualizer isActive={isAiSpeaking} speaker="ai" />
          </div>

          {/* Current Question Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {currentQ?.category || 'Technical'} Round
                </span>

                <button
                  onClick={() => speakQuestion(currentQ?.questionText)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-teal-300 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Replay Question
                </button>
              </div>

              <h4 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                "{currentQ?.questionText}"
              </h4>
            </div>

            {/* Hint Drawer */}
            {currentQ?.hints && currentQ.hints.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : 'Need a hint?'}
                </button>

                {showHint && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed animate-in fade-in">
                    {currentQ.hints[0]}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic AI Follow-up Section */}
            {followUp && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> Interviewer Follow-up Question
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                  "{followUp.followUpText}"
                </p>
                {followUp.quickEvaluation && (
                  <p className="text-[11px] text-slate-400 italic">
                    Feedback: {followUp.quickEvaluation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Webcam & Response Workspace (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Candidate Webcam View & Audio Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WebcamView isSpeaking={isListening} isListening={isListening} />

            {/* Voice Recording Control Tile */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Voice Response
                  </span>
                  <span className={`text-[11px] font-semibold ${isListening ? 'text-teal-400 animate-pulse' : 'text-slate-500'}`}>
                    {isListening ? 'Recording live...' : 'Ready'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click the microphone to speak your answer naturally. Your speech will be converted to text in real-time.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/25'
                      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-500/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" /> Click to Speak
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Tabs: Answer Text vs Live Code Sandbox */}
          <div className="glass-panel rounded-2xl border border-slate-800 flex-1 flex flex-col overflow-hidden">
            {/* Tab navigation */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('answer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'answer'
                      ? 'bg-teal-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Verbal / Written Transcript
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'code'
                      ? 'bg-teal-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> Code Sandbox
                  {currentQ?.category === 'coding' && (
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                  )}
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                {activeTab === 'answer' ? 'Editable Speech Transcript' : 'Interactive Code Editor'}
              </span>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4">
              {activeTab === 'answer' ? (
                <div className="h-full flex flex-col space-y-3">
                  <div className="flex-1">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Your spoken words will appear here in real-time, or you can type directly. Structure your thoughts clearly (Situation, Action, Outcome, Technical Trade-offs)..."
                      className="w-full h-44 sm:h-52 p-3.5 bg-[#0a0f1d] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>

                  {/* Follow up response field if active */}
                  {followUp && (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-indigo-300">
                        Your Response to Follow-up Question:
                      </label>
                      <input
                        type="text"
                        value={followUpAnswer}
                        onChange={(e) => setFollowUpAnswer(e.target.value)}
                        placeholder="Briefly explain how you'd handle that follow-up..."
                        className="w-full px-3.5 py-2.5 bg-[#0a0f1d] border border-indigo-500/30 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-72 sm:h-80">
                  <CodeEditor
                    code={userCode}
                    onChange={setUserCode}
                    starterCode={currentQ?.starterCode}
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {currentIdx + 1 < questions.length
                  ? `Next: Question ${currentIdx + 2}`
                  : 'Final Question'}
              </span>

              <div className="flex items-center gap-3">
                {!followUp ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={isSubmitting || (!userAnswer.trim() && !userCode.trim())}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all text-xs sm:text-sm shadow-lg shadow-teal-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleFollowUpOrNext}
                    disabled={isCompleting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 transition-all text-xs sm:text-sm shadow-lg shadow-teal-500/25"
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating Final Scorecard...
                      </>
                    ) : currentIdx < questions.length - 1 ? (
                      <>
                        Continue to Next Question <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Complete Interview & View Report <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
