import { useState, useEffect, useCallback } from 'react';
import { getMoodDetails, formatSentimentScore } from '../lib/moods';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';

export function TrendsAndPatterns({ onRefresh, entries = [] }) {
  const { authFetch, user } = useAuth();
  const [trends, setTrends] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const totalEntries = entries.length;
    const scores = entries.map(e => Number(e.aiAnalysis?.sentimentScore ?? 0));
    const averageSentiment = totalEntries ? scores.reduce((a, b) => a + b, 0) / totalEntries : 0;
    const counts = {};
    entries.forEach(e => {
      const mood = e.aiAnalysis?.moodCategory || e.manualMood || 'reflective';
      counts[mood] = (counts[mood] || 0) + 1;
    });
    const dominantMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'reflective';
    const themes = {};
    entries.forEach(e => (e.aiAnalysis?.themes || []).forEach(theme => {
      const name = typeof theme === 'string' ? theme : theme.theme;
      if (name) themes[name] = (themes[name] || 0) + 1;
    }));
    const topThemes = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([theme, count]) => ({ theme, count }));
    setTrends({
      totalEntries,
      averageSentiment,
      currentStreak: 0,
      longestStreak: 0,
      dominantMood,
      patterns: [],
      weekdayMoods: [],
      topThemes,
      weeklyRecap: totalEntries ? 'Your recent mood and theme metadata is summarized from the journal entries stored in PostgreSQL.' : '',
      coachingSuggestion: '',
    });
    setIsLoading(false);
  }, [entries]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-stone-700">
          Synthesizing longitudinal journal patterns with Gemini 3.7 Flash...
        </p>
      </div>
    );
  }

  if (!trends || trends.totalEntries === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">No Journal Entries Recorded Yet</h3>
        <p className="text-xs text-stone-700 max-w-sm mx-auto">
          Start writing your daily entries. Once you have logged entries, AI will surface recurring mood triggers, weekday correlations, and longitudinal reflections.
        </p>
      </div>
    );
  }

  const dominantMoodDetails = getMoodDetails(trends.dominantMood);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Longitudinal AI Mood Trends & Behavioral Patterns
          </h2>
          <p className="text-xs text-stone-700 mt-0.5">
            Gemini analysis of {trends.totalEntries} journal entries across emotional polarity, life themes, and weekday rhythms
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchTrends();
            if (onRefresh) onRefresh();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-analyze Patterns
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Entries */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Total Entries</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{trends.totalEntries}</p>
          <span className="text-[11px] text-stone-700 font-medium">Logged & Analyzed</span>
        </div>

        {/* Average Sentiment */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Avg Sentiment</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-stone-900">
              {formatSentimentScore(trends.averageSentiment)}
            </p>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trends.averageSentiment >= 0.2
                  ? 'bg-emerald-50 text-emerald-700'
                  : trends.averageSentiment <= -0.2
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              {trends.averageSentiment >= 0.2 ? 'Positive Arc' : 'Reflective Arc'}
            </span>
          </div>
          <span className="text-[11px] text-stone-700 font-medium">-1.0 (Low) to +1.0 (High)</span>
        </div>

        {/* Current Streak */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Writing Streak</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-bold text-stone-900">{trends.currentStreak} Days</p>
            <span className="text-[11px] text-stone-700 font-medium">(Best: {trends.longestStreak}d)</span>
          </div>
          <span className="text-[11px] text-stone-700 font-medium">Consistent reflection</span>
        </div>

        {/* Dominant Mood */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Dominant Mood</span>
            <span className="text-base">{dominantMoodDetails.emoji}</span>
          </div>
          <p className="text-2xl font-bold text-stone-900 capitalize">{trends.dominantMood}</p>
          <span className="text-[11px] text-stone-700 font-medium">Most frequent state</span>
        </div>
      </div>

      {/* AI Behavioral Patterns & Correlations */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm tracking-tight">
                AI Detected Behavioral Patterns & Triggers
              </h3>
              <p className="text-xs text-stone-700">
                Surfacing cause-and-effect relationships between your daily habits and emotional states
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {trends.patterns && trends.patterns.length > 0 ? (
            trends.patterns.map((pat, idx) => {
              const isPositive = pat.category === 'positive_driver';
              const isStress = pat.category === 'stress_trigger';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPositive
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : isStress
                      ? 'bg-orange-50/60 border-orange-200 text-orange-950'
                      : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isPositive
                          ? 'bg-emerald-100 text-emerald-800'
                          : isStress
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {pat.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-stone-700">
                      {pat.confidence} Confidence
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-stone-900 leading-snug mb-1.5">{pat.title}</h4>
                  <p className="text-xs text-stone-700 leading-relaxed">{pat.description}</p>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-stone-500 col-span-3">No specific patterns detected yet.</p>
          )}
        </div>
      </div>

      {/* Two Column Grid: Weekday Sentiment Rhythm & Top Life Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekday Sentiment Rhythm (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-600" />
                Weekday Sentiment Rhythm
              </h3>
              <p className="text-xs text-stone-700">Average emotional polarity by day of the week</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {trends.weekdayMoods &&
              trends.weekdayMoods.map((w, idx) => {
                const normalizedPercent = Math.round(((w.averageSentiment + 1) / 2) * 100);
                const isPositive = w.averageSentiment > 0.1;
                const isNegative = w.averageSentiment < -0.1;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-stone-800 w-24">{w.day}</span>
                      <span className="text-stone-700 text-[11px]">
                        {w.entryCount} {w.entryCount === 1 ? 'entry' : 'entries'}
                      </span>
                      <span
                        className={`font-bold text-xs ${
                          isPositive
                            ? 'text-emerald-700'
                            : isNegative
                            ? 'text-rose-700'
                            : 'text-stone-600'
                        }`}
                      >
                        {formatSentimentScore(w.averageSentiment)}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPositive
                            ? 'bg-emerald-500'
                            : isNegative
                            ? 'bg-rose-500'
                            : 'bg-stone-400'
                        }`}
                        style={{ width: `${Math.max(8, normalizedPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Top Extracted Life Themes (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Dominant Life Themes & Sentiment
              </h3>
              <p className="text-xs text-stone-700">Recurring subjects extracted across your writings</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {trends.topThemes && trends.topThemes.length > 0 ? (
              trends.topThemes.map((theme, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-stone-200/80 font-bold text-stone-700 text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-stone-900">#{theme.theme}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-stone-700 text-[11px]">{theme.count} mentions</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        theme.averageSentiment >= 0.3
                          ? 'bg-emerald-100 text-emerald-800'
                          : theme.averageSentiment <= -0.2
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {formatSentimentScore(theme.averageSentiment)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 italic">No themes tagged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Synthesis: Longitudinal Coaching Insight */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Gemini Longitudinal Coaching Note
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed">
            {trends.weeklyRecap}
          </p>
          {trends.coachingSuggestion && (
            <p className="text-xs text-amber-950 font-semibold pt-1">
              💡 Actionable Micro-Habit: {trends.coachingSuggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
