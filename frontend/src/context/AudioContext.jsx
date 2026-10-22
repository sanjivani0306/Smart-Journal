import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '../lib/audioEngine';

export const SOUND_PRESETS = [
  {
    id: 'rainy_reflection',
    name: 'Rainy Day Reflection',
    emoji: '🌧️',
    description: 'Soft continuous rain, warm vinyl crackle, and gentle reflective piano chords.',
    moods: ['reflective', 'melancholic', 'calm'],
    idealFor: 'Deep emotional introspection and evening writing',
    frequencies: '432 Hz Introspection',
    volumes: {
      rain: 0.7,
      crackle: 0.25,
      chords: 0.45,
      binaural: 0.2,
      ocean: 0,
      bowl: 0,
      wind: 0.1,
    },
  },
  {
    id: 'lofi_midnight',
    name: 'Lo-Fi Midnight Sanctuary',
    emoji: '☕',
    description: 'Warm Rhodes electric piano chords, coffeehouse vinyl texture, and gentle air.',
    moods: ['neutral', 'calm', 'tired'],
    idealFor: 'Late night journaling and organizing scattered thoughts',
    frequencies: 'Alpha Waves (10 Hz)',
    volumes: {
      chords: 0.7,
      crackle: 0.4,
      rain: 0.2,
      ocean: 0,
      binaural: 0.15,
      bowl: 0,
      wind: 0,
    },
  },
  {
    id: 'zen_mindfulness',
    name: 'Zen Singing Bowls & Om',
    emoji: '🧘',
    description: 'Resonant Tibetan singing bowls, 432 Hz sacred drone, and whispering mountain wind.',
    moods: ['calm', 'reflective', 'joyful'],
    idealFor: 'Mindful breathing, gratitude journaling, and inner balance',
    frequencies: '432 Hz + Theta 6 Hz',
    volumes: {
      bowl: 0.75,
      binaural: 0.55,
      wind: 0.35,
      chords: 0.2,
      rain: 0,
      ocean: 0,
      crackle: 0,
    },
  },
  {
    id: 'ocean_waves',
    name: 'Coastal Tide & Serenity',
    emoji: '🌊',
    description: 'Rhythmic rolling ocean swells with alpha flow frequencies and peaceful piano.',
    moods: ['joyful', 'energetic', 'calm'],
    idealFor: 'Morning journaling and refreshing mental clarity',
    frequencies: 'Alpha Waves (12 Hz)',
    volumes: {
      ocean: 0.8,
      chords: 0.35,
      wind: 0.25,
      binaural: 0.2,
      rain: 0,
      crackle: 0,
      bowl: 0,
    },
  },
  {
    id: 'anxiety_grounding',
    name: 'Anxiety Release & Grounding',
    emoji: '🌿',
    description: 'Deep soothing drone, gentle raindrops, and slow calming chords for nervous system relief.',
    moods: ['anxious', 'overwhelmed', 'frustrated'],
    idealFor: 'De-escalating overwhelm, release writing, and somatic calming',
    frequencies: '528 Hz Healing Tone',
    volumes: {
      binaural: 0.65,
      rain: 0.55,
      chords: 0.4,
      bowl: 0.3,
      ocean: 0,
      crackle: 0,
      wind: 0,
    },
  },
  {
    id: 'deep_rest',
    name: 'Restorative Sleep & Drift',
    emoji: '🌙',
    description: 'Slow harmonic drone, distant rolling waves, and warm fireplace crackle.',
    moods: ['tired', 'overwhelmed'],
    idealFor: 'Unwinding before sleep and unburdening daily fatigue',
    frequencies: 'Delta Waves (2.5 Hz)',
    volumes: {
      binaural: 0.5,
      ocean: 0.4,
      crackle: 0.3,
      chords: 0.25,
      rain: 0.15,
      bowl: 0,
      wind: 0,
    },
  },
];

export const TRACK_METADATA = [
  { id: 'rain', label: 'Rainfall', icon: '🌧️', desc: 'Pink noise soft rain' },
  { id: 'ocean', label: 'Ocean Waves', icon: '🌊', desc: 'Rhythmic swell' },
  { id: 'crackle', label: 'Vinyl Crackle', icon: '☕', desc: 'Warm analog pops' },
  { id: 'chords', label: 'Ambient Piano', icon: '🎹', desc: 'Generative chords' },
  { id: 'bowl', label: 'Tibetan Bowl', icon: '🧘', desc: 'Harmonic chimes' },
  { id: 'binaural', label: 'Binaural Drone', icon: '🌌', desc: '432Hz + Theta waves' },
  { id: 'wind', label: 'Whispering Wind', icon: '🍃', desc: 'Forest breeze' },
];

const AudioContextInstance = createContext(null);

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState(SOUND_PRESETS[0].id);
  const [masterVolume, setMasterVolumeState] = useState(0.75);
  const [trackVolumes, setTrackVolumes] = useState({ ...SOUND_PRESETS[0].volumes });

  // Timer State
  const [timerDuration, setTimerDuration] = useState(0); // in minutes
  const [timerRemaining, setTimerRemaining] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  // Sync initial preset volumes to audio engine
  useEffect(() => {
    Object.entries(trackVolumes).forEach(([track, vol]) => {
      audioEngine.trackVolumes[track] = vol;
    });
    audioEngine.setMasterVolume(masterVolume);
  }, []);

  // Timer countdown handler
  useEffect(() => {
    if (isTimerRunning && timerRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            audioEngine.playCompletionBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerRemaining]);

  const startTimer = useCallback((minutes) => {
    const totalSeconds = minutes * 60;
    setTimerDuration(minutes);
    setTimerRemaining(totalSeconds);
    setIsTimerRunning(true);

    // Auto-start ambient music if not already playing
    if (!isPlaying) {
      audioEngine.play().then(() => setIsPlaying(true));
    }
  }, [isPlaying]);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerRemaining(0);
    setTimerDuration(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      await audioEngine.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const playPreset = useCallback(async (presetId) => {
    const preset = SOUND_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setActivePreset(preset.id);
    setTrackVolumes({ ...preset.volumes });

    Object.entries(preset.volumes).forEach(([track, vol]) => {
      audioEngine.setTrackVolume(track, vol);
    });

    if (!isPlaying) {
      await audioEngine.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const setTrackVolume = useCallback((trackName, volume) => {
    setTrackVolumes(prev => ({ ...prev, [trackName]: volume }));
    audioEngine.setTrackVolume(trackName, volume);
    setActivePreset('custom');
  }, []);

  const setMasterVolume = useCallback((volume) => {
    setMasterVolumeState(volume);
    audioEngine.setMasterVolume(volume);
  }, []);

  // Match music to a given mood string
  const applyMoodMatch = useCallback(async (moodCategory) => {
    const lower = (moodCategory || '').toLowerCase();
    let matchedPreset = SOUND_PRESETS[0];

    if (lower.includes('anxious') || lower.includes('overwhelm') || lower.includes('frustrat')) {
      matchedPreset = SOUND_PRESETS.find(p => p.id === 'anxiety_grounding') || SOUND_PRESETS[0];
    } else if (lower.includes('tired') || lower.includes('exhaust')) {
      matchedPreset = SOUND_PRESETS.find(p => p.id === 'deep_rest') || SOUND_PRESETS[0];
    } else if (lower.includes('joy') || lower.includes('energ')) {
      matchedPreset = SOUND_PRESETS.find(p => p.id === 'ocean_waves') || SOUND_PRESETS[0];
    } else if (lower.includes('calm') || lower.includes('peace')) {
      matchedPreset = SOUND_PRESETS.find(p => p.id === 'zen_mindfulness') || SOUND_PRESETS[0];
    } else if (lower.includes('reflect') || lower.includes('melanchol')) {
      matchedPreset = SOUND_PRESETS.find(p => p.id === 'rainy_reflection') || SOUND_PRESETS[0];
    } else {
      matchedPreset = SOUND_PRESETS.find(p => p.id === 'lofi_midnight') || SOUND_PRESETS[0];
    }

    await playPreset(matchedPreset.id);
    return matchedPreset;
  }, [playPreset]);

  const currentPresetData = SOUND_PRESETS.find(p => p.id === activePreset) || {
    id: 'custom',
    name: 'Custom Soundscape Mix',
    emoji: '🎚️',
    description: 'Personalized multi-track ambient blend',
    frequencies: 'Custom Mix',
  };

  return (
    <AudioContextInstance.Provider
      value={{
        isPlaying,
        togglePlay,
        activePreset,
        currentPresetData,
        presets: SOUND_PRESETS,
        trackMetadata: TRACK_METADATA,
        playPreset,
        masterVolume,
        setMasterVolume,
        trackVolumes,
        setTrackVolume,
        applyMoodMatch,
        startTimer,
        stopTimer,
        timerDuration,
        timerRemaining,
        isTimerRunning,
      }}
    >
      {children}
    </AudioContextInstance.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContextInstance);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
}
