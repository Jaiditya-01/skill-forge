import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const SkillRadar = ({ unifiedMetrics }) => {
  // Compute real-time proficiency from unifiedMetrics
  // Easy=1x, Medium=2x, Hard=3x
  // Max expected score per platform for 100%: 
  // Let's say 1000 weighted points = 100% proficiency for a category.
  const MAX_POINTS = 500;

  let rawData = [];

  if (unifiedMetrics && unifiedMetrics.length > 0) {
    rawData = unifiedMetrics.map(platformData => {
      let weightedScore = 0;
      
      if (platformData.platform === 'LeetCode') {
        const easy = platformData.problemsSolved?.Easy || 0;
        const medium = platformData.problemsSolved?.Medium || 0;
        const hard = platformData.problemsSolved?.Hard || 0;
        weightedScore = (easy * 1) + (medium * 2) + (hard * 3);
      } else if (platformData.platform === 'Codeforces') {
        // e.g. 800-1100 -> Easy (1x), 1200-1500 -> Med (2x), 1600+ -> Hard (3x)
        Object.entries(platformData.problemsSolved || {}).forEach(([ratingStr, count]) => {
          const rating = parseInt(ratingStr);
          if (isNaN(rating)) {
             weightedScore += count * 2; // Unrated
          } else if (rating <= 1100) {
             weightedScore += count * 1;
          } else if (rating <= 1500) {
             weightedScore += count * 2;
          } else {
             weightedScore += count * 3;
          }
        });
      } else if (platformData.platform === 'GitHub') {
        weightedScore = (platformData.problemsSolved?.Contributions || 0) * 0.5; // Scale down
      }

      const normalizedScore = Math.min(100, Math.round((weightedScore / MAX_POINTS) * 100));
      
      return {
        subject: platformData.platform,
        score: normalizedScore,
        fullMark: 100,
        rawPoints: Math.round(weightedScore)
      };
    });
  }

  const defaultData = [
    { subject: 'LeetCode', score: 0, fullMark: 100 },
    { subject: 'Codeforces', score: 0, fullMark: 100 },
    { subject: 'GitHub', score: 0, fullMark: 100 }
  ];

  // If no accurate data yet, use placeholder default framework
  const data = rawData.length >= 3 ? rawData : defaultData.map(d => {
    const existing = rawData.find(r => r.subject === d.subject);
    return existing || d;
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="text-white font-medium">{payload[0].payload.subject}</p>
          <p className="text-purple-400">Proficiency: {payload[0].value}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6">Skill Proficiency</h3>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="My Skills"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="#8b5cf6"
              fillOpacity={0.4}
              dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#fff', strokeWidth: 2, stroke: '#8b5cf6' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillRadar;
