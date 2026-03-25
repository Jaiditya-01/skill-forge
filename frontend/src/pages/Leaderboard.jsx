import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Trophy, Filter, X, Zap, Loader2, UserPlus, Check } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [rivalries, setRivalries] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    if (user) fetchRivalries();
  }, [filterType, filterValue, user]);

  const fetchRivalries = async () => {
    try {
      const res = await api.get('/rivalry/dashboard');
      if (res.data.success) {
        setRivalries(res.data.data.rivalries || []);
      }
    } catch (error) {
      console.error('Failed to fetch rivalries', error);
    }
  };

  const addRival = async (e, rivalId) => {
    e.stopPropagation();
    setActionLoading(rivalId);
    try {
      await api.post(`/rivalry/add/${rivalId}`);
      fetchRivalries();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = '/leaderboard';
      if (filterType && filterValue) {
        url += `?filter_type=${filterType}&filter_value=${filterValue}`;
      }
      const res = await api.get(url);
      setLeaders(res.data.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (type, value) => {
    setFilterType(type);
    setFilterValue(value);
  };

  const clearFilter = () => {
    setFilterType('');
    setFilterValue('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Rankings</h1>
          <p className="text-gray-400 mt-1">See how you stack up against other coders.</p>
        </div>

        <div className="flex space-x-2">
          {filterType && (
            <button 
              onClick={clearFilter}
              className="flex items-center space-x-1 glass-button-secondary py-1.5 px-3 text-sm"
            >
              <span>Clear Filters</span>
              <X className="w-3 h-3 ml-1" />
            </button>
          )}
          <div className="relative group">
            <button className="flex items-center space-x-2 glass-button-secondary bg-purple-500/10 border-purple-500/20 text-purple-400 py-1.5 px-4 text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span>{filterType ? `Filtered by ${filterType}` : 'Filter'}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 glass-card p-2 hidden group-hover:block z-10 border border-white/10 shadow-xl">
              <div className="text-xs text-gray-400 font-semibold uppercase px-2 mb-1">Quick Filters</div>
              <button 
                onClick={() => applyFilter('university', user?.university)}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-white/10 text-white transition-colors"
                disabled={!user?.university}
              >
                My University
              </button>
              <button 
                onClick={() => applyFilter('interest', user?.interests?.[0])}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-white/10 text-white transition-colors"
                disabled={!user?.interests?.length}
              >
                My Primary Interest
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="py-4 px-6 text-gray-400 font-semibold text-sm w-16">Rank</th>
              <th className="py-4 px-6 text-gray-400 font-semibold text-sm">Coder</th>
              <th className="py-4 px-6 text-gray-400 font-semibold text-sm">Level</th>
              <th className="py-4 px-6 text-gray-400 font-semibold text-sm">Total XP</th>
              <th className="py-4 px-6 text-gray-400 font-semibold text-sm">Streak</th>
              <th className="py-4 px-6 text-gray-400 font-semibold text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400">Loading rankings...</td>
              </tr>
            ) : leaders.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400">No coders found matching criteria.</td>
              </tr>
            ) : (
              leaders.map((leader) => {
                const isMe = user?.name === leader.name;
                const isAlreadyRival = rivalries.some(r => r.rival_id === leader.user_id);
                
                return (
                  <tr 
                    key={leader.user_id} 
                    className={`transition-colors hover:bg-white/[0.02] cursor-pointer ${isMe ? 'bg-purple-500/5' : ''}`}
                  >
                    <td className="py-4 px-6">
                      {leader.rank === 1 ? (
                        <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                      ) : leader.rank === 2 ? (
                        <Trophy className="w-5 h-5 text-gray-300" />
                      ) : leader.rank === 3 ? (
                        <Trophy className="w-5 h-5 text-amber-700" />
                      ) : (
                        <span className="text-gray-400 font-bold px-2">{leader.rank}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                          {leader.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-semibold ${isMe ? 'text-purple-400' : 'text-white'}`}>
                            {leader.name} {isMe && '(You)'}
                          </div>
                          <div className="text-xs text-gray-500">{leader.university || 'Independent'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                        Lv {leader.current_level}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        {leader.total_xp.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-orange-400 font-bold">
                        <Zap className="w-4 h-4 mr-1 pb-0.5" />
                        {leader.current_streak}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!isMe && (
                        <button
                          onClick={(e) => addRival(e, leader.user_id)}
                          disabled={actionLoading === leader.user_id || isAlreadyRival}
                          className={`inline-flex items-center px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            isAlreadyRival 
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500'
                          }`}
                        >
                          {actionLoading === leader.user_id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isAlreadyRival ? (
                            <>
                              <Check className="w-3 h-3 mr-1" /> Added
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 mr-1" /> Rival
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
