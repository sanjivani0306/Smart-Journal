import { getMoodDetails, formatSentimentScore } from '../lib/moods';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Tag,
  Star,
  Edit,
  Trash2,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

export function EntryViewer({
  entry,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) {
  const mood = entry.aiAnalysis?.moodCategory || entry.manualMood || 'reflective';
  const moodConfig = getMoodDetails(mood);
  const score = entry.aiAnalysis?.sentimentScore;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between gap-4 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-white rounded-2xl border border-stone-200 shadow-2xs">
              {moodConfig.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  {moodConfig.label}
                </span>
                {score !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      score >= 0.3
                        ? 'bg-emerald-100 text-emerald-800'
                        : score <= -0.2
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    Sentiment: {formatSentimentScore(score)}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">{entry.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFavorite(entry)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                entry.isFavorite
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'bg-white text-stone-400 border-stone-200 hover:text-stone-700'
              }`}
              title={entry.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
              title="Edit entry"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this journal entry?')) {
                  onDelete(entry.id);
                }
              }}
              className="p-2 rounded-xl bg-white border border-stone-200 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-700 pb-3 border-b border-stone-100">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              {new Date(entry.date + 'T12:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {entry.time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                {entry.time}
              </span>
            )}
            <span>•</span>
            <span>{entry.wordCount} words</span>
          </div>

          {/* Main Journal Content */}
          <div className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {entry.content}
          </div>

          {/* AI Extracted Intelligence Card */}
          {entry.aiAnalysis && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    AI Psychological Breakdown
                  </span>
                </div>
                <span className="text-[11px] text-stone-700 font-medium">Gemini 3.7 Flash</span>
              </div>

              {/* Summary */}
              {entry.aiAnalysis.summary && (
                <div>
                  <span className="text-[11px] uppercase font-bold text-stone-700">Executive Summary</span>
                  <p className="text-xs text-stone-800 mt-0.5 leading-relaxed italic bg-white p-3 rounded-xl border border-stone-200/70">
                    "{entry.aiAnalysis.summary}"
                  </p>
                </div>
              )}

              {/* Emotions & Key Takeaways Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Emotions Spectrum */}
                {entry.aiAnalysis.emotions && entry.aiAnalysis.emotions.length > 0 && (
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200/70 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-stone-700 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-indigo-500" /> Emotional Spectrum
                    </span>
                    <div className="space-y-1.5">
                      {entry.aiAnalysis.emotions.map((emo, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] font-medium text-stone-700">
                            <span>{emo.emotion}</span>
                            <span>{emo.intensity}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.max(10, emo.intensity))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Observations */}
                {entry.aiAnalysis.keyTakeaways && entry.aiAnalysis.keyTakeaways.length > 0 && (
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200/70 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" /> Key Observations
                    </span>
                    <ul className="list-disc list-inside text-xs text-stone-700 space-y-1 pt-0.5">
                      {entry.aiAnalysis.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Themes */}
              {entry.aiAnalysis.themes && entry.aiAnalysis.themes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-stone-700 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-stone-500" /> Extracted Life Themes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.aiAnalysis.themes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-stone-800 border border-stone-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        #{theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection Prompt & User Reflection */}
              {entry.aiAnalysis.reflectionPrompt && (
                <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> AI Reflection Prompt
                  </span>
                  <p className="text-xs font-semibold text-indigo-950 leading-relaxed">
                    "{entry.aiAnalysis.reflectionPrompt}"
                  </p>
                  {entry.userReflection ? (
                    <div className="bg-white p-3 rounded-lg border border-indigo-100 mt-2">
                      <span className="text-[10px] font-bold uppercase text-stone-700 block mb-1">
                        Your Written Reflection:
                      </span>
                      <p className="text-xs text-stone-800 italic">"{entry.userReflection}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
