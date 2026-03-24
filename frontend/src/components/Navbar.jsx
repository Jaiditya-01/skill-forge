import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { user, stats } = useAuth();

  return (
    <header className="h-20 glass-panel border-x-0 border-t-0 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center w-96 relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3" />
        <input 
          type="text" 
          placeholder="Search peers, skills, tasks..." 
          className="w-full glass-input pl-10 h-11"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5">
          <span className="text-purple-400 font-bold text-sm">LVL {stats?.current_level || 1}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          <span className="text-gray-300 text-sm font-medium">{stats?.total_xp || 0} XP</span>
        </div>

        <button className="relative w-10 h-10 rounded-full glass-button-secondary flex items-center justify-center !p-0">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#090916]"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-white/10 pl-6">
          <div className="text-right flex flex-col justify-center">
            <span className="text-sm font-semibold text-white leading-tight">{user?.name}</span>
            <span className="text-xs text-purple-400">{user?.university || 'Scholar'}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
