import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const SkillRadar = ({ skills }) => {
  // Process skills into format expected by Recharts
  // Ensure we have at least 3 points for a radar chart
  const defaultData = [
    { subject: 'Algorithms', score: 20, fullMark: 100 },
    { subject: 'Data Structs', score: 30, fullMark: 100 },
    { subject: 'Frontend', score: 10, fullMark: 100 },
    { subject: 'Backend', score: 15, fullMark: 100 },
    { subject: 'Databases', score: 25, fullMark: 100 },
  ];

  let rawData = [];
  
  if (skills && skills.length > 0) {
    rawData = skills.map(s => ({
      subject: s.skill_name.length > 12 ? s.skill_name.substring(0, 10) + '..' : s.skill_name,
      score: s.proficiency_score,
      fullMark: 100,
      category: s.category
    }));
  }

  // If we don't have enough skills for a good radar chart (need >=3), augment with empty ones
  const data = rawData.length >= 3 ? rawData : [...rawData, ...defaultData.slice(rawData.length, 5)];

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
