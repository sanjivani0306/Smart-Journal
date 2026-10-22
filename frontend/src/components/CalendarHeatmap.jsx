import { useState, useMemo } from 'react';
import { getMoodDetails, getSentimentHeatmapColor, formatSentimentScore, ALL_MOODS } from '../lib/moods';
import { Calendar, Flame, Plus } from 'lucide-react';

export function CalendarHeatmap({ entries, onSelectEntry, onNewEntryForDate, streakCount }) {
  const [rangeMonths, setRangeMonths] = useState(6);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');
  const [hoveredDay, setHoveredDay] = useState(null);

  // Map entries by date YYYY-MM-DD
  const entriesByDate = useMemo(() => {
    const map = new Map();
    entries.forEach(e => {
      // If multiple entries on same date, prefer the latest or most detailed
      if (!map.has(e.date) || (e.aiAnalysis && !map.get(e.date)?.aiAnalysis)) {
        map.set(e.date, e);
      }
    });
    return map;
  }, [entries]);

  // Generate grid of weeks ending today
  const { weeks, monthLabels, totalDaysCount, activeDaysCount } = useMemo(() => {
    const today = new Date();
    const daysToSubtract = rangeMonths * 30.5;
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysToSubtract);

    // Adjust start date to previous Sunday
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const generatedWeeks = [];
    const months = [];
    let currentWeek = [];
    let lastMonth = -1;

    const cur = new Date(startDate);
    let totalDays = 0;
    let activeDays = 0;

    while (cur <= today || currentWeek.length > 0) {
      const dateStr = cur.toISOString().split('T')[0];
      const entry = entriesByDate.get(dateStr);

      if (cur <= today) {
        totalDays++;
        if (entry) activeDays++;
      }

      currentWeek.push({
        date: new Date(cur),
        dateStr,
        entry,
      });

      if (currentWeek.length === 7) {
        const firstDayOfMonth = currentWeek[0].date.getMonth();
        if (firstDayOfMonth !== lastMonth) {
          months.push({
            name: currentWeek[0].date.toLocaleString('default', { month: 'short' }),
            weekIndex: generatedWeeks.length,
          });
          lastMonth = firstDayOfMonth;
        }
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      cur.setDate(cur.getDate() + 1);

      // Stop once we surpass today and finished the 7-day week
      if (cur > today && currentWeek.length === 0) {
        break;
      }
    }

    return {
      weeks: generatedWeeks,
      monthLabels: months,
      totalDaysCount: totalDays,
      activeDaysCount: activeDays,
    };
  }, [rangeMonths, entriesByDate]);

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 md:p-6 shadow-xs relative">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-base tracking-tight flex items-center gap-2">
              Mood Rhythm & Activity Heatmap
              {streakCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  {streakCount} Day Streak
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-700 mt-0.5">
              {activeDaysCount} entries logged across the last {rangeMonths} months • GitHub-style daily sentiment intensity
            </p>
          </div>
        </div>

        {/* Range & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Mood Filter Dropdown */}
          <div className="relative">
            <select
              aria-label="Filter by mood"
              value={selectedMoodFilter}
              onChange={e => setSelectedMoodFilter(e.target.value)}
              className="text-xs font-medium bg-stone-50 border border-stone-200 text-stone-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Moods</option>
              {ALL_MOODS.map(m => (
                <option key={m} value={m}>
                  {getMoodDetails(m).emoji} {getMoodDetails(m).label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Pills */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs font-medium text-stone-600">
            {[3, 6, 12].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setRangeMonths(m)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  rangeMonths === m
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="mt-5 overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-fit flex flex-col">
          {/* Month Labels */}
          <div className="flex pl-8 mb-1.5 text-[11px] font-medium text-stone-700 select-none">
            {weeks.map((week, idx) => {
              const monthMatch = monthLabels.find(m => m.weekIndex === idx);
              return (
                <div key={idx} className="w-3.5 mr-1 text-left">
                  {monthMatch ? <span className="whitespace-nowrap">{monthMatch.name}</span> : null}
                </div>
              );
            })}
          </div>

          {/* Day of Week Labels + 7-Row Grid */}
          <div className="flex">
            {/* Day Labels Column */}
            <div className="flex flex-col justify-between pr-2 text-[10px] font-medium text-stone-700 select-none py-0.5">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const isToday = new Date().toISOString().split('T')[0] === day.dateStr;
                    const isFuture = day.date > new Date();
                    const hasEntry = !!day.entry;
                    const entry = day.entry;
                    const mood = entry?.aiAnalysis?.moodCategory || entry?.manualMood;
                    const score = entry?.aiAnalysis?.sentimentScore;

                    // Apply mood filter
                    const matchesFilter =
                      selectedMoodFilter === 'all' ||
                      (hasEntry && mood === selectedMoodFilter);

                    const cellBg = isFuture
                      ? 'bg-transparent border-dashed border-stone-100 opacity-20'
                      : !hasEntry
                      ? 'bg-stone-100/90 border-stone-200/60 hover:border-stone-400'
                      : matchesFilter
                      ? getSentimentHeatmapColor(score, mood)
                      : 'bg-stone-100 opacity-40 border-stone-200';

                    return (
                      <button
                        key={dayIdx}
                        type="button"
                        onClick={() => {
                          if (isFuture) return;
                          if (entry) {
                            onSelectEntry(entry);
                          } else {
                            onNewEntryForDate(day.dateStr);
                          }
                        }}
                        onMouseEnter={e => {
                          if (isFuture) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            dateStr: day.dateStr,
                            entry,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3.5 h-3.5 rounded-[3.5px] border transition-transform hover:scale-125 focus:outline-none cursor-pointer ${cellBg} ${
                          isToday ? 'ring-1.5 ring-amber-500 ring-offset-1' : ''
                        }`}
                        title={`${day.dateStr}${entry ? `: ${entry.title} (${mood})` : ' (No entry)'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Summary Row */}
      <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-700">Sentiment Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-600">Challenging</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-rose-500 border border-rose-600/30" title="Challenging / Low" />
              <span className="w-3 h-3 rounded-xs bg-orange-400 border border-orange-500/30" title="Anxious / Restless" />
              <span className="w-3 h-3 rounded-xs bg-stone-300 border border-stone-400/30" title="Neutral" />
              <span className="w-3 h-3 rounded-xs bg-sky-400 border border-sky-500/30" title="Calm" />
              <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-600/30" title="High Positivity / Energetic" />
              <span className="w-3 h-3 rounded-xs bg-amber-400 border border-amber-500/30" title="Joyful / Radiant" />
            </div>
            <span className="text-[11px] text-stone-600">Joyful</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-stone-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Positive ({entries.filter(e => (e.aiAnalysis?.sentimentScore ?? 0) > 0.2).length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
            Neutral ({entries.filter(e => Math.abs(e.aiAnalysis?.sentimentScore ?? 0) <= 0.2).length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            Challenging ({entries.filter(e => (e.aiAnalysis?.sentimentScore ?? 0) < -0.2).length})
          </span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2.5 w-64 bg-stone-900/95 text-white text-xs rounded-xl p-3 shadow-xl backdrop-blur-xs border border-stone-700/60 transition-all duration-100"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 8}px`,
          }}
        >
          <div className="flex items-center justify-between border-b border-stone-700/60 pb-1.5 mb-1.5">
            <span className="font-semibold text-stone-200">
              {new Date(hoveredDay.dateStr + 'T12:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {hoveredDay.entry?.aiAnalysis?.sentimentScore !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  hoveredDay.entry.aiAnalysis.sentimentScore >= 0.3
                    ? 'bg-emerald-900/80 text-emerald-300'
                    : hoveredDay.entry.aiAnalysis.sentimentScore <= -0.2
                    ? 'bg-rose-900/80 text-rose-300'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {formatSentimentScore(hoveredDay.entry.aiAnalysis.sentimentScore)}
              </span>
            )}
          </div>

          {hoveredDay.entry ? (
            <div className="space-y-1.5">
              <p className="font-medium text-amber-300 truncate">{hoveredDay.entry.title}</p>
              {hoveredDay.entry.aiAnalysis && (
                <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
                  <span>{getMoodDetails(hoveredDay.entry.aiAnalysis.moodCategory).emoji}</span>
                  <span className="font-semibold capitalize text-stone-200">
                    {hoveredDay.entry.aiAnalysis.moodCategory}
                  </span>
                  <span>•</span>
                  <span className="text-stone-400">{hoveredDay.entry.wordCount} words</span>
                </div>
              )}
              {hoveredDay.entry.aiAnalysis?.summary && (
                <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed italic">
                  "{hoveredDay.entry.aiAnalysis.summary}"
                </p>
              )}
              <p className="text-[10px] text-amber-400/90 pt-1 font-medium">Click to view full entry & reflection →</p>
            </div>
          ) : (
            <div>
              <p className="text-stone-400 italic">No journal entry recorded.</p>
              <p className="text-[10px] text-amber-400 pt-1 font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Click to write entry for this date
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
