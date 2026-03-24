import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    major_semester: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await register(formData);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Registration failed. Please check your data.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md glass-card relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join SkillForge</h1>
            <p className="text-gray-400 text-center">Start your journey to coding mastery.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full glass-input" 
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full glass-input" 
                placeholder="you@university.edu"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full glass-input" 
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">University</label>
              <input 
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full glass-input" 
                placeholder="MIT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Major & Semester</label>
              <input 
                type="text"
                name="major_semester"
                value={formData.major_semester}
                onChange={handleChange}
                className="w-full glass-input" 
                placeholder="B.Tech CSE Semester VI"
              />
            </div>

            <button 
              type="submit" 
              className="w-full glass-button flex items-center justify-center mt-6 bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Log in instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
