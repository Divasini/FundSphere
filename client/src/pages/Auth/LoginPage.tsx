import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-cloud-200 rounded-3xl p-8 shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ice-600 to-mint-500 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-cloud-900">Welcome Back</h2>
          <p className="text-xs text-cloud-800/70">
            Sign in to FundSphere to manage campaigns, monitor contributions, and receive updates.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-softpink-50 border border-softpink-200 rounded-2xl flex items-center gap-2 text-xs text-softpink-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cloud-900 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cloud-900 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="p-3.5 bg-ice-50/70 border border-ice-100 rounded-2xl text-[11px] text-cloud-800 space-y-1">
          <p className="font-bold text-ice-700">Demo Credentials:</p>
          <p className="text-cloud-800/80">Admin: <code className="font-mono bg-white px-1 rounded">admin@fundsphere.com</code> / <code className="font-mono bg-white px-1 rounded">admin123</code></p>
          <p className="text-cloud-800/80">User: <code className="font-mono bg-white px-1 rounded">vikram@investor.com</code> / <code className="font-mono bg-white px-1 rounded">password123</code></p>
        </div>

        <p className="text-center text-xs text-cloud-800/70">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-ice-600 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
