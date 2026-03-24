import { Globe as Github, Code, Trophy, Target } from 'lucide-react';

const ProfileCard = ({ user, stats, profile }) => {
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
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center space-x-3">
            <Github className="w-5 h-5 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">GitHub</span>
          </div>
          <span className="text-sm text-gray-400 truncate max-w-[120px]">
            {profile?.github_username || 'Not linked'}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center space-x-3">
            <Code className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-300">LeetCode</span>
          </div>
          <span className="text-sm text-gray-400 truncate max-w-[120px]">
            {profile?.leetcode_username || 'Not linked'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Codeforces</span>
          </div>
          <span className="text-sm text-gray-400 truncate max-w-[120px]">
            {profile?.codeforces_username || 'Not linked'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
