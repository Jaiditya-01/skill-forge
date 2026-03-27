import { useState } from 'react';
import { Globe as Github, Code, Trophy, Target, LayoutGrid } from 'lucide-react';

const platformIcons = {
  GitHub: Github,
  LeetCode: Code,
  Codeforces: Trophy
};

const platformColors = {
  GitHub: 'text-gray-300',
  LeetCode: 'text-yellow-500',
  Codeforces: 'text-blue-400'
};

const PlatformCard = ({ platformData }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { platform, username, maxRating, problemsSolved } = platformData;
  const Icon = platformIcons[platform] || Code;
  const iconColor = platformColors[platform] || 'text-white';
  
  // Choose what to show as the "solved" metric based on platform
  let metricLabel = "Solved";
  let metricValue = 0;
  
  if (platform === 'GitHub') {
    metricLabel = "Contributions";
    metricValue = problemsSolved?.Contributions || 0;
  } else if (platform === 'LeetCode') {
    metricValue = (problemsSolved?.Easy || 0) + (problemsSolved?.Medium || 0) + (problemsSolved?.Hard || 0);
  } else if (platform === 'Codeforces') {
    metricValue = Object.values(problemsSolved || {}).reduce((a, b) => a + b, 0);
  }

  return (
    <div 
      className="relative w-full h-14 perspective-1000 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: '1000px' }}
    >
      <div 
        className="w-full h-full transition-transform duration-500 rounded-lg relative"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isHovered ? 'rotateX(180deg)' : 'rotateX(0deg)'
        }}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg backface-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center space-x-3">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <span className="text-sm font-medium text-gray-300">{platform}</span>
          </div>
          <span className="text-sm font-bold text-gray-100">
            {maxRating > 0 ? `Max Rating: ${maxRating}` : 'Connected'}
          </span>
        </div>
        
        {/* Back */}
        <div 
          className="absolute w-full h-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)'
          }}
        >
          <span className="text-sm font-semibold text-white truncate max-w-[120px]">
            {username}
          </span>
          <span className="text-xs text-purple-200 bg-purple-500/20 px-2 py-0.5 rounded-full">
            {metricValue} {metricLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProfileCard = ({ user, stats, profile, unifiedMetrics }) => {
  return (
    <div className="glass-card flex flex-col items-center justify-center p-8 relative overflow-hidden h-full">
      {/* Dynamic background glow based on level */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-1 mb-4 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
        <div className="w-full h-full bg-[#0a0a1a] rounded-full flex items-center justify-center text-3xl font-bold text-white">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
      <p className="text-purple-400 font-medium mb-6 text-sm flex items-center">
        <Target className="w-4 h-4 mr-1.5" />
        {user?.major_semester || 'Computer Science'}
      </p>

      <div className="w-full flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Level</p>
          <p className="text-2xl font-bold text-white">{stats?.current_level || 1}</p>
        </div>
        <div className="h-10 w-px bg-white/10"></div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Total XP</p>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            {stats?.total_xp || 0}
          </p>
        </div>
        <div className="h-10 w-px bg-white/10"></div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Streak</p>
          <p className="text-2xl font-bold flex items-center justify-center text-orange-400">
            🔥 {stats?.current_streak || 0}
          </p>
        </div>
      </div>

      {/* Platform handles */}
      <div className="w-full space-y-3 mt-2">
        {(!unifiedMetrics || unifiedMetrics.length === 0) ? (
          <div className="text-center text-sm text-gray-500 py-4">
            No platforms linked yet. Go to Settings!
          </div>
        ) : (
          unifiedMetrics.map(p => (
            <PlatformCard key={p.platform} platformData={p} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
