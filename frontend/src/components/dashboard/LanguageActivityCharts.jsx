import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#f87171'];
const DIFF_COLORS = {
  Easy: '#34d399',    // emerald-400
  Medium: '#fbbf24',  // amber-400
  Hard: '#f87171'     // red-400
};

const LanguageActivityCharts = ({ metrics }) => {
  // Use the most recent metric
  const latestMetric = metrics && metrics.length > 0 ? metrics[0] : null;

  // Process GitHub Languages
  const rawLangs = latestMetric?.github_languages || {};
  const langData = Object.keys(rawLangs)
    .map(key => ({ name: key, value: rawLangs[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5 languages

  // Process LeetCode Difficulty
  const diffData = [
    { name: 'Easy', value: latestMetric?.leetcode_easy || 0 },
    { name: 'Medium', value: latestMetric?.leetcode_medium || 0 },
    { name: 'Hard', value: latestMetric?.leetcode_hard || 0 }
  ].filter(d => d.value > 0);

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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                No language data found. Sync GitHub.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Problem Difficulty Pie Chart */}
      <div className="glass-card flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4">Problem Difficulty</h3>
        <div className="flex-1 w-full relative min-h-[200px]">
          {diffData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diffData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={2}
                >
                  {diffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DIFF_COLORS[entry.name] || COLORS[0]} />
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
