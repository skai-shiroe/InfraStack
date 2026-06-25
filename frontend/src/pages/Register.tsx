import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import {
  Box,
  Mail,
  Lock,
  User,
  UserPlus,
  Sun,
  Moon,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme()!;

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      await login(res.data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      <div className="relative w-full max-w-lg">
        {/* Theme toggle */}
        <div className="absolute top-0 right-0 -mt-14">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Card */}
        <div className={`rounded-3xl shadow-xl border ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="p-10 sm:p-12">
            {/* Logo */}
            <div className="text-center mb-10">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mx-auto ${
                isDark
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600'
              }`}>
                <Box className="w-10 h-10 text-white" />
              </div>
              <h1 className={`text-3xl font-bold mt-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Inventra
              </h1>
              <p className={`mt-8 text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Create your account
              </p>
            </div>

            <h2 className={`text-xl font-semibold mb-8 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Get started for free
            </h2>

            {/* Error */}
            {error && (
              <div className={`flex items-center gap-3 px-5 py-4 rounded-xl mb-8 text-base ${
                isDark
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-red-50 border border-red-100 text-red-600'
              }`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-base font-medium mb-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-12 pr-5 py-4 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-purple-500'
                    }`}
                    placeholder="               John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-base font-medium mb-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-5 py-4 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-purple-500'
                    }`}
                    placeholder="               you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-base font-medium mb-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-14 py-4 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-purple-500'
                    }`}
                    placeholder="               Min. 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${
                      isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-base font-medium mb-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-14 py-4 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-purple-500'
                    }`}
                    placeholder="               Repeat your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${
                      isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-8 ${
                  isDark
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Already have an account?
              </p>
              <Link
                to="/login"
                className={`inline-flex items-center gap-1.5 mt-1.5 text-base font-semibold ${
                  isDark
                    ? 'text-purple-400 hover:text-purple-300'
                    : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}