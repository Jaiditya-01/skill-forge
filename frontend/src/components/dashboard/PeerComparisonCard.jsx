import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Users, TrendingUp, Info } from 'lucide-react';

const PeerComparisonCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await api.get('/peer/compare');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch peer comparison', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, []);

  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center p-8 animate-pulse">
        <p className="text-emerald-400">Loading peer insights...</p>
      </div>
    );
  }

  if (!data?.has_data) {
    return (
      <div className="glass-card">
        <div className="flex items-center space-x-2 text-white font-bold mb-4">
          <Users className="w-5 h-5 text-emerald-400" />
          <h2>Peer Insights</h2>
        </div>
        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 flex items-start">
          <Info className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 text-sm">{data?.message || 'Update your profile to see how you compare to peers.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { demographic, peer_count, metrics } = data;

  const getMetricBadge = (isHigher) => {
    if (isHigher) return <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Top Half</span>;
    return <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">Keep Grinding</span>;
  };

  return (
    <div className="glass-card hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-white font-bold">
          <Users className="w-5 h-5 text-emerald-400" />
          <h2>Peer Insights</h2>
        </div>
        <div className="text-xs text-gray-400 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" />
          vs {peer_count} {demographic}s
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex justify-between items-center">
          <div>
            <div className="text-gray-400 text-xs">Total XP</div>
            <div className="text-lg font-bold text-white">{metrics.xp.you} <span className="text-xs font-normal text-gray-500">vs avg {metrics.xp.peer_avg}</span></div>
          </div>
          {getMetricBadge(metrics.xp.is_higher)}
        </div>

        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex justify-between items-center">
          <div>
            <div className="text-gray-400 text-xs">Consistency (Streak)</div>
            <div className="text-lg font-bold text-white">{metrics.streak.you} <span className="text-xs font-normal text-gray-500">vs avg {metrics.streak.peer_avg}</span></div>
          </div>
          {getMetricBadge(metrics.streak.is_higher)}
        </div>

        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex justify-between items-center">
          <div>
            <div className="text-gray-400 text-xs">Problems Solved</div>
            <div className="text-lg font-bold text-white">{metrics.problems_solved.you} <span className="text-xs font-normal text-gray-500">vs avg {metrics.problems_solved.peer_avg}</span></div>
          </div>
          {getMetricBadge(metrics.problems_solved.is_higher)}
        </div>
      </div>
    </div>
  );
};

export default PeerComparisonCard;
