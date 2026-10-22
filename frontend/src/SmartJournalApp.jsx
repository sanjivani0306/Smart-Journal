import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CalendarHeatmap } from './components/CalendarHeatmap';
import { JournalFeed } from './components/JournalFeed';
import { JournalEditor } from './components/JournalEditor';
import { EntryViewer } from './components/EntryViewer';
import { TrendsAndPatterns } from './components/TrendsAndPatterns';
import { ReflectionCompanion } from './components/ReflectionCompanion';
import { MusicLounge } from './components/MusicLounge';
import { MiniAudioPlayer } from './components/MiniAudioPlayer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiFetch, readJson, normalizeEntry } from './lib/api';
import {
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';

function JournalAppContent() {
  const { user, authFetch, login, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('timeline');
  const [entries, setEntries] = useState([]);
  const [isResetting, setIsResetting] = useState(false);

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Active viewing/editing state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [customWriteDate, setCustomWriteDate] = useState(undefined);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch entries from backend for active user
  const fetchEntries = useCallback(async () => {
    try {
      const res = await authFetch('/journal');
      const data = await readJson(res);
      const rawEntries = Array.isArray(data) ? data : (data.entries || []);
      setEntries(rawEntries.map(normalizeEntry));
    } catch (err) {
      console.error('Error loading entries:', err);
      showToast('Could not load entries from server.', 'error');
    }
  }, [authFetch]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user?.id, fetchEntries]);

  // Compute Streak
  const streakCount = (() => {
    if (!entries.length) return 0;
    const uniqueDates = Array.from(new Set(entries.map(e => e.date))).sort();
    const todayStr = new Date().toISOString().split('T')[0];
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split('T')[0];

    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yestStr)) {
      return 0;
    }

    let check = uniqueDates.includes(todayStr) ? new Date() : yest;
    let s = 0;
    while (true) {
      const dStr = check.toISOString().split('T')[0];
      if (uniqueDates.includes(dStr)) {
        s++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return s;
  })();

  // Handle Save (Create or Update)
  const handleSaveEntry = async (entryData) => {
    if (editingEntry) {
      // Update
      const res = await authFetch(`/journal/${editingEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entryData.title, content: entryData.content }),
      });
      if (!res.ok) throw new Error('Failed to update entry');
      const data = await readJson(res);
      const updated = normalizeEntry(data.entry || data);
      setEntries(prev => prev.map(e => (e.id === editingEntry.id ? updated : e)));
      setEditingEntry(null);
      showToast('Journal entry updated with AI analysis!', 'success');
      setActiveTab('timeline');
    } else {
      // Create
      const res = await authFetch('/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });
      if (!res.ok) throw new Error('Failed to create entry');
      const data = await readJson(res);
      const created = normalizeEntry(data.entry || data);
      setEntries(prev => [created, ...prev]);
      showToast('New entry saved & sentiment analyzed!', 'success');
      setActiveTab('timeline');
    }
    setCustomWriteDate(undefined);
  };

  // Handle Delete
  const handleDeleteEntry = async (id) => {
    try {
      const res = await authFetch(`/journal/${id}`, { method: 'DELETE' });
      await readJson(res);
      setEntries(prev => prev.filter(e => e.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
      showToast('Entry deleted successfully.', 'info');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete entry.', 'error');
    }
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = async (entry) => {
    try {
      const updatedFav = !entry.isFavorite;
      // Favorites are a frontend-only preference because the current FastAPI model does not persist one.
      const updated = { ...entry, isFavorite: updatedFav };
      setEntries(prev => prev.map(e => (e.id === entry.id ? updated : e)));
      if (selectedEntry?.id === entry.id) setSelectedEntry(updated);
      const favorites = JSON.parse(localStorage.getItem('smart_journal_favorites') || '{}');
      favorites[entry.id] = updatedFav;
      localStorage.setItem('smart_journal_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  // Handle Seed / Reset
  const handleResetSeed = async () => {
    showToast('Sample-data reset is not available in the current FastAPI backend.', 'info');
  };

  const handleAuthSuccess = (authData) => {
    login(authData);
    const displayName = authData.name || authData.user?.name || authData.email?.split('@')[0] || 'there';
    showToast(`Welcome, ${displayName}!`, 'success');
    setTimeout(fetchEntries, 0);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-stone-900 text-white border-stone-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-stone-800 text-stone-100 border-stone-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => {
          if (tab === 'write') {
            setEditingEntry(null);
            setCustomWriteDate(undefined);
          }
          setActiveTab(tab);
        }}
        streakCount={streakCount}
        totalEntries={entries.length}
        onNewEntry={() => {
          setEditingEntry(null);
          setCustomWriteDate(undefined);
          setActiveTab('write');
        }}
        onResetSeed={handleResetSeed}
        isResetting={isResetting}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Demo Account Indicator Banner (if using demo mode) */}
      {user?.isDemo && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-stone-100 border-b border-amber-200/60 py-2 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-amber-950 font-medium">
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Exploring as <strong className="font-bold">{user.name}</strong> (Demo Mode with 60 entries).
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
              >
                Sign In to Your Own Account →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Tab 1: Timeline & Calendar Heatmap */}
        {activeTab === 'timeline' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* GitHub-style Calendar Heatmap */}
            <CalendarHeatmap
              entries={entries}
              streakCount={streakCount}
              onSelectEntry={entry => setSelectedEntry(entry)}
              onNewEntryForDate={dateStr => {
                setCustomWriteDate(dateStr);
                setEditingEntry(null);
                setActiveTab('write');
              }}
            />

            {/* Main Journal Feed */}
            <JournalFeed
              entries={entries}
              onSelectEntry={entry => setSelectedEntry(entry)}
              onNewEntry={() => {
                setEditingEntry(null);
                setCustomWriteDate(undefined);
                setActiveTab('write');
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* Tab 2: Write / Edit Entry */}
        {activeTab === 'write' && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs animate-in fade-in duration-150">
            <JournalEditor
              initialDate={customWriteDate}
              initialEntry={editingEntry}
              onSave={handleSaveEntry}
              onCancel={() => {
                setEditingEntry(null);
                setCustomWriteDate(undefined);
                setActiveTab('timeline');
              }}
            />
          </div>
        )}

        {/* Tab 3: Patterns & Mood Trends */}
        {activeTab === 'trends' && (
          <div className="animate-in fade-in duration-150">
            <TrendsAndPatterns onRefresh={fetchEntries} entries={entries} />
          </div>
        )}

        {/* Tab 4: AI Reflection Companion */}
        {activeTab === 'chat' && (
          <div className="animate-in fade-in duration-150">
            <ReflectionCompanion entries={entries} selectedEntry={selectedEntry} />
          </div>
        )}

        {activeTab === 'music' && (
          <div className="animate-in fade-in duration-150">
            <MusicLounge latestMood={entries[0]?.manualMood || entries[0]?.aiAnalysis?.moodCategory || 'reflective'} />
          </div>
        )}

      </main>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <EntryViewer
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={entry => {
            setSelectedEntry(null);
            setEditingEntry(entry);
            setActiveTab('write');
          }}
          onDelete={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Auth Modal (Sign In / Register / Demo) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Profile Modal */}
      {user && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onUpdateProfile={updateUser}
          onLogout={() => {
            logout();
            showToast('Signed out successfully.', 'info');
            fetchEntries();
          }}
          onSwitchAccount={() => {
            setIsProfileModalOpen(false);
            setIsAuthModalOpen(true);
          }}
          totalEntries={entries.length}
          streakCount={streakCount}
        />
      )}

      <MiniAudioPlayer onOpenMusicTab={() => setActiveTab('music')} />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-700">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <span>Smart Journal & Diary App</span>
            <span>•</span>
            <span className="text-stone-700">AI-powered mood insights & reflections</span>
          </p>
          <div className="flex items-center gap-4 text-stone-700">
            <button
              type="button"
              onClick={handleResetSeed}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Reset 60-Day Sample Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default JournalAppContent;
