import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      setError('');
      // Navigation is handled by the useEffect above
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-between p-4">
      {/* Main Content Wrapper to center form */}
      <div className="w-full flex-1 flex flex-col items-center justify-center">
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl mb-6 shadow-lg">
                <img src="https://aistudiocdn.com/uploads/1c521369-0260-496e-a3b0-45d2729a35e8.png" alt="YOTA Logo" className="h-16 w-auto object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
                SendREQ
            </h1>
            <p className="text-brand-teal">YOTA Payment Request System</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                  placeholder="you@org.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-brand-orange text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-teal hover:bg-[#008f7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal transition-colors"
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 text-center">Demo Credentials (Password: <strong>password123</strong>):</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <button onClick={() => { setEmail('alice@org.com'); setPassword('password123'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-left transition-colors">
                    <strong>Staff:</strong> alice@org.com
                </button>
                <button onClick={() => { setEmail('charlie@org.com'); setPassword('password123'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-left transition-colors">
                    <strong>Auth:</strong> charlie@org.com
                </button>
                <button onClick={() => { setEmail('eve@org.com'); setPassword('password123'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-left transition-colors">
                    <strong>Exec:</strong> eve@org.com
                </button>
                <button onClick={() => { setEmail('admin@org.com'); setPassword('password123'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-left transition-colors">
                    <strong>Admin:</strong> admin@org.com
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Copyright Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} SendREQ. Custom developed for <span className="font-semibold text-brand-teal">YOTA - Youth Opportunity and Transformation in Africa</span>.
        </p>
      </footer>
    </div>
  );
};