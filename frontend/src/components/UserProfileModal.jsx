import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  Flame,
  Save,
  BookOpen,
} from 'lucide-react';

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onLogout,
  onSwitchAccount,
  totalEntries,
  streakCount,
}) {
  const [name, setName] = useState(user?.name || '');
  const [coachingTone, setCoachingTone] = useState(
    user?.preferences?.aiCoachingTone || 'empathetic'
  );
  const [reminderTime, setReminderTime] = useState(user?.preferences?.reminderTime || '20:30');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name: name.trim(),
        preferences: {
          ...user.preferences,
          aiCoachingTone: coachingTone,
          reminderTime,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="profile-modal-card"
        className="bg-white border border-stone-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header with avatar banner */}
        <div className="p-6 bg-linear-to-br from-amber-500/10 via-amber-100/30 to-stone-100 border-b border-stone-200 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {user.isDemo && (
                <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                  Demo
                </span>
              )}
            </div>

            <div>
              <h2 className="font-bold text-stone-900 text-base leading-tight">{user.name}</h2>
              <p className="text-xs text-stone-700 font-mono mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-white/80 px-2 py-0.5 rounded-md border border-stone-200/80">
                  <BookOpen className="w-3 h-3 text-stone-500" />
                  {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
                </span>
                {streakCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded-md border border-orange-200">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    {streakCount}d streak
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            id="close-profile-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {savedSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile preferences updated successfully!</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">Display Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                id="profile-name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* AI Coaching Tone Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              AI Journaling Coach Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCoachingTone('empathetic')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  coachingTone === 'empathetic'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50'
                }`}
              >
                <div className="font-semibold text-xs">Empathetic</div>
                <div className="text-[10px] text-stone-700 font-normal mt-0.5">
                  Warm & validating
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCoachingTone('socratic')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  coachingTone === 'socratic'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50'
                }`}
              >
                <div className="font-semibold text-xs">Socratic</div>
                <div className="text-[10px] text-stone-700 font-normal mt-0.5">
                  Probing questions
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCoachingTone('practical')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  coachingTone === 'practical'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50'
                }`}
              >
                <div className="font-semibold text-xs">Practical</div>
                <div className="text-[10px] text-stone-700 font-normal mt-0.5">
                  Action habits
                </div>
              </button>
            </div>
          </div>

          {/* Daily Journal Reminder */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Daily Evening Reminder Time
            </label>
            <input
              id="profile-reminder-input"
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>

        {/* Footer Actions (Account switching & Logout) */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
          <button
            id="switch-account-btn"
            type="button"
            onClick={() => {
              onClose();
              onSwitchAccount();
            }}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline cursor-pointer"
          >
            Switch Account / Sign In
          </button>

          <button
            id="logout-btn"
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
