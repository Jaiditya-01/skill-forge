import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

const COLORS = {
  LeetCode: '#fbbf24',    // Yellow
  Codeforces: '#60a5fa',  // Blue
  GitHub: '#8b5cf6'       // Purple
};

const ImprovementChart = ({ unifiedMetrics }) => {
  // Process unifiedMetrics into chartData: [{ date, LeetCode: x, GitHub: y, ... }]
  let chartData = [];
  
  if (unifiedMetrics && unifiedMetrics.length > 0) {
    // Collect all dates from the first platform's activity (assuming all have same dates)
    const dates = unifiedMetrics[0]?.activity?.map(a => a.date) || [];
    
    chartData = dates.map(dateStr => {
      const dateObj = parseISO(dateStr);
      const point = { 
        date: format(dateObj, 'MMM dd'),
        rawDate: dateStr
      };
      
      // Populate platform values
      unifiedMetrics.forEach(p => {
        const activityMatch = p.activity?.find(a => a.date === dateStr);
        point[p.platform] = activityMatch ? activityMatch.value : 0;
      });
      
      return point;
    });
  }

  // Generate some placeholder data if no metrics exist
  const placeholderData = Array.from({ length: 7 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    LeetCode: Math.floor(Math.random() * 5),
    GitHub: Math.floor(Math.random() * 10),
    Codeforces: Math.floor(Math.random() * 3)
  }));

  const finalData = chartData.length > 0 ? chartData : placeholderData;
  const platforms = unifiedMetrics?.map(p => p.platform) || ['LeetCode', 'GitHub', 'Codeforces'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip min-w-[150px]">
          <p className="text-white font-medium mb-2 pb-2 border-b border-white/10">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm flex justify-between" style={{ color: entry.color }}>
                <span>{entry.name}:</span>
                <span className="font-bold ml-2">{entry.value}</span>
              </p>
            ))}
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
        {chartData.length === 0 && (
          <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/10">
            Preview Mode - Add usernames to sync
          </span>
        )}
      </div>
      
      <div className="flex-1 w-full min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={finalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            
            {platforms.map(platform => (
              <Line 
                key={platform}
                type="monotone" 
                dataKey={platform} 
                stroke={COLORS[platform] || '#ffffff'} 
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[platform] || '#ffffff' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImprovementChart;
