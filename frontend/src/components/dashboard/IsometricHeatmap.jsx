import React, { useState, useCallback, useMemo, useRef } from 'react';
import { format, subDays, parseISO } from 'date-fns';

// ─── Platform Palette ──────────────────────────────────────────────────────────
const PLATFORMS = [
  { key: 'GitHub',      label: 'GitHub',      fill: '#8b5cf6', glow: 'rgba(139,92,246,0.6)',  top: '#a78bfa', side: '#6d28d9', front: '#7c3aed' },
  { key: 'LeetCode',   label: 'LeetCode',    fill: '#fbbf24', glow: 'rgba(251,191,36,0.6)',   top: '#fde68a', side: '#d97706', front: '#f59e0b' },
  { key: 'Codeforces', label: 'Codeforces',  fill: '#60a5fa', glow: 'rgba(96,165,250,0.6)',   top: '#93c5fd', side: '#2563eb', front: '#3b82f6' },
  { key: 'CodeChef',   label: 'CodeChef',    fill: '#34d399', glow: 'rgba(52,211,153,0.6)',   top: '#6ee7b7', side: '#059669', front: '#10b981' },
];

// ─── Isometric Geometry ────────────────────────────────────────────────────────
const ISO_W  = 22;   // tile width
const ISO_H  = 12;   // tile height (half of width for 2:1 projection)
const COLS   = 53;   // weeks
const ROWS   = 7;    // days of week

// Convert grid (col, row) to isometric screen (x, y)
const toIso = (col, row) => ({
  x: (col - row) * (ISO_W / 2),
  y: (col + row) * (ISO_H / 2),
});

// Build the 4 SVG points for a rhombus top face
const topFace = (cx, cy, w, h) => {
  const hw = w / 2, hh = h / 2;
  return `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
};

// Left side face
const leftFace = (cx, cy, w, h, extH) => {
  const hw = w / 2, hh = h / 2;
  return `${cx - hw},${cy} ${cx},${cy + hh} ${cx},${cy + hh + extH} ${cx - hw},${cy + extH}`;
};

// Right side face
const rightFace = (cx, cy, w, h, extH) => {
  const hw = w / 2, hh = h / 2;
  return `${cx},${cy + hh} ${cx + hw},${cy} ${cx + hw},${cy + extH} ${cx},${cy + hh + extH}`;
};

// ─── Build Date → Activity Map ─────────────────────────────────────────────────
const buildDateMap = (unifiedMetrics, enabledPlatforms) => {
  const map = {}; // date string → { GitHub: n, LeetCode: n, ... }
  if (!unifiedMetrics) return map;

  unifiedMetrics.forEach(platform => {
    if (!enabledPlatforms.has(platform.platform)) return;
    (platform.activity || []).forEach(({ date, value }) => {
      if (!map[date]) map[date] = {};
      map[date][platform.platform] = (map[date][platform.platform] || 0) + value;
    });
  });
  return map;
};

// ─── Generate 364-day grid ─────────────────────────────────────────────────────
const buildGrid = () => {
  const days = [];
  const today = new Date();
  // Go back 53*7 - 1 days so we get a full 53-week grid ending today
  const start = subDays(today, COLS * ROWS - 1);
  for (let i = 0; i < COLS * ROWS; i++) {
    const d = subDays(today, COLS * ROWS - 1 - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  // arrange into [col][row]
  const grid = [];
  for (let c = 0; c < COLS; c++) {
    grid[c] = [];
    for (let r = 0; r < ROWS; r++) {
      grid[c][r] = days[c * ROWS + r];
    }
  }
  return grid;
};

const GRID = buildGrid();

// ─── Single Isometric Block ────────────────────────────────────────────────────
const IsoCube = ({ cx, cy, totalHeight, platformBreakdown, isHovered, onClick, onEnter, onLeave }) => {
  if (totalHeight === 0) {
    // Flat tile (empty day)
    return (
      <polygon
        points={topFace(cx, cy, ISO_W, ISO_H)}
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={0.5}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      />
    );
  }

  // Stack colored segments bottom-up per platform
  const parts = [];
  let accumulated = 0;

  platformBreakdown.forEach(({ platform, value, h }) => {
    if (value === 0 || h === 0) return;
    const p = PLATFORMS.find(p => p.key === platform);
    if (!p) return;

    const segY = cy - accumulated;

    parts.push(
      <g key={platform}>
        {/* Top face */}
        <polygon
          points={topFace(cx, segY - h, ISO_W, ISO_H)}
          fill={isHovered ? p.top : p.fill}
          stroke={isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}
          strokeWidth={0.5}
        />
        {/* Left face */}
        <polygon
          points={leftFace(cx, segY - h, ISO_W, ISO_H, h)}
          fill={p.side}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth={0.5}
        />
        {/* Right face */}
        <polygon
          points={rightFace(cx, segY - h, ISO_W, ISO_H, h)}
          fill={p.front}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth={0.5}
        />
      </g>
    );
    accumulated += h;
  });

  return (
    <g
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      filter={isHovered ? 'url(#glow)' : undefined}
    >
      {parts}
    </g>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const IsometricHeatmap = ({ unifiedMetrics }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered]   = useState(null); // { col, row, tipTop, tipLeft, date, breakdown, total }
  const [enabled, setEnabled]   = useState(new Set(['GitHub', 'LeetCode', 'Codeforces', 'CodeChef']));

  const togglePlatform = useCallback(key => {
    setEnabled(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const dateMap = useMemo(() => buildDateMap(unifiedMetrics, enabled), [unifiedMetrics, enabled]);

  // Max total activity across all enabled platforms across all days
  const maxTotal = useMemo(() => {
    return Math.max(1, ...Object.values(dateMap).map(d =>
      Object.values(d).reduce((s, v) => s + v, 0)
    ));
  }, [dateMap]);

  // ── Precise isometric bounding box ──────────────────────────────────────────
  // The grid corners in iso-space:
  //   Top-left  : col=0,      row=0        → x = 0,                   y = 0
  //   Top-right : col=COLS-1, row=0        → x = (COLS-1)*(W/2),     y = (COLS-1)*(H/2)
  //   Bot-left  : col=0,      row=ROWS-1   → x = -(ROWS-1)*(W/2),    y = (ROWS-1)*(H/2)
  //   Bot-right : col=COLS-1, row=ROWS-1   → x = (COLS-ROWS)*(W/2),  y = (COLS+ROWS-2)*(H/2)
  const isoMinX = -(ROWS - 1) * (ISO_W / 2);          // leftmost x (col=0, row=max)
  const isoMaxX =  (COLS - 1) * (ISO_W / 2);          // rightmost
  const isoMaxY =  (COLS + ROWS - 2) * (ISO_H / 2);   // bottom-most y

  const MAX_BAR_HEIGHT = 70;  // max cube height in px
  const PAD_X = 50;           // left padding for day labels
  const PAD_TOP = MAX_BAR_HEIGHT + 20;  // top padding so tallest bars don't clip
  const PAD_BOT = 20;

  const svgWidth  = (isoMaxX - isoMinX) + PAD_X + 20;
  const svgHeight = isoMaxY + PAD_TOP + PAD_BOT;

  // originX/Y: the screen position that corresponds to iso (col=0, row=0) — i.e. the grid's "top" tile
  const originX = PAD_X - isoMinX;   // shift so even the leftmost tile (negative x) is visible
  const originY = PAD_TOP;            // top of the grid — bars grow downward, cubes are drawn at cy=originY + iso.y

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div ref={cardRef} className="glass-card" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            Unified Activity Heatmap
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">All platforms · Last 371 days · Isometric view</p>
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
                  color: on ? p.top : '#6b7280',
                  boxShadow: on ? `0 0 8px ${p.glow}` : 'none',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: on ? p.fill : '#374151' }} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto overflow-y-hidden rounded-xl"
           style={{ background: 'rgba(0,0,0,0.2)' }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ display: 'block', minWidth: svgWidth }}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Week day labels on the left */}
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((label, r) => {
            const { x, y } = toIso(0, r);
            return (
              <text
                key={label}
                x={originX + x - ISO_W / 2 - 6}
                y={originY + y + 4}
                textAnchor="end"
                fill="#4b5563"
                fontSize={9}
                fontFamily="Inter, system-ui, sans-serif"
              >
                {label}
              </text>
            );
          })}

          {/* Month labels across the top */}
          {Array.from({ length: COLS }).map((_, c) => {
            const dateStr = GRID[c]?.[0];
            if (!dateStr) return null;
            try {
              const d = parseISO(dateStr);
              // Only show label on first column of that month
              if (d.getDate() > 7) return null;
              const { x, y } = toIso(c, 0);
              return (
                <text
                  key={`month-${c}`}
                  x={originX + x}
                  y={originY + y - 8}
                  textAnchor="middle"
                  fill="#4b5563"
                  fontSize={9}
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {format(d, 'MMM')}
                </text>
              );
            } catch { return null; }
          })}

          {/* Cubes — render back-to-front for correct overlap (painter's algorithm) */}
          {Array.from({ length: COLS }).map((_, c) =>
            Array.from({ length: ROWS }).map((_, r) => {
              const dateStr = GRID[c]?.[r];
              if (!dateStr) return null;

              const dayData = dateMap[dateStr] || {};
              const totalVal = Object.values(dayData).reduce((s, v) => s + v, 0);

              // Scale height proportional to MAX_BAR_HEIGHT
              const totalH = Math.round((totalVal / maxTotal) * MAX_BAR_HEIGHT);

              // Per-platform breakdown with proportional height
              const platformBreakdown = PLATFORMS
                .filter(p => enabled.has(p.key))
                .map(p => ({
                  platform: p.key,
                  value: dayData[p.key] || 0,
                  h: totalH > 0
                    ? Math.max(0, Math.round(((dayData[p.key] || 0) / totalVal) * totalH))
                    : 0,
                }))
                .filter(pb => pb.value > 0);

              const { x, y } = toIso(c, r);
              const cx = originX + x;
              const cy = originY + y;

              const isThisHovered = hovered?.col === c && hovered?.row === r;
              const isToday = dateStr === today;

              return (
                <IsoCube
                  key={`${c}-${r}`}
                  cx={cx}
                  cy={cy}
                  totalHeight={totalH}
                  platformBreakdown={platformBreakdown}
                  isHovered={isThisHovered || isToday}
                  onEnter={(e) => {
                    const rect = cardRef.current?.getBoundingClientRect() ?? { top: 0, left: 0 };
                    const mouseY = e.clientY - rect.top;
                    const mouseX = e.clientX - rect.left;
                    const tooltipH = 130;
                    setHovered({
                      col: c, row: r,
                      tipTop:  Math.max(8, mouseY - tooltipH - 8),
                      tipLeft: mouseX + 14,
                      date: dateStr,
                      breakdown: platformBreakdown,
                      total: totalVal,
                    });
                  }}
                  onLeave={() => setHovered(null)}
                />
              );
            })
          )}

          {/* Today ring highlight */}
          {(() => {
            const todayCol = COLS - 1;
            const todayRow = new Date().getDay();
            const { x, y } = toIso(todayCol, todayRow);
            return (
              <polygon
                points={topFace(originX + x, originY + y, ISO_W, ISO_H)}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
            );
          })()}
        </svg>
      </div>

      {/* Tooltip — anchored to the card */}
      <HoverTooltip hovered={hovered} />

      {/* Legend / stats bar */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block bg-white/5 border border-white/10" />
          No activity
        </span>
        {PLATFORMS.filter(p => enabled.has(p.key)).map(p => (
          <span key={p.key} className="flex items-center gap-1" style={{ color: p.top }}>
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: p.fill }} />
            {p.label}
          </span>
        ))}
        <span className="ml-auto text-gray-600">
          Taller column = more activity that day
        </span>
      </div>
    </div>
  );
};

// ─── Hover tooltip — positioned relative to card ─────────────────────────────
const HoverTooltip = ({ hovered }) => {
  if (!hovered) return null;
  return (
    <div
      className="chart-tooltip absolute z-50 pointer-events-none min-w-[160px] animate-in fade-in duration-100"
      style={{ top: hovered.tipTop, left: hovered.tipLeft }}
    >
      <TooltipCard date={hovered.date} breakdown={hovered.breakdown} total={hovered.total} />
    </div>
  );
};

const TooltipCard = ({ date, breakdown, total }) => {
  let displayDate = date;
  try { displayDate = format(parseISO(date), 'EEE, MMM d yyyy'); } catch {}

  return (
    <>
      <p className="text-white font-semibold text-sm mb-2 pb-1.5 border-b border-white/10">{displayDate}</p>
      {total === 0 ? (
        <p className="text-gray-400 text-xs">No activity</p>
      ) : (
        <div className="space-y-1">
          {breakdown.map(b => {
            const p = PLATFORMS.find(p => p.key === b.platform);
            return (
              <div key={b.platform} className="flex items-center justify-between gap-4 text-xs">
                <span className="flex items-center gap-1.5" style={{ color: p?.top }}>
                  <span className="w-2 h-2 rounded-sm" style={{ background: p?.fill }} />
                  {b.platform}
                </span>
                <span className="font-bold text-white">{b.value}</span>
              </div>
            );
          })}
          <div className="pt-1 border-t border-white/10 flex justify-between text-xs">
            <span className="text-gray-400">Total</span>
            <span className="text-white font-bold">{total}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default IsometricHeatmap;
