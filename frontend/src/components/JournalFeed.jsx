import { useState, useMemo } from 'react';
import { getMoodDetails, formatSentimentScore, ALL_MOODS } from '../lib/moods';
import {
  Search,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Plus,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

export function JournalFeed({
  entries,
  onSelectEntry,
  onNewEntry,
  onToggleFavorite,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('all');

  // Extract all unique themes from entries
  const allThemes = useMemo(() => {
    const set = new Set();
    entries.forEach(e => {
      e.aiAnalysis?.themes?.forEach(t => set.add(t));
      e.tags?.forEach(t => set.add(t));
    });
    return Array.from(set).sort();
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesContent = e.content.toLowerCase().includes(q);
        const matchesSummary = e.aiAnalysis?.summary?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesSummary) return false;
      }

      // Mood
      if (selectedMood !== 'all') {
        const entryMood = e.aiAnalysis?.moodCategory || e.manualMood;
        if (entryMood !== selectedMood) return false;
      }

      // Theme
      if (selectedTheme !== 'all') {
        const hasTheme =
          e.aiAnalysis?.themes?.some(t => t.toLowerCase() === selectedTheme.toLowerCase()) ||
          e.tags?.some(t => t.toLowerCase() === selectedTheme.toLowerCase());
        if (!hasTheme) return false;
      }

      // Favorite
      if (onlyFavorites && !e.isFavorite) return false;

      return true;
    });
  }, [entries, searchQuery, selectedMood, selectedTheme, onlyFavorites]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entries, keywords, thoughts, or emotions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Mood Filter */}
          <select
            aria-label="Filter entries by mood"
            value={selectedMood}
            onChange={e => setSelectedMood(e.target.value)}
            className="text-xs font-medium bg-stone-50 border border-stone-200 text-stone-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Moods</option>
            {ALL_MOODS.map(m => (
              <option key={m} value={m}>
                {getMoodDetails(m).emoji} {getMoodDetails(m).label}
              </option>
            ))}
          </select>

          {/* Theme Filter */}
          {allThemes.length > 0 && (
            <select
              aria-label="Filter entries by theme"
              value={selectedTheme}
              onChange={e => setSelectedTheme(e.target.value)}
              className="text-xs font-medium bg-stone-50 border border-stone-200 text-stone-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-37.5 truncate"
            >
              <option value="all">All Themes</option>
              {allThemes.map(t => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          )}

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => setOnlyFavorites(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              onlyFavorites
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
            Favorites
          </button>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-700 pt-1 border-t border-stone-100">
          <span>
            Showing <strong className="text-stone-900">{filteredEntries.length}</strong> of {entries.length} journal entries
          </span>
          {(searchQuery || selectedMood !== 'all' || selectedTheme !== 'all' || onlyFavorites) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMood('all');
                setSelectedTheme('all');
                setOnlyFavorites(false);
              }}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-3.5">
          {filteredEntries.map(entry => {
            const mood = entry.aiAnalysis?.moodCategory || entry.manualMood || 'reflective';
            const moodConfig = getMoodDetails(mood);
            const score = entry.aiAnalysis?.sentimentScore;

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="bg-white border border-stone-200/90 hover:border-amber-400/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Metadata & Title */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Mood Pill */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${moodConfig.bgLight} ${moodConfig.textColor} border ${moodConfig.borderLight}`}
                      >
                        <span>{moodConfig.emoji}</span>
                        <span className="capitalize">{moodConfig.label}</span>
                      </span>

                      {/* Sentiment score pill */}
                      {score !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            score >= 0.3
                              ? 'bg-emerald-100 text-emerald-800'
                              : score <= -0.2
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          Sentiment {formatSentimentScore(score)}
                        </span>
                      )}

                      {/* Date */}
                      <span className="text-xs text-stone-700 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      {entry.time && (
                        <span className="text-xs text-stone-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-500" />
                          {entry.time}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors pt-0.5">
                      {entry.title}
                    </h3>
                  </div>

                  {/* Right Action: Favorite */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onToggleFavorite(entry);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        entry.isFavorite
                          ? 'bg-amber-50 text-amber-600 border-amber-300'
                          : 'bg-transparent text-stone-400 border-transparent hover:border-stone-200 hover:text-stone-600'
                      }`}
                      title={entry.isFavorite ? 'Favorited' : 'Favorite'}
                    >
                      <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Content Snippet / Summary */}
                <div className="mt-2.5">
                  <p className="text-xs sm:text-sm text-stone-700 line-clamp-2 leading-relaxed font-sans">
                    {entry.aiAnalysis?.summary || entry.content}
                  </p>
                </div>

                {/* Bottom Footer: Themes & Reflection indicator */}
                <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Themes */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {entry.aiAnalysis?.themes?.slice(0, 3).map((theme, idx) => (
                      <span
                        key={idx}
                        className="bg-stone-50 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md text-[10px] font-medium"
                      >
                        #{theme}
                      </span>
                    ))}
                    {entry.wordCount > 0 && (
                      <span className="text-[11px] text-stone-700 ml-1 font-medium">
                        • {entry.wordCount} words
                      </span>
                    )}
                  </div>

                  {/* View Details Prompt */}
                  <span className="text-[11px] font-semibold text-stone-700 group-hover:text-amber-800 flex items-center gap-1 transition-colors">
                    {entry.aiAnalysis?.reflectionPrompt ? (
                      <span className="flex items-center gap-1 text-indigo-700">
                        <MessageSquare className="w-3 h-3" /> Reflection Ready
                      </span>
                    ) : (
                      'View Entry'
                    )}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-stone-900">No Journal Entries Found</h3>
            <p className="text-xs text-stone-700 max-w-sm mx-auto">
              {searchQuery || selectedMood !== 'all' || selectedTheme !== 'all'
                ? 'Try adjusting your search filters or clear them to see all diary entries.'
                : 'Write your first journal entry to kick off your daily AI mood tracking.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onNewEntry}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Write New Entry
          </button>
        </div>
      )}
    </div>
  );
}
