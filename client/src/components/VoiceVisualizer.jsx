import React from 'react';

export default function VoiceVisualizer({ isActive, speaker = 'ai' }) {
  const bars = [16, 28, 44, 20, 36, 48, 24, 40, 18, 32, 46, 22];

  const colorClass =
    speaker === 'ai'
      ? 'bg-gradient-to-t from-teal-500 to-emerald-400'
      : 'bg-gradient-to-t from-indigo-500 to-purple-400';

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-200 ${colorClass}`}
          style={{
            height: isActive ? `${Math.max(8, (height * (Math.sin(i + Date.now()) * 0.4 + 0.8)))}px` : '6px',
            animation: isActive ? `wave 1.2s ease-in-out infinite alternate ${i * 0.1}s` : 'none',
            opacity: isActive ? 0.9 : 0.25
          }}
        />
      ))}
    </div>
  );
}
