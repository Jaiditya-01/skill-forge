import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Save, User as UserIcon, Settings as SettingsIcon, Shield, Code, Loader2, BookOpen } from 'lucide-react';
import SkillTagsInput from '../components/dashboard/SkillTagsInput';

const Settings = () => {
  const { user, profile, refreshUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    github_username: '',
    leetcode_username: '',
    codeforces_username: '',
    codechef_username: ''
  });

  const [basicProfile, setBasicProfile] = useState({
    target_role: '',
    year: '',
    skill_level: '',
    preferred_stack: '',
    internship_timeline: ''
  });

  const [skillProfile, setSkillProfile] = useState({
    dsa_topics: [],
    programming_languages: [],
    frameworks: [],
    tools: [],
    soft_skills: [],
    project_experience: [],
    interview_preparedness: 'Beginner'
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
    if (user) {
      setBasicProfile({
        target_role: user.target_role || '',
        year: user.year || '',
        skill_level: user.skill_level || '',
        preferred_stack: user.preferred_stack || '',
        internship_timeline: user.internship_timeline || ''
      });
    }
    fetchSkillProfile();
    fetchSkillsAndRecs();
  }, [profile, user]);

  const fetchSkillProfile = async () => {
    try {
      const res = await api.get('/skills-profile');
      if (res.data.success) {
        setSkillProfile(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch skill profile', error);
    }
  };

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

  const handleBasicProfileChange = (e) => {
    setBasicProfile({ ...basicProfile, [e.target.name]: e.target.value });
  };

  const handleSkillTagsChange = (key, tags) => {
    setSkillProfile({ ...skillProfile, [key]: tags });
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
      const errMsg = error.response?.data?.detail || 'Failed to save settings.';
      setMessage({ text: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveBasicProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/auth/me', basicProfile);
      setMessage({ text: 'Professional profile updated!', type: 'success' });
      await refreshUser();
    } catch (error) {
      setMessage({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveSkillProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/skills-profile', skillProfile);
      setMessage({ text: 'Skill tags updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to save skills.', type: 'error' });
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

          {/* ----- Professional Profile Form ----- */}
          <form onSubmit={saveBasicProfile} className="glass-card">
            <div className="flex items-center space-x-2 text-white font-bold mb-6 border-b border-white/10 pb-4">
              <UserIcon className="w-5 h-5 text-emerald-400" />
              <h2>Professional Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Role</label>
                <select name="target_role" value={basicProfile.target_role} onChange={handleBasicProfileChange} className="w-full glass-input bg-white/5 appearance-none text-gray-200">
                  <option value="">Select Role</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current Year</label>
                <select name="year" value={basicProfile.year} onChange={handleBasicProfileChange} className="w-full glass-input bg-white/5 appearance-none text-gray-200">
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Skill Level</label>
                <select name="skill_level" value={basicProfile.skill_level} onChange={handleBasicProfileChange} className="w-full glass-input bg-white/5 appearance-none text-gray-200">
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Stack</label>
                <select name="preferred_stack" value={basicProfile.preferred_stack} onChange={handleBasicProfileChange} className="w-full glass-input bg-white/5 appearance-none text-gray-200">
                  <option value="">Select Stack</option>
                  <option value="MERN">MERN</option>
                  <option value="MEAN">MEAN</option>
                  <option value="Django + React">Django + React</option>
                  <option value="Spring Boot">Spring Boot</option>
                  <option value="Go + React">Go + React</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="glass-button bg-emerald-600 hover:bg-emerald-700 flex items-center">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Details
              </button>
            </div>
          </form>

          {/* ----- Skill Tags Form ----- */}
          <form onSubmit={saveSkillProfile} className="glass-card">
            <div className="flex items-center space-x-2 text-white font-bold mb-6 border-b border-white/10 pb-4">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2>Skill Inventory</h2>
            </div>
            
            <div className="space-y-4">
              <SkillTagsInput 
                label="DSA Topics" 
                tags={skillProfile.dsa_topics || []} 
                onChange={(t) => handleSkillTagsChange('dsa_topics', t)} 
                placeholder="e.g. Arrays, Graph, DP..." 
              />
              <SkillTagsInput 
                label="Programming Languages" 
                tags={skillProfile.programming_languages || []} 
                onChange={(t) => handleSkillTagsChange('programming_languages', t)} 
                placeholder="e.g. Python, C++, TS..." 
              />
              <SkillTagsInput 
                label="Frameworks & Libraries" 
                tags={skillProfile.frameworks || []} 
                onChange={(t) => handleSkillTagsChange('frameworks', t)} 
                placeholder="e.g. React, Express..." 
              />
              <SkillTagsInput 
                label="Developer Tools" 
                tags={skillProfile.tools || []} 
                onChange={(t) => handleSkillTagsChange('tools', t)} 
                placeholder="e.g. Git, Docker, AWS..." 
              />
              <SkillTagsInput 
                label="Soft Skills" 
                tags={skillProfile.soft_skills || []} 
                onChange={(t) => handleSkillTagsChange('soft_skills', t)} 
                placeholder="e.g. Leadership, Agile..." 
              />

              <div className="pt-4 border-t border-white/10 mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Interview Preparedness</label>
                <select name="interview_preparedness" value={skillProfile.interview_preparedness} onChange={(e) => setSkillProfile({...skillProfile, interview_preparedness: e.target.value})} className="w-full md:w-1/2 glass-input bg-white/5 appearance-none text-gray-200">
                  <option value="Beginner">Beginner - Just starting</option>
                  <option value="Intermediate">Intermediate - Getting there</option>
                  <option value="Advanced">Advanced - Ready to interview</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button type="submit" disabled={loading} className="glass-button bg-amber-600 hover:bg-amber-700 flex items-center">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Skills
              </button>
            </div>
          </form>

          {/* ----- Read-Only Personal Info ----- */}
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
