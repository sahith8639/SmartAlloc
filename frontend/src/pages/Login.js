import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, User, Terminal } from 'lucide-react';
import { useAppContext } from '../App';

function Login() {
  const { setUser, addNotification } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide all credentials');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${window.location.protocol}//${window.location.hostname}:5000/api/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        addNotification(`Welcome back, ${userData.username}!`, 'success');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check connection and credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick filler for testing
  const handleQuickLogin = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('manager');
      setPassword('manager123');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 px-4">
      <div className="w-full max-w-md p-8 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>

        {/* Heading Logo */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg mb-3">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans text-center">Smart OS Allocator</h2>
          <p className="text-slate-400 text-xs mt-1 text-center">Real-Time Intelligent Resource Rebalancing Engine</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-danger/10 border border-danger/30 text-danger text-xs rounded-lg text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-primary/50 text-white rounded-lg focus:outline-none transition-all text-sm font-sans"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-primary/50 text-white rounded-lg focus:outline-none transition-all text-sm font-sans"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-lg hover:from-primary-dark hover:to-secondary-dark focus:outline-none transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating System...' : 'Access Dashboard'}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center relative z-10">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Quick Account Access</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all font-mono flex items-center justify-center gap-1.5"
            >
              <Terminal size={12} className="text-primary-light" /> admin (Admin)
            </button>
            <button
              onClick={() => handleQuickLogin('manager')}
              className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all font-mono flex items-center justify-center gap-1.5"
            >
              <Terminal size={12} className="text-secondary-light" /> manager (Manager)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 relative z-10">
          Don't have an operator profile?{' '}
          <Link to="/register" className="text-primary-light hover:underline font-bold">
            Register Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
