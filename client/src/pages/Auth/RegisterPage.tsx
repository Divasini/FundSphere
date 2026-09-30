import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // All fields entered by user! Zero defaults!
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecretCode, setAdminSecretCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await register({
        name,
        email,
        password,
        confirmPassword,
        adminSecretCode: adminSecretCode.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-cloud-200 rounded-3xl p-8 shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ice-600 to-mint-500 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-cloud-900">Create an Account</h2>
          <p className="text-xs text-cloud-800/70">
            Join the FundSphere community to launch campaigns and fund groundbreaking ideas.
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
            <label className="block text-xs font-bold text-cloud-900 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cloud-900 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="maya@example.com"
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cloud-900 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
            />
          </div>

          <div className="pt-1">
            <details className="text-xs group">
              <summary className="cursor-pointer text-cloud-800/70 hover:text-ice-600 font-semibold select-none flex items-center justify-between">
                <span>Want to register as an Administrator? (Optional)</span>
                <span className="text-[10px] text-ice-600 group-open:rotate-180 transition">▼</span>
              </summary>
              <div className="mt-2.5 p-3.5 bg-lavender-50/60 border border-lavender-200/80 rounded-2xl space-y-2">
                <label className="block text-[11px] font-bold text-lavender-900">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  placeholder="Enter passcode (e.g. admin2026)"
                  value={adminSecretCode}
                  onChange={(e) => setAdminSecretCode(e.target.value)}
                  className="w-full p-2.5 bg-white border border-lavender-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-lavender-500"
                />
                <p className="text-[10px] text-lavender-800/80">
                  Passcode: <code className="bg-white px-1 py-0.5 rounded font-mono font-bold text-lavender-900">admin2026</code>. Leave empty to register as a standard user.
                </p>
              </div>
            </details>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-cloud-800/70">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-ice-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
