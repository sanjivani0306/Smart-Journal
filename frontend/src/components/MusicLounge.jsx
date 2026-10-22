import { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { ALL_MOODS, getMoodDetails } from '../lib/moods';
import {
  Music,
  Headphones,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Sliders,
  RotateCcw,
  Waves,
  ExternalLink,
  Check,
  Zap,
} from 'lucide-react';

export function MusicLounge({ latestMood = 'reflective' }) {
  const {
    isPlaying,
    togglePlay,
    activePreset,
    currentPresetData,
    presets,
    trackMetadata,
    playPreset,
    masterVolume,
    setMasterVolume,
    trackVolumes,
    setTrackVolume,
    applyMoodMatch,
    startTimer,
    stopTimer,
    timerRemaining,
    isTimerRunning,
  } = useAudio();

  const [selectedMood, setSelectedMood] = useState(latestMood);
  const [copiedLink, setCopiedLink] = useState(null);

  // Format countdown mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleApplyMood = (mood) => {
    setSelectedMood(mood);
    applyMoodMatch(mood);
  };

  // Music therapy profiles based on moods
  const getTherapyAdvice = (mood) => {
    switch (mood) {
      case 'anxious':
      case 'overwhelmed':
      case 'frustrated':
        return {
          target: 'Parasympathetic Nervous System De-escalation',
          bpm: '55 - 65 BPM (Resting Heart Rate)',
          frequency: '528 Hz Healing Tone & 6 Hz Theta Waves',
          instruments: 'Soft solo piano, cello, rain & low pink noise',
          searchQuery: 'weightless ambient calming 528hz sleep piano',
          advice: 'Slow your breathing to match the ocean swell intervals. Low-frequency sine tones help down-regulate an overactive sympathetic response.',
        };
      case 'tired':
      case 'melancholic':
        return {
          target: 'Emotional Comfort & Gentle Restoration',
          bpm: '50 - 60 BPM (Deep Rest)',
          frequency: '432 Hz Natural Tuning & Delta Waves',
          instruments: 'Warm Rhodes electric piano, vinyl tape warmth, distant thunder',
          searchQuery: 'lofi study peaceful rain sleep tape warmth',
          advice: 'Writing while listening to warm analog textures provides a safe container for fatigue and vulnerable processing.',
        };
      case 'joyful':
      case 'energetic':
        return {
          target: 'Creative Expansion & Dopamine Flow',
          bpm: '80 - 100 BPM (Moderate Flow)',
          frequency: 'Alpha Waves (12 Hz) for Flow State',
          instruments: 'Acoustic guitar arpeggios, gentle lo-fi drum beats, bright chimes',
          searchQuery: 'uplifting acoustic morning ambient lo-fi beats',
          advice: 'Ride this energetic peak by capturing creative ideas and gratitude while rhythmic acoustic melodies stimulate divergent thinking.',
        };
      default:
        return {
          target: 'Focused Mindfulness & Socratic Introspection',
          bpm: '60 - 70 BPM (Optimal Cognitive Processing)',
          frequency: '432 Hz Sacred Drone + 10 Hz Alpha Waves',
          instruments: 'Tibetan singing bowls, subtle synthesizer pads, gentle breeze',
          searchQuery: 'binaural beats alpha focus journaling ambient',
          advice: 'Alpha waves promote a calm yet alert mental state—ideal for thoughtful diary reflection without mental fatigue.',
        };
    }
  };

  const therapy = getTherapyAdvice(selectedMood);

  return (
    <div className="space-y-8">
      {/* Top Banner & Master Audio Control Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-stone-800">
        {/* Background Visual Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Procedural Web Audio Sanctuary</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Headphones className="w-7 h-7 text-amber-400" />
              Mindful Music & Ambient Soundscapes
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Synthesized real-time soundscapes, psycho-acoustic brainwave frequencies, and mood-adaptive music therapy designed to deepen emotional clarity and journaling flow.
            </p>
          </div>

          {/* Master Controls Box */}
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 w-full md:w-80 shadow-2xs backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentPresetData.emoji}</span>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[140px]">
                    {currentPresetData.name}
                  </h4>
                  <span className="text-[10px] text-amber-300 font-medium block">
                    {currentPresetData.frequencies}
                  </span>
                </div>
              </div>

              {/* Master Play/Pause Big Button */}
              <button
                id="master-audio-toggle-btn"
                type="button"
                onClick={togglePlay}
                className={`p-3.5 rounded-2xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center ${
                  isPlaying
                    ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 scale-105'
                    : 'bg-white text-stone-950 hover:bg-stone-100 hover:scale-105'
                }`}
                title={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Visualizer Sound Waves Animation */}
            <div className="flex items-center justify-between gap-1 h-6 px-1">
              {[40, 75, 55, 90, 60, 85, 45, 95, 65, 50, 80, 70, 45, 90, 60].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-stone-600'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * masterVolume))}%` : '20%',
                    animationDelay: `${idx * 0.08}s`,
                  }}
                />
              ))}
            </div>

            {/* Master Volume Slider */}
            <div className="flex items-center gap-3 pt-1 border-t border-stone-700/60">
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
                step="0.01"
                value={masterVolume}
                onChange={e => setMasterVolume(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
              />
              <span className="text-[11px] font-mono text-stone-300 w-8 text-right">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Focus Timer Bar inside Hero Banner */}
        <div className="mt-6 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-stone-200">Mindful Journaling Session Timer:</span>
            {isTimerRunning ? (
              <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-lg font-mono font-bold animate-pulse">
                {formatTime(timerRemaining)} Remaining (Soft Bell at finish)
              </span>
            ) : (
              <span className="text-stone-400 text-[11px]">Choose duration to begin writing flow:</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {[5, 10, 15, 20, 25].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => startTimer(mins)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 text-[11px] font-bold transition-colors cursor-pointer"
              >
                {mins}m
              </button>
            ))}
            {isTimerRunning && (
              <button
                type="button"
                onClick={stopTimer}
                className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: Curated Soundscape Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Waves className="w-4 h-4 text-amber-600" />
              Harmonic Soundscape Presets
            </h3>
            <p className="text-xs text-stone-600">
              Balanced acoustic environments created from real-time noise generators and harmonic synthesizers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map(p => {
            const isActive = activePreset === p.id && isPlaying;
            return (
              <div
                key={p.id}
                onClick={() => playPreset(p.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                    : 'bg-white border-stone-200/90 hover:border-amber-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-1.5 bg-stone-100 rounded-xl group-hover:scale-110 transition-transform">
                      {p.emoji}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {isActive ? 'Active & Playing' : p.frequencies}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 leading-snug pt-1">
                    {p.name}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 italic">
                    Best for: {p.idealFor}
                  </span>
                  <button
                    type="button"
                    className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-900'
                    }`}
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Interactive Multi-Track Ambient Mixer */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Interactive Multi-Track Ambience Mixer
            </h3>
            <p className="text-xs text-stone-600">
              Customize your sound sanctuary by blending organic rain, ocean waves, vinyl crackle, and harmonic piano
            </p>
          </div>

          <button
            type="button"
            onClick={() => playPreset('rainy_reflection')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Rainy Reflection
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trackMetadata.map(track => {
            const vol = trackVolumes[track.id] || 0;
            const isMuted = vol === 0;

            return (
              <div
                key={track.id}
                className={`p-4 rounded-2xl border transition-all ${
                  !isMuted && isPlaying
                    ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                    : 'bg-stone-50/60 border-stone-200/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{track.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{track.label}</h4>
                      <span className="text-[10px] text-stone-500">{track.desc}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isMuted) {
                        setTrackVolume(track.id, 0.5);
                        if (!isPlaying) togglePlay();
                      } else {
                        setTrackVolume(track.id, 0);
                      }
                    }}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isMuted
                        ? 'bg-white text-stone-400 border-stone-200 hover:text-stone-700'
                        : 'bg-amber-500 text-stone-950 border-amber-400'
                    }`}
                    title={isMuted ? `Enable ${track.label}` : `Mute ${track.label}`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-600">
                    <span>Intensity</span>
                    <span className="font-mono">{Math.round(vol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={vol}
                    onChange={e => {
                      const newVol = parseFloat(e.target.value);
                      setTrackVolume(track.id, newVol);
                      if (newVol > 0 && !isPlaying) {
                        togglePlay();
                      }
                    }}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Mood-Adaptive Music Therapy & Curated Recommendations */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Mood-Adaptive Music Therapy Engine
            </h3>
            <p className="text-xs text-stone-600">
              Harmonize emotional states with targeted psycho-acoustic frequencies and curated music playlists
            </p>
          </div>

          <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Adaptive Tuning
          </span>
        </div>

        {/* Mood Selector Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            Select or Match Your Current Feeling:
          </span>
          <div className="flex flex-wrap gap-2">
            {ALL_MOODS.map(m => {
              const details = getMoodDetails(m);
              const isSel = selectedMood === m;

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleApplyMood(m)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSel
                      ? 'bg-stone-900 text-white shadow-xs scale-105'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  <span>{details.emoji}</span>
                  <span className="capitalize">{m}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Therapy Recommendation Breakdown Card */}
        <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Clinical Target
              </span>
              <h4 className="text-sm font-bold text-stone-900 mt-1.5">{therapy.target}</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{therapy.advice}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-500">Therapeutic Tempo</span>
                <p className="text-xs font-bold text-stone-900 mt-0.5">{therapy.bpm}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-500">Target Resonance</span>
                <p className="text-xs font-bold text-stone-900 mt-0.5">{therapy.frequency}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Recommended Acoustic Elements
              </span>
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 font-medium">
                {therapy.instruments}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Listen on Streaming Platforms
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(therapy.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5" /> Search on Spotify
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
                <a
                  href={`https://music.youtube.com/search?q=${encodeURIComponent(therapy.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> YouTube Music
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(therapy.searchQuery);
                    setCopiedLink('copied');
                    setTimeout(() => setCopiedLink(null), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Search!
                    </>
                  ) : (
                    'Copy Keyword'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
