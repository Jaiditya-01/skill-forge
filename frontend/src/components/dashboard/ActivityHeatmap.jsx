import React, { useState, useMemo, useCallback } from 'react';
import { format, subDays, parseISO } from 'date-fns';

const PLATFORMS = [
  { key: 'GitHub',      label: 'GitHub',      fill: '#8b5cf6' },
  { key: 'LeetCode',   label: 'LeetCode',    fill: '#fbbf24' },
  { key: 'Codeforces', label: 'Codeforces',  fill: '#60a5fa' },
  { key: 'CodeChef',   label: 'CodeChef',    fill: '#34d399' },
];

const COLS = 53;
const ROWS = 7;

const buildDateMap = (unifiedMetrics, enabledPlatforms) => {
  const map = {}; 
  if (!unifiedMetrics) return map;

  unifiedMetrics.forEach(platform => {
    (platform.activity || []).forEach(({ date, value }) => {
      if (!map[date]) map[date] = { platforms: {}, totalEnabled: 0 };
      
      // Store raw platform activity unconditionally
      map[date].platforms[platform.platform] = (map[date].platforms[platform.platform] || 0) + value;
      
      // Calculate total based on what is currently filtered (enabled)
      if (enabledPlatforms.has(platform.platform)) {
         map[date].totalEnabled += value;
      }
    });
  });
  return map;
};

const buildAlignedGrid = () => {
  const grid = Array(COLS).fill(null).map(() => Array(ROWS).fill(null));
  const today = new Date();
  let latestDay = today;
  let r = latestDay.getDay();
  let c = COLS - 1;
  
  // 53 columns * 7 days = 371 days
  for (let i = 0; i < 371; i++) {
      if (c < 0) break;
      grid[c][r] = format(latestDay, 'yyyy-MM-dd');
      latestDay = subDays(latestDay, 1);
      r--;
      if (r < 0) {
          r = 6;
          c--;
      }
  }
  return grid;
};

const GRID = buildAlignedGrid();

const ActivityHeatmap = ({ unifiedMetrics }) => {
  const [enabled, setEnabled] = useState(new Set(PLATFORMS.map(p => p.key)));
  
  const togglePlatform = useCallback(key => {
    setEnabled(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const dateMap = useMemo(() => buildDateMap(unifiedMetrics, enabled), [unifiedMetrics, enabled]);

  // Determine cell color block scaling based on submission total.
  const getColorClass = (count) => {
    if (count === 0) return 'bg-white/5';
    if (count < 3) return 'bg-emerald-900';
    if (count < 6) return 'bg-emerald-700';
    if (count < 10) return 'bg-emerald-500';
    return 'bg-emerald-400';
  };

  return (
    <div className="glass-card" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            Unified Activity Heatmap
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">All platforms · Last 371 days · 2D View</p>
        </div>

        {/* Platform toggle pills */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => {
            const on = enabled.has(p.key);
            return (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200"
                style={{
                  borderColor: on ? p.fill : 'rgba(255,255,255,0.1)',
                  backgroundColor: on ? `${p.fill}22` : 'transparent',
                  color: on ? '#fff' : '#6b7280',
                  boxShadow: on ? `0 0 8px ${p.fill}66` : 'none',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: on ? p.fill : '#374151' }} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
        <div className="min-w-max flex gap-1 mx-auto justify-start md:justify-center">
          {/* Day Labels */}
          <div className="flex flex-col gap-1 pr-2 pt-[14px] text-[10px] text-gray-500 justify-between">
             <span className="h-[14px] flex items-center"></span>
             <span className="h-[14px] flex items-center">Mon</span>
             <span className="h-[14px] flex items-center"></span>
             <span className="h-[14px] flex items-center">Wed</span>
             <span className="h-[14px] flex items-center"></span>
             <span className="h-[14px] flex items-center">Fri</span>
             <span className="h-[14px] flex items-center"></span>
          </div>

          {/* Grid columns */}
          {GRID.map((col, cIdx) => {
             // To easily skip months without recalculating
             const isFirstInMonth = col.find(d => d && parseISO(d).getDate() <= 7);
             return (
               <div key={cIdx} className="flex flex-col gap-1 relative group">
                  {col.map((dateStr, rIdx) => {
                    if (!dateStr) return <div key={rIdx} className="w-[14px] h-[14px] transparent" />;

                    const dayData = dateMap[dateStr] || { platforms: {}, totalEnabled: 0 };
                    
                    // User requested a fire symbol if there's at least 1 contribution in ALL platforms
                    const activePlatformKeys = Object.keys(dayData.platforms).filter(k => dayData.platforms[k] > 0);
                    const hasAll = activePlatformKeys.length === PLATFORMS.length;

                    return (
                      <div 
                        key={dateStr}
                        className={`w-[14px] h-[14px] rounded-sm relative group/cell cursor-pointer transition-colors ${getColorClass(dayData.totalEnabled)}`}
                      >
                        {hasAll && (
                          <span className="absolute -top-2 -right-1 z-10 text-[11px] animate-pulse drop-shadow-md pointer-events-none">🔥</span>
                        )}

                        {/* Tooltip */}
                        <div className="absolute opacity-0 group-hover/cell:opacity-100 z-[60] pointer-events-none bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e2330] border border-white/10 rounded-lg p-3 shadow-xl whitespace-nowrap transition-opacity duration-200 min-w-[160px]">
                          <p className="text-white font-semibold text-xs mb-2 pb-1.5 border-b border-white/10">
                             {format(parseISO(dateStr), 'EEE, MMM d, yyyy')}
                          </p>
                          {dayData.totalEnabled === 0 ? (
                            <p className="text-gray-400 text-xs">No activity from enabled platforms</p>
                          ) : (
                            <div className="space-y-1.5">
                              {PLATFORMS.filter(p => enabled.has(p.key) && dayData.platforms[p.key] > 0).map(p => (
                                <div key={p.key} className="flex items-center justify-between gap-4 text-xs">
                                  <span className="flex items-center gap-1.5" style={{ color: p.fill }}>
                                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: p.fill }} />
                                    {p.label}
                                  </span>
                                  <span className="font-bold text-white">{dayData.platforms[p.key]}</span>
                                </div>
                              ))}
                              <div className="pt-1.5 mt-1 border-t border-white/10 flex justify-between text-xs">
                                <span className="text-gray-400">Total</span>
                                <span className="text-white font-bold">{dayData.totalEnabled}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
               </div>
             );
          })}
        </div>
      </div>
      
      {/* Legend / stats bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-gray-500">
        <div className="flex gap-4">
           {PLATFORMS.filter(p => enabled.has(p.key)).map(p => (
             <span key={p.key} className="flex items-center gap-1">
               <span className="w-2.5 h-2.5 rounded-sm inline-block opacity-80" style={{ background: p.fill }} />
               {p.label}
             </span>
           ))}
        </div>
        
        {/* Color Legend for Heatmap shades */}
        <div className="flex items-center gap-1.5 ml-auto">
           <span className="text-gray-400 mr-1">Less</span>
           <span className="w-[14px] h-[14px] rounded-sm bg-white/5 border border-white/10" />
           <span className="w-[14px] h-[14px] rounded-sm bg-emerald-900" />
           <span className="w-[14px] h-[14px] rounded-sm bg-emerald-700" />
           <span className="w-[14px] h-[14px] rounded-sm bg-emerald-500" />
           <span className="w-[14px] h-[14px] rounded-sm bg-emerald-400" />
           <span className="text-gray-400 ml-1">More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
