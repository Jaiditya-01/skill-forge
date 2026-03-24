import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Save, User as UserIcon, Settings as SettingsIcon, Shield, Code, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, profile, refreshUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    github_username: '',
    leetcode_username: '',
    codeforces_username: '',
    codechef_username: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [skills, setSkills] = useState([]);
  const [recommendedSkills, setRecommendedSkills] = useState([]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        github_username: profile.github_username || '',
        leetcode_username: profile.leetcode_username || '',
        codeforces_username: profile.codeforces_username || '',
        codechef_username: profile.codechef_username || ''
      });
    }
    fetchSkillsAndRecs();
  }, [profile]);

  const fetchSkillsAndRecs = async () => {
    try {
      const skillsRes = await api.get('/skills');
      setSkills(skillsRes.data.data);
      
      const recsRes = await api.get('/skills/recommend');
      setRecommendedSkills(recsRes.data.data.recommended_skills || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await api.put('/profile', profileData);
      setMessage({ text: 'Platform usernames saved successfully!', type: 'success' });
      await refreshUser();
    } catch (error) {
      setMessage({ text: 'Failed to save settings.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skillName, category) => {
    try {
      await api.post('/skills', { skill_name: skillName, category, proficiency_score: 1 });
      fetchSkillsAndRecs();
      setMessage({ text: `Added ${skillName} to your skills!`, type: 'success' });
    } catch (error) {
       console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Forge Settings</h1>
        <p className="text-gray-400 mt-1">Manage your identity and linked platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          <form onSubmit={saveProfile} className="glass-card">
            <div className="flex items-center space-x-2 text-white font-bold mb-6 border-b border-white/10 pb-4">
              <Code className="w-5 h-5 text-cyan-400" />
              <h2>Platform Connections</h2>
            </div>
            
            {message.text && (
              <div className={`p-3 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">GitHub Username</label>
                <input 
                  type="text" 
                  name="github_username"
                  value={profileData.github_username}
                  onChange={handleProfileChange}
                  className="w-full glass-input bg-white/5" 
                  placeholder="octocat"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">LeetCode Username</label>
                <input 
                  type="text" 
                  name="leetcode_username"
                  value={profileData.leetcode_username}
                  onChange={handleProfileChange}
                  className="w-full glass-input bg-white/5" 
                  placeholder="lee215"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Codeforces Handle</label>
                <input 
                  type="text" 
                  name="codeforces_username"
                  value={profileData.codeforces_username}
                  onChange={handleProfileChange}
                  className="w-full glass-input bg-white/5" 
                  placeholder="tourist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">CodeChef Username</label>
                <input 
                  type="text" 
                  name="codechef_username"
                  value={profileData.codechef_username}
                  onChange={handleProfileChange}
                  className="w-full glass-input bg-white/5" 
                  placeholder="gennady"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="glass-button bg-purple-600 hover:bg-purple-700 flex items-center"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Connections
              </button>
            </div>
          </form>

          <div className="glass-card">
            <div className="flex items-center space-x-2 text-white font-bold mb-6 border-b border-white/10 pb-4">
              <UserIcon className="w-5 h-5 text-emerald-400" />
              <h2>Personal Information</h2>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">Name</span>
                <span className="text-white font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">University</span>
                <span className="text-white font-medium">{user?.university || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skill Recommendations & Danger Zone */}
        <div className="space-y-6">
          <div className="glass-card bg-gradient-to-b from-purple-900/40 to-transparent border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-2">Skill Recommendations</h3>
            <p className="text-sm text-purple-300 mb-4 opacity-80">Based on higher-level peers at {user?.university}</p>
            
            {recommendedSkills.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 border border-white/10 rounded-lg text-center bg-white/5">
                No recommendations available yet. Keep ranking up!
              </p>
            ) : (
              <div className="space-y-3">
                {recommendedSkills.map((rec, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center group">
                    <div>
                      <div className="text-white font-medium text-sm">{rec.skill_name}</div>
                      <div className="text-xs text-gray-400">Mastered by {rec.peer_count} peers</div>
                    </div>
                    <button 
                      onClick={() => addSkill(rec.skill_name, rec.category)}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500 hover:text-white transition-colors"
                    >
                      Learn
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card border-red-500/30">
            <div className="flex items-center space-x-2 text-red-400 font-bold mb-4">
              <Shield className="w-5 h-5" />
              <h2>Danger Zone</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="w-full py-2 bg-red-500/10 text-red-500 font-medium rounded-lg border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
