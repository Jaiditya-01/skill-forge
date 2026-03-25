import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#f87171'];
const diffColors = {
  Easy: '#34d399',    // emerald-400
  Medium: '#fbbf24',  // amber-400
  Hard: '#f87171'     // red-400
};

const LanguageActivityCharts = ({ unifiedMetrics }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('LeetCode');

  // Process GitHub Languages (from the GitHub unified metric if available, or we just keep it as is if backend doesn't provide it)
  // Actually, our backend unifiedMetrics currently doesn't provide github_languages!
  // It only provides problemsSolved and activity.
  // We can just mock languages or keep it empty. Actually let's assume languages is not deeply critical or we can just show "Top Languages" as a placeholder if data is missing, or pull from unifiedMetrics if we add it. 
  const platformData = unifiedMetrics?.find(p => p.platform === selectedPlatform);
  const diffStats = platformData?.problemsSolved || {};

  // Dynamically build diffData from keys
  const diffData = Object.entries(diffStats)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    // Sort by integer value if the key is numeric (like CF ratings), or fallback to alphabetical
    .sort((a, b) => {
      const numA = parseInt(a.name);
      const numB = parseInt(b.name);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.name.localeCompare(b.name);
    });

  const githubData = unifiedMetrics?.find(p => p.platform === 'GitHub');
  const langStats = githubData?.languages || {};
  const langData = Object.entries(langStats)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
    
  const LANG_COLORS = ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#22d3ee', '#fb923c', '#9ca3af', '#bef264'];

  // Calculate generic colors for pie chart using golden angle approximation for visually distinct segments
  const getDynamicColor = (index, total) => {
    // Top 3 standard colors
    if (diffData[index]?.name === 'Easy') return '#34d399';
    if (diffData[index]?.name === 'Medium') return '#fbbf24';
    if (diffData[index]?.name === 'Hard') return '#f87171';
    
    // Auto-generate for unknown rating buckets like 800, 900
    return `hsl(${(index * 137.5) % 360}, 70%, 55%)`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip min-w-[120px]">
          <p className="text-white font-medium mb-1">{payload[0].name}</p>
          <p className="text-gray-300 text-sm">Count: <span className="text-white font-bold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[350px]">
      
      {/* GitHub Language Pie Chart */}
      <div className="glass-card flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4">Top Languages (Repos)</h3>
        <div className="flex-1 w-full relative min-h-[200px]">
          {langData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={langData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {langData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LANG_COLORS[index % LANG_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="px-3 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/10">
                No repository language data available.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Problem Difficulty Pie Chart */}
      <div className="glass-card flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Problem Difficulty</h3>
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-2 py-1 outline-none focus:border-purple-500"
          >
            {unifiedMetrics?.map(p => (
              <option key={p.platform} value={p.platform} className="bg-[#0f172a]">{p.platform}</option>
            ))}
            {(!unifiedMetrics || unifiedMetrics.length === 0) && (
              <option value="LeetCode" className="bg-[#0f172a]">LeetCode</option>
            )}
          </select>
        </div>
        <div className="flex-1 w-full relative min-h-[200px]">
          {diffData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diffData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {diffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDynamicColor(index, diffData.length)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="px-3 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/10">
                No solved problems data found. Sync platforms.
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default LanguageActivityCharts;
