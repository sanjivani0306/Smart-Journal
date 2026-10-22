import React, { useState, useEffect } from 'react';
import { ALL_MOODS, getMoodDetails, JOURNAL_PROMPT_STARTERS, formatSentimentScore } from '../lib/moods';
import { useAuth } from '../context/AuthContext';
import { readJson } from '../lib/api';
import {
  Sparkles,
  Save,
  Calendar as CalendarIcon,
  Smile,
  Mic,
  MicOff,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Tag,
  BookOpen,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';

export function JournalEditor({ initialDate, initialEntry, onSave, onCancel }) {
  const { authFetch } = useAuth();
  const [date, setDate] = useState(
    initialEntry?.date || initialDate || new Date().toISOString().split('T')[0]
  );
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [manualMood, setManualMood] = useState(initialEntry?.manualMood);
  const [userReflection, setUserReflection] = useState(initialEntry?.userReflection || '');
  const [isFavorite] = useState(initialEntry?.isFavorite || false);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState(initialEntry?.aiAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setContent(prev => (prev ? prev + ' ' + transcript.trim() : transcript.trim()));
        }
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Run AI Mood & Theme analysis
  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Please write some content first before analyzing with AI.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // The current FastAPI API performs AI analysis as part of POST /journal.
      // Keep the editor preview responsive and let the save request persist the real analysis.
      setAiAnalysis({
        moodCategory: manualMood || 'reflective',
        sentimentScore: 0,
        confidence: 0,
        themes: [],
        summary: 'AI analysis will be generated when this entry is saved.',
        reflection: 'Save the entry to run the backend AI analysis.',
      });
    } catch (err) {
      console.error('Error analyzing entry:', err);
      setError('Could not run AI analysis. The entry will still be saved successfully.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Journal content cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        date,
        title: title.trim() || `Journal Entry — ${date}`,
        content,
        manualMood,
        aiAnalysis,
        userReflection,
        isFavorite,
        wordCount: content.split(/\s+/).filter(Boolean).length,
      });
    } catch (err) {
      console.error('Error saving:', err);
      setError(err.message || 'Failed to save entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            {initialEntry ? 'Edit Journal Entry' : 'Daily Reflection & Entry'}
          </h2>
          <p className="text-xs text-stone-700 mt-0.5">
            Express your thoughts freely • AI extracts sentiment, behavioral patterns, and coaching reflections
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || !content.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : initialEntry ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout: Editor Column + AI Intelligence Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Writing Space (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Metadata Row: Date & Declared Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-stone-500" /> Entry Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-stone-500" /> Feeling (Optional Self-Check)
              </label>
              <select
                value={manualMood || ''}
                onChange={e => setManualMood(e.target.value || undefined)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value="">Let AI detect automatically</option>
                {ALL_MOODS.map(m => (
                  <option key={m} value={m}>
                    {getMoodDetails(m).emoji} {getMoodDetails(m).label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Title or focal theme for today..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
            />
          </div>

          {/* Quick Prompt Starters Accordion / Pills */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Need Inspiration? Try a Prompt:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {JOURNAL_PROMPT_STARTERS.map((ps, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const addition = `\n\n**${ps.prompt}**\n`;
                    setContent(prev => (prev ? prev + addition : ps.prompt + '\n'));
                  }}
                  className="text-[11px] font-medium bg-white hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-amber-200/80 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer"
                >
                  {ps.category}
                </button>
              ))}
            </div>
          </div>

          {/* Journal Textarea */}
          <div className="relative">
            <textarea
              rows={12}
              placeholder="What happened today? How did you feel, what stimulated you, or what drained your energy? Write without self-censorship..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-xs sm:text-sm text-stone-800 leading-relaxed placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs resize-y"
            />

            {/* Bottom Bar inside editor: Word count & Voice input */}
            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-700 px-1">
              <div className="flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>~{readTimeMinutes} min read</span>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3 h-3 text-red-600" /> Recording Voice...
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 text-stone-500" /> Voice Journal
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Trigger AI Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Detecting Mood & Themes...' : 'Extract AI Mood & Themes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Real-Time Intelligence Card (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    AI Emotion & Theme Analysis
                  </h3>
                  <span className="text-[11px] text-stone-700">Powered by Gemini 3.7 Flash</span>
                </div>
              </div>

              {aiAnalysis && (
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Analyzed
                </span>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-4 text-xs">
                {/* Sentiment & Mood Badge */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-stone-700">Detected Mood</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-lg">{getMoodDetails(aiAnalysis.moodCategory).emoji}</span>
                      <span className="font-bold text-stone-900 capitalize text-sm">
                        {aiAnalysis.moodCategory}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-stone-700">Sentiment Score</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm text-stone-900">
                        {formatSentimentScore(aiAnalysis.sentimentScore)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          aiAnalysis.sentimentScore >= 0.3
                            ? 'bg-emerald-50 text-emerald-700'
                            : aiAnalysis.sentimentScore <= -0.2
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {aiAnalysis.sentimentLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emotion Intensity Bars */}
                {aiAnalysis.emotions && aiAnalysis.emotions.length > 0 && (
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-stone-700 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-indigo-500" /> Emotional Spectrum
                    </span>
                    <div className="space-y-1.5 pt-1">
                      {aiAnalysis.emotions.map((emo, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] font-medium text-stone-700">
                            <span>{emo.emotion}</span>
                            <span className="text-stone-700">{emo.intensity}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(10, emo.intensity))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Themes */}
                {aiAnalysis.themes && aiAnalysis.themes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-stone-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-stone-500" /> Extracted Themes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysis.themes.map((theme, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-stone-800 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-2xs"
                        >
                          #{theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                {aiAnalysis.summary && (
                  <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                    <span className="text-[10px] uppercase font-bold text-stone-700">AI Core Summary</span>
                    <p className="text-[11px] text-stone-800 mt-1 leading-relaxed italic">
                      "{aiAnalysis.summary}"
                    </p>
                  </div>
                )}

                {/* Key Takeaways & Cognitive Insights */}
                {aiAnalysis.keyTakeaways && aiAnalysis.keyTakeaways.length > 0 && (
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-900">Key Observation</span>
                    <ul className="list-disc list-inside text-[11px] text-stone-800 space-y-1 pt-0.5">
                      {aiAnalysis.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reflection Prompt & Interactive Response */}
                {aiAnalysis.reflectionPrompt && (
                  <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-900 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Deep Reflection Prompt
                    </span>
                    <p className="text-[11px] font-medium text-indigo-950 leading-relaxed">
                      "{aiAnalysis.reflectionPrompt}"
                    </p>

                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Your reflective answer (optional)..."
                        value={userReflection}
                        onChange={e => setUserReflection(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-stone-700 max-w-xs mx-auto">
                  Write your daily journal entry and click <strong className="text-stone-900">"Extract AI Mood & Themes"</strong> or save to trigger real-time psychological analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
