import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, parseISO } from 'date-fns';

const ImprovementChart = ({ metrics }) => {
  // Format data for chart
  const data = metrics && metrics.length > 0 
    ? metrics.slice().reverse().map(m => {
        const dateObj = parseISO(m.date);
        return {
          date: format(dateObj, 'MMM dd'),
          rawDate: m.date,
          // Aggregate problems solved
          problems: m.leetcode_solved + m.codeforces_solved + m.codechef_solved,
          // Commits
          commits: m.github_commits,
          // Overall activity score (weighted approximation for visualization)
          activity: (m.github_commits * 5) + ((m.leetcode_solved + m.codeforces_solved + m.codechef_solved) * 20)
        };
      })
    : [];

  // Generate some placeholder data if no metrics exist to make the dashboard look active initially
  const placeholderData = Array.from({ length: 7 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    problems: Math.floor(Math.random() * 5),
    commits: Math.floor(Math.random() * 10),
    activity: Math.floor(Math.random() * 100) + 20
  }));

  const chartData = data.length > 0 ? data : placeholderData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip min-w-[150px]">
          <p className="text-white font-medium mb-2 pb-2 border-b border-white/10">{label}</p>
          <div className="space-y-1">
            <p className="text-cyan-400 text-sm flex justify-between">
              <span>Problems:</span>
              <span className="font-bold">{payload.find(p => p.dataKey === 'problems')?.value || 0}</span>
            </p>
            <p className="text-purple-400 text-sm flex justify-between">
              <span>Commits:</span>
              <span className="font-bold">{payload.find(p => p.dataKey === 'commits')?.value || 0}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">30-Day Activity Trend</h3>
        {data.length === 0 && (
          <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/10">
            Preview Mode - Add usernames to sync
          </span>
        )}
      </div>
      
      <div className="flex-1 w-full min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Area 
              type="monotone" 
              dataKey="problems" 
              stroke="#22d3ee" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProblems)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#22d3ee' }}
            />
            <Area 
              type="monotone" 
              dataKey="commits" 
              stroke="#c084fc" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCommits)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#c084fc' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImprovementChart;
