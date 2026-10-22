import {
  Heart,
  Calendar,
  PenTool,
  TrendingUp,
  MessageSquare,
  Flame,
  Plus,
  RefreshCw,
  LogIn,
  Music,
} from 'lucide-react';

export function Navbar({
  activeTab,
  onTabChange,
  streakCount,
  totalEntries,
  onNewEntry,
  onResetSeed,
  isResetting,
  user,
  onOpenAuth,
  onOpenProfile,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              type="button"
              onClick={() => onTabChange('timeline')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-stone-900 text-base tracking-tight leading-tight">
                    Smart Journal
                  </h1>

                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    AI
                  </span>
                </div>

                <p className="text-[9px] text-stone-700 leading-none mt-0.5 hidden sm:block">
                  Mood Heatmap • Pattern Extraction • Reflections
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 text-xs font-semibold text-stone-600">

            <button
              id="nav-tab-timeline"
              type="button"
              onClick={() => onTabChange('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Journal & Heatmap
            </button>

            <button
              id="nav-tab-write"
              type="button"
              onClick={() => onTabChange('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Write
            </button>

            <button
              id="nav-tab-trends"
              type="button"
              onClick={() => onTabChange('trends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Patterns & Trends
            </button>

            <button
              id="nav-tab-chat"
              type="button"
              onClick={() => onTabChange('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              AI Companion
            </button>

            <button
              id="nav-tab-music"
              type="button"
              onClick={() => onTabChange('music')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'music'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-amber-500" />
              Music & Ambience
            </button>

          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {streakCount > 0 && (
              <div
                className="flex items-center gap-1 bg-orange-50 border border-orange-200/80 text-orange-800 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs"
                title={`${streakCount} consecutive days with journal entries`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>{streakCount}d</span>
              </div>
            )}

            <button
              id="nav-reset-seed-btn"
              type="button"
              onClick={onResetSeed}
              disabled={isResetting}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Reset with 60-day realistic sample entries"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isResetting ? 'animate-spin' : ''
                }`}
              />
              Reset Sample Data
            </button>

            <button
              id="nav-write-entry-btn"
              type="button"
              onClick={onNewEntry}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />

              <span className="hidden sm:inline">
                Write Entry
              </span>

              <span className="sm:hidden">
                Write
              </span>
            </button>

            {/* Auth / User Profile Button */}
            {user ? (
              <button
                id="user-profile-button"
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-white transition-all cursor-pointer shadow-2xs"
                title={`Logged in as ${user.name} (${user.email})`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-amber-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-stone-900 leading-none">
                    {user.name.split(' ')[0]}
                  </div>

                  <div className="text-[10px] text-stone-700 leading-none mt-0.5">
                    {user.isDemo ? 'Demo' : 'Account'}
                  </div>
                </div>
              </button>
            ) : (
              <button
                id="login-button"
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-600" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-stone-100 scrollbar-none text-xs font-semibold text-stone-600">

          <button
            type="button"
            onClick={() => onTabChange('timeline')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-stone-900 text-white'
                : 'hover:bg-stone-100'
            }`}
          >
            Journal
          </button>

          <button
            type="button"
            onClick={() => onTabChange('write')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'write'
                ? 'bg-stone-900 text-white'
                : 'hover:bg-stone-100'
            }`}
          >
            Write
          </button>

          <button
            type="button"
            onClick={() => onTabChange('trends')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-stone-900 text-white'
                : 'hover:bg-stone-100'
            }`}
          >
            Patterns
          </button>

          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-stone-900 text-white'
                : 'hover:bg-stone-100'
            }`}
          >
            AI Companion
          </button>

          <button
            type="button"
            onClick={() => onTabChange('music')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'music'
                ? 'bg-stone-900 text-white'
                : 'hover:bg-stone-100'
            }`}
          >
            Music
          </button>

        </div>
      </div>
    </header>
  );
}