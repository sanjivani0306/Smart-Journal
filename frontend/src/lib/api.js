const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('smart_journal_auth_token');
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}

export async function readJson(response) {
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
  if (!response.ok) {
    const message = data.detail || data.error || data.message || `Request failed (${response.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return data;
}

export function normalizeEntry(raw) {
  const analysis = raw.analysis || raw.aiAnalysis || null;
  const created = raw.created_at || raw.createdAt || new Date().toISOString();
  const updated = raw.updated_at || raw.updatedAt || created;
  return {
    id: raw.id,
    date: raw.date || created.slice(0, 10),
    title: raw.title || 'Journal Entry',
    content: raw.content || '',
    createdAt: created,
    updatedAt: updated,
    manualMood: raw.manual_mood || raw.manualMood || analysis?.mood || 'reflective',
    userReflection: raw.user_reflection || raw.userReflection || '',
    isFavorite: Boolean(raw.is_favorite ?? raw.isFavorite ?? false),
    wordCount: raw.word_count ?? raw.wordCount ?? (raw.content || '').trim().split(/\s+/).filter(Boolean).length,
    aiAnalysis: analysis ? {
      moodCategory: analysis.moodCategory || analysis.mood || 'reflective',
      sentimentScore: Number(analysis.sentimentScore ?? analysis.sentiment_score ?? 0),
      confidence: Number(analysis.confidence ?? 0),
      summary: analysis.summary || '',
      reflection: analysis.reflection || '',
      themes: analysis.themes || [],
    } : null,
  };
}
