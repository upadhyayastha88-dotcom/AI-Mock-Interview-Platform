import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, User, Volume2 } from 'lucide-react';

export default function WebcamView({ isSpeaking, isListening }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [permissionError, setPermissionError] = useState(null);

  useEffect(() => {
    let activeStream = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setPermissionError('Camera API not supported in this browser.');
          return;
        }

        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false // Audio handled separately by SpeechRecognition
        });

        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
        setPermissionError(null);
      } catch (err) {
        console.warn('Webcam permission note:', err.message);
        setPermissionError('Camera access not granted. Using candidate avatar.');
        setIsVideoOn(false);
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    } else {
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  return (
    <div className="relative w-full aspect-video md:aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
      {/* Video element */}
      {isVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-[#0c121f] text-slate-500">
          <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <span className="text-xs font-medium text-slate-400">Camera Paused</span>
        </div>
      )}

      {/* Status Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
          <span className={`w-2 h-2 rounded-full ${isVideoOn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
          <span>{isVideoOn ? 'You (Candidate)' : 'Video Paused'}</span>
        </div>

        {isListening && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/80 backdrop-blur-md text-[11px] font-bold text-white animate-pulse">
            <Mic className="w-3 h-3" /> Listening...
          </div>
        )}
      </div>

      {/* Floating Media Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={toggleVideo}
          title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          className={`p-2.5 rounded-xl transition-all ${
            isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {isVideoOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleMic}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          className={`p-2.5 rounded-xl transition-all ${
            isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>

      {permissionError && !isVideoOn && (
        <div className="absolute bottom-2 left-2 right-2 text-center text-[10px] text-slate-400 bg-slate-900/90 py-1 px-2 rounded-lg border border-slate-800">
          {permissionError}
        </div>
      )}
    </div>
  );
}
