import { useState, useEffect } from 'react';
import api from '../api/client';
import { Search, Swords, UserPlus, UserMinus, Loader2, Trophy, Code2, GitCommit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RivalDashboard = () => {
  const { user } = useAuth();
  const [rivalries, setRivalries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of user being added/removed

  useEffect(() => {
    fetchRivalries();
  }, []);

  const fetchRivalries = async () => {
    try {
      const res = await api.get('/rivalry/dashboard');
      if (res.data.success) {
        setRivalries(res.data.data.rivalries || []);
      }
    } catch (error) {
      console.error('Failed to fetch rivalries', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Using the dedicated global user search endpoint
      const res = await api.get(`/rivalry/search?q=${encodeURIComponent(searchQuery)}`); 
      if (res.data.success) {
        setSearchedUsers(res.data.data.users || []);
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addRival = async (rivalId) => {
    setActionLoading(rivalId);
    try {
      await api.post(`/rivalry/add/${rivalId}`);
      fetchRivalries();
      setSearchQuery('');
      setSearchedUsers([]);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const removeRival = async (rivalId) => {
    setActionLoading(rivalId);
    try {
      await api.delete(`/rivalry/remove/${rivalId}`);
      fetchRivalries();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const MetricRow = ({ icon: Icon, label, myValue, rivalValue, winner }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className={`w-1/3 text-center text-lg font-bold ${winner === 'you' ? 'text-emerald-400' : 'text-gray-400'}`}>
        {myValue}
      </div>
      <div className="w-1/3 flex flex-col items-center justify-center text-gray-500">
        <Icon className="w-4 h-4 mb-1 text-purple-400/50" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`w-1/3 text-center text-lg font-bold ${winner === 'rival' ? 'text-amber-400' : 'text-gray-400'}`}>
        {rivalValue}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Swords className="w-8 h-8 mr-3 text-red-500" />
          Rivalry Arena
        </h1>
        <p className="text-gray-400 mt-1">Challenge your peers and track progress side-by-side.</p>
      </div>

      <div className="glass-card mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a rival by name..."
              className="w-full glass-input pl-10"
            />
          </div>
          <button type="submit" disabled={isSearching} className="glass-button bg-purple-600 hover:bg-purple-700 min-w-[100px] flex justify-center">
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {searchedUsers.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Search Results</h3>
            {searchedUsers.map(u => {
              const isAlreadyRival = rivalries.some(r => r.rival_id === u.user_id);
              return (
                <div key={u.user_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white font-medium">{u.name}</div>
                    <div className="text-xs text-gray-400">Total XP: {u.total_xp}</div>
                  </div>
                  <button 
                    onClick={() => addRival(u.user_id)}
                    disabled={actionLoading === u.user_id || isAlreadyRival}
                    className={`flex items-center px-3 py-1.5 rounded text-sm transition-colors ${isAlreadyRival ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                  >
                    {actionLoading === u.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    {isAlreadyRival ? 'Added' : 'Add Rival'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : rivalries.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Swords className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Rivals Yet</h2>
          <p className="text-gray-400 max-w-md">Search for a username above to add them as a rival. You'll be able to compare your stats side-by-side.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rivalries.map((r) => (
            <div key={r.rival_id} className="glass-card relative overflow-hidden group">
              {/* V/S Background element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black italic text-white/[0.03] select-none pointer-events-none">
                VS
              </div>
              
              <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/10 pb-4">
                <div className="w-1/3 text-center">
                  <div className="w-10 h-10 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold mb-1">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="text-xs text-white truncate px-1">You</div>
                </div>

                <div className="w-1/3 flex justify-center">
                  <Swords className="w-6 h-6 text-red-500" />
                </div>

                <div className="w-1/3 text-center">
                  <div className="w-10 h-10 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold mb-1">
                    {r.rival_name.charAt(0)}
                  </div>
                  <div className="text-xs text-white truncate px-1">{r.rival_name}</div>
                </div>
              </div>

              <div className="relative z-10 mb-6">
                <MetricRow 
                  icon={Trophy} 
                  label="Hard Solved" 
                  myValue={r.my_metrics.hard_solved} 
                  rivalValue={r.rival_metrics.hard_solved} 
                  winner={r.winner.hard_solved}
                />
                <MetricRow 
                  icon={Code2} 
                  label="Total Solved" 
                  myValue={r.my_metrics.total_solved} 
                  rivalValue={r.rival_metrics.total_solved} 
                  winner={r.winner.total_solved}
                />
                <MetricRow 
                  icon={GitCommit} 
                  label="GH Commits" 
                  myValue={r.my_metrics.github_commits} 
                  rivalValue={r.rival_metrics.github_commits} 
                  winner={r.winner.github_commits}
                />
              </div>

              <div className="flex justify-center relative z-10 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => removeRival(r.rival_id)}
                  disabled={actionLoading === r.rival_id}
                  className="flex items-center text-xs text-red-400 hover:text-red-300 px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  {actionLoading === r.rival_id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <UserMinus className="w-3 h-3 mr-1" />}
                  Remove Rival
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RivalDashboard;
