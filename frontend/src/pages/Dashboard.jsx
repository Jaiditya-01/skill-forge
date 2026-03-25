import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { RefreshCw, Loader2 } from 'lucide-react';

// Components
import ProfileCard from '../components/dashboard/ProfileCard';
import SkillRadar from '../components/dashboard/SkillRadar';
import ImprovementChart from '../components/dashboard/ImprovementChart';
import LanguageActivityCharts from '../components/dashboard/LanguageActivityCharts';
import IsometricHeatmap from '../components/dashboard/IsometricHeatmap';
import PeerComparisonCard from '../components/dashboard/PeerComparisonCard';

const Dashboard = () => {
  const { user, stats, profile, refreshUser } = useAuth();
  
  const [metrics, setMetrics] = useState([]);
  const [skills, setSkills] = useState([]);
  const [unifiedMetrics, setUnifiedMetrics] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, skillsRes, unifiedRes] = await Promise.all([
        api.get('/sync/metrics?days=30').catch(() => ({ data: { data: [] } })),
        api.get('/skills').catch(() => ({ data: { data: [] } })),
        api.get('/sync/unified-metrics?days=30').catch(() => ({ data: { data: [] } }))
      ]);
      
      if (metricsRes.data?.data) setMetrics(metricsRes.data.data);
      if (skillsRes.data?.data) setSkills(skillsRes.data.data);
      if (unifiedRes.data?.data) setUnifiedMetrics(unifiedRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const res = await api.post('/sync/sync-profiles');
      setSyncMessage(res.data.message);
      await refreshUser();
      await fetchDashboardData();
      
      // Clear message after 3 seconds
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      setSyncMessage('Sync failed. Check platform usernames in Settings.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back to the forge, {user?.name.split(' ')[0]}.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {syncMessage && (
            <span className="text-sm font-medium text-emerald-400 animate-pulse">
              {syncMessage}
            </span>
          )}
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="glass-button-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-purple-400' : 'text-gray-300'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Platforms'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Insights */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard user={user} stats={stats} profile={profile} unifiedMetrics={unifiedMetrics} />
          <PeerComparisonCard />
        </div>
        
        {/* Right Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[350px]">
            <SkillRadar unifiedMetrics={unifiedMetrics} />
            <ImprovementChart unifiedMetrics={unifiedMetrics} />
          </div>
          
          <LanguageActivityCharts unifiedMetrics={unifiedMetrics} />
        </div>
      </div>

      {/* Full-width 3D Isometric Heatmap */}
      <IsometricHeatmap unifiedMetrics={unifiedMetrics} />
    </div>
  );
};

export default Dashboard;
