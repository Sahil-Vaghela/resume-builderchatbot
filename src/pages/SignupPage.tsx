import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await signup(trimmedName, trimmedEmail, password);
      // Redirect directly to the New Chat Screen
      navigate('/chat', { replace: true });
    } catch (err: any) {
      console.error('Signup error:', err);
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('The password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('The email address provided is invalid.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F7F7F4] flex flex-col justify-center items-center px-4 py-8 select-none">
      
      {/* Centered Neumorphic Card */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl neu-raised p-6 sm:p-8 md:p-10 transition-all">
        
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#047857] text-white flex items-center justify-center shadow-xs mb-4">
            <FileText className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] mb-1.5">
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
            Start building your professional resume with ResumeAI.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-2xl bg-[#DC2626]/8 border border-[#DC2626]/20 flex items-start gap-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Full Name field */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Nishu Sharma"
              disabled={loading}
              autoComplete="name"
              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] neu-inset-sm rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#737373] focus:outline-hidden focus:border-[#047857]/50 transition-colors"
            />
          </div>

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nishu@example.com"
              disabled={loading}
              autoComplete="email"
              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] neu-inset-sm rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#737373] focus:outline-hidden focus:border-[#047857]/50 transition-colors"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
                className="w-full bg-[#FFFFFF] border border-[#E5E5E5] neu-inset-sm rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#737373] focus:outline-hidden focus:border-[#047857]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#737373] hover:text-[#171717] cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password field */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Confirm password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] neu-inset-sm rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#737373] focus:outline-hidden focus:border-[#047857]/50 transition-colors"
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl neu-button-emerald text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-[#E5E5E5] text-center text-xs text-[#737373]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#047857] hover:underline ml-1"
          >
            Sign in
          </Link>
        </div>

      </div>

      <div className="mt-6 text-[11px] text-[#737373] text-center">
        ResumeAI · Secured with Firebase Authentication
      </div>
    </div>
  );
}
