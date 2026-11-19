import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Mic, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, loginAsDemoUser, isFirebaseConnected } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoUser();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F7F7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#E5E5E5] rounded-2xl p-8 sm:p-10 shadow-sm">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center mx-auto">
            <Mic className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight pt-1">
            Sign In to HearMe AI
          </h2>
          <p className="text-xs text-[#666666]">
            Enter your credentials to access your caption history and saved signs.
          </p>
        </div>

        {/* Auth Mode Indicator */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#555555] bg-[#F7F7F7] py-1.5 px-3 rounded-full border border-[#E5E5E5]">
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          <span>{isFirebaseConnected ? 'FIREBASE AUTH CONNECTED' : 'EVALUATOR & LOCAL AUTH MODE'}</span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl border border-black bg-white text-black text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777777]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#D4D4D4] rounded-xl text-xs sm:text-sm text-black placeholder-[#777777] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777777]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-white border border-[#D4D4D4] rounded-xl text-xs sm:text-sm text-black placeholder-[#777777] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777777] hover:text-black"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-[#1C1C1C] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Instant Demo Login */}
        <div className="pt-2 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 rounded-xl bg-white border border-black text-black hover:bg-[#F7F7F7] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Sign In (Evaluator Mode)</span>
          </button>
        </div>

        {/* Navigation to Registration */}
        <div className="text-center text-xs text-[#666666]">
          Don't have an account?{' '}
          <Link to="/register" className="text-black font-semibold underline underline-offset-4 hover:text-[#444444]">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};
