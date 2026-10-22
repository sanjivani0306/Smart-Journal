import React, { useState } from 'react';
import { apiFetch, readJson } from '../lib/api';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Zap,
} from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
}) {
  const [tab, setTab] = useState(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [includeSampleData, setIncludeSampleData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await readJson(res);

      onAuthSuccess({ ...data, email });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await readJson(res);

      onAuthSuccess({ ...data, email: email.trim(), name: name.trim() || email.trim().split('@')[0] });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setErrorMessage('Demo login is not enabled in the current FastAPI backend. Create an account or sign in instead.');
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="auth-modal-card"
        className="bg-white border border-stone-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base leading-tight">
                {tab === 'signin'
                  ? 'Welcome Back'
                  : tab === 'signup'
                  ? 'Create Your Journal'
                  : 'Instant Access'}
              </h2>
              <p className="text-xs text-stone-700 leading-tight mt-0.5">
                {tab === 'signin'
                  ? 'Sign in to access your mood analytics & reflections'
                  : tab === 'signup'
                  ? 'Start logging your daily entries and tracking sentiment'
                  : 'Explore pre-configured accounts with longitudinal data'}
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1.5 mx-6 mt-4 bg-stone-100 rounded-2xl border border-stone-200/70 text-xs font-semibold text-stone-600">
          <button
            id="tab-signin-btn"
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-signup-btn"
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
          <button
            id="tab-demo-btn"
            type="button"
            onClick={() => {
              setTab('demo');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
              tab === 'demo'
                ? 'bg-white text-amber-900 shadow-xs font-bold'
                : 'hover:text-amber-800'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            1-Click Demo
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-800 font-medium animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* TAB 1: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="signin-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">Password</label>
                  <span className="text-[11px] text-stone-700">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="signin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="submit-signin-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Smart Journal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Demo Credentials Quick Fill */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-700">
                <span>Demo account credentials:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@smartjournal.ai');
                    setPassword('demo123');
                  }}
                  className="font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  Auto-fill Demo
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Create Account */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">Your Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700">Password</label>
                  <div className="relative">
                    <input
                      id="signup-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700">Confirm</label>
                  <div className="relative">
                    <input
                      id="signup-confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSampleData}
                  onChange={e => setIncludeSampleData(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs text-stone-700">
                  <strong className="text-stone-900 font-semibold">
                    Include 14-day sample journal entries
                  </strong>{' '}
                  to immediately preview the GitHub-style mood heatmap and pattern recognition.
                </span>
              </label>

              <button
                id="submit-signup-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Start Journaling</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: 1-Click Demo Accounts */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <div
                onClick={() => handleQuickDemoLogin('demo')}
                className="p-4 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-xs group-hover:text-amber-950">
                      Alex Rivera (Demo Account)
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      60 Entries
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Pre-populated with 2 months of entries, multi-theme emotional arcs, streak tracking,
                    and personalized reflective coach chats.
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleQuickDemoLogin('guest')}
                className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-xs">Guest Explorer (Clean Slate)</h3>
                    <span className="text-[10px] font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                      7 Starter Entries
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    A fresh guest space with 1 week of starter entries. Ideal for quickly trying out your own new journal logs.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-100/80 rounded-xl text-[11px] text-stone-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sessions are securely kept in local storage and authenticated on the server.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
