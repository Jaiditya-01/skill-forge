import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Trophy, 
  Settings, 
  LogOut,
  Code2,
  Swords
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks & Goals', path: '/tasks', icon: CheckSquare },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Rivals', path: '/rivals', icon: Swords },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 glass-panel border-y-0 border-l-0 min-h-screen flex flex-col p-4">
      <div className="flex items-center space-x-3 mb-10 px-2 mt-2">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-wide">SkillForge</span>
      </div>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
