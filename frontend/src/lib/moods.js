export const MOOD_CONFIGS = {
  joyful: {
    id: 'joyful',
    label: 'Joyful',
    emoji: '✨',
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-50',
    bgDark: 'bg-amber-950/40',
    borderLight: 'border-amber-200',
    textColor: 'text-amber-700',
    sentimentBaseline: 0.9,
  },
  energetic: {
    id: 'energetic',
    label: 'Energetic',
    emoji: '⚡',
    color: '#10B981', // Emerald
    bgLight: 'bg-emerald-50',
    bgDark: 'bg-emerald-950/40',
    borderLight: 'border-emerald-200',
    textColor: 'text-emerald-700',
    sentimentBaseline: 0.8,
  },
  calm: {
    id: 'calm',
    label: 'Calm',
    emoji: '🌊',
    color: '#0EA5E9', // Sky
    bgLight: 'bg-sky-50',
    bgDark: 'bg-sky-950/40',
    borderLight: 'border-sky-200',
    textColor: 'text-sky-700',
    sentimentBaseline: 0.6,
  },
  reflective: {
    id: 'reflective',
    label: 'Reflective',
    emoji: '🌿',
    color: '#6366F1', // Indigo
    bgLight: 'bg-indigo-50',
    bgDark: 'bg-indigo-950/40',
    borderLight: 'border-indigo-200',
    textColor: 'text-indigo-700',
    sentimentBaseline: 0.4,
  },
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    emoji: '☕',
    color: '#64748B', // Slate
    bgLight: 'bg-slate-50',
    bgDark: 'bg-slate-900/40',
    borderLight: 'border-slate-200',
    textColor: 'text-slate-700',
    sentimentBaseline: 0.0,
  },
  anxious: {
    id: 'anxious',
    label: 'Anxious',
    emoji: '🌪️',
    color: '#F97316', // Orange
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-950/40',
    borderLight: 'border-orange-200',
    textColor: 'text-orange-700',
    sentimentBaseline: -0.4,
  },
  tired: {
    id: 'tired',
    label: 'Tired',
    emoji: '🌙',
    color: '#78716C', // Stone
    bgLight: 'bg-stone-50',
    bgDark: 'bg-stone-900/40',
    borderLight: 'border-stone-200',
    textColor: 'text-stone-700',
    sentimentBaseline: -0.2,
  },
  melancholic: {
    id: 'melancholic',
    label: 'Melancholic',
    emoji: '🌧️',
    color: '#475569', // Slate dark
    bgLight: 'bg-blue-50/60',
    bgDark: 'bg-blue-950/40',
    borderLight: 'border-blue-200',
    textColor: 'text-slate-700',
    sentimentBaseline: -0.3,
  },
  overwhelmed: {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    emoji: '💥',
    color: '#E11D48', // Rose
    bgLight: 'bg-rose-50',
    bgDark: 'bg-rose-950/40',
    borderLight: 'border-rose-200',
    textColor: 'text-rose-700',
    sentimentBaseline: -0.6,
  },
  frustrated: {
    id: 'frustrated',
    label: 'Frustrated',
    emoji: '🔥',
    color: '#C2410C', // Orange dark
    bgLight: 'bg-red-50',
    bgDark: 'bg-red-950/40',
    borderLight: 'border-red-200',
    textColor: 'text-red-700',
    sentimentBaseline: -0.5,
  },
};

export const ALL_MOODS = [
  'joyful',
  'energetic',
  'calm',
  'reflective',
  'neutral',
  'anxious',
  'tired',
  'melancholic',
  'overwhelmed',
  'frustrated',
];

export function getMoodDetails(mood) {
  if (mood && mood in MOOD_CONFIGS) {
    return MOOD_CONFIGS[mood];
  }
  return MOOD_CONFIGS.reflective;
}

// GitHub Heatmap Cell Color calculation based on sentiment (-1.0 to 1.0) and mood
export function getSentimentHeatmapColor(score, mood) {
  if (score === undefined || score === null) {
    return 'bg-stone-100 hover:bg-stone-200 text-stone-400 border-stone-200';
  }

  // Highly Positive (> 0.6)
  if (score >= 0.6) {
    if (mood === 'joyful') return 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500/40';
    return 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600/40';
  }
  // Moderately Positive (0.2 to 0.6)
  if (score >= 0.2) {
    if (mood === 'calm') return 'bg-sky-400 hover:bg-sky-500 text-sky-950 border-sky-500/40';
    if (mood === 'reflective') return 'bg-indigo-400 hover:bg-indigo-500 text-white border-indigo-500/40';
    return 'bg-emerald-300 hover:bg-emerald-400 text-emerald-950 border-emerald-400/40';
  }
  // Neutral / Mild (-0.2 to 0.2)
  if (score >= -0.2) {
    if (mood === 'reflective') return 'bg-indigo-200 hover:bg-indigo-300 text-indigo-900 border-indigo-300';
    return 'bg-stone-300 hover:bg-stone-400 text-stone-800 border-stone-400';
  }
  // Moderately Negative (-0.6 to -0.2)
  if (score >= -0.6) {
    if (mood === 'anxious') return 'bg-orange-400 hover:bg-orange-500 text-white border-orange-500/40';
    if (mood === 'melancholic') return 'bg-blue-300 hover:bg-blue-400 text-blue-950 border-blue-400';
    return 'bg-rose-300 hover:bg-rose-400 text-rose-950 border-rose-400';
  }
  // Strongly Challenging (< -0.6)
  return 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600/40';
}

export function formatSentimentScore(score) {
  if (score === undefined || score === null) return 'N/A';
  const sign = score > 0 ? '+' : '';
  return `${sign}${score.toFixed(2)}`;
}

export const JOURNAL_PROMPT_STARTERS = [
  {
    category: 'Energy & Flow',
    prompt: 'What gave me the greatest energy or sense of flow today?',
  },
  {
    category: 'Obstacles & Growth',
    prompt: 'What was the toughest obstacle I encountered today, and how did I respond to it?',
  },
  {
    category: 'Gratitude Anchors',
    prompt: 'Three small, sensory moments from today that I am genuinely grateful for...',
  },
  {
    category: 'Unpacking Stress',
    prompt: 'Where is tension residing in my mind or body right now, and what is its root cause?',
  },
  {
    category: 'Connection',
    prompt: 'An interaction with someone today that left an impression on me...',
  },
  {
    category: 'Tomorrow’s Intention',
    prompt: 'If I could bring one single quality into tomorrow (e.g. patience, focus, courage), what would it be?',
  },
];
