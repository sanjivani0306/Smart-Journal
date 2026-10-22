import { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, Volume2, VolumeX, Clock, ChevronUp, X, Music } from 'lucide-react';

export function MiniAudioPlayer({ onOpenMusicTab }) {
  const {
    isPlaying,
    togglePlay,
    currentPresetData,
    masterVolume,
    setMasterVolume,
    timerRemaining,
    isTimerRunning,
  } = useAudio();

  const [isDismissed, setIsDismissed] = useState(false);

  // If nothing is playing, no timer is running, or user closed it, don't show
  if (!isPlaying && !isTimerRunning) return null;
  if (isDismissed) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <aside aria-label="Audio controls" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-stone-900/95 backdrop-blur-md text-white border border-stone-700/90 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        {/* Left: Preset Info & Animated Indicator */}
        <div
          onClick={onOpenMusicTab}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 text-lg group-hover:scale-105 transition-transform">
            {currentPresetData.emoji || '🎵'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[180px]">
                {currentPresetData.name}
              </h4>
              {isPlaying && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3 delay-75" />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-1.5 delay-150" />
                </span>
              )}
            </div>

            {isTimerRunning ? (
              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono mt-0.5">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Timer: {formatTime(timerRemaining)}</span>
              </div>
            ) : (
              <span className="text-[10px] text-stone-400 truncate block">
                {currentPresetData.frequencies || 'Ambience'}
              </span>
            )}
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 flex items-center justify-center font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Quick Volume Toggle */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMasterVolume(masterVolume === 0 ? 0.75 : 0)}
              className="text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              {masterVolume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={e => setMasterVolume(parseFloat(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer h-1 bg-stone-700 rounded appearance-none"
            />
          </div>

          {/* Open Full Lounge Tab */}
          <button
            type="button"
            onClick={onOpenMusicTab}
            className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Open Music Sanctuary"
          >
            <Music className="w-3 h-3 text-amber-400" />
            <span>Lounge</span>
          </button>

          {/* Close mini bar */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-stone-500 hover:text-stone-300 p-1 cursor-pointer"
            title="Hide mini player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
