import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(trimmedEmail);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      const code = err.code || '';
      if (code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (code === 'auth/invalid-email') {
        setError('The email address provided is invalid.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
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
            Reset your password
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
            Enter your registered email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-[#047857]/8 border border-[#047857]/20 flex items-start gap-2.5 text-xs text-[#047857]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Password reset link sent! Check your inbox for instructions to reset your password.
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-2xl bg-[#DC2626]/8 border border-[#DC2626]/20 flex items-start gap-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
              disabled={loading || success}
              autoComplete="email"
              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] neu-inset-sm rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#171717] placeholder-[#737373] focus:outline-hidden focus:border-[#047857]/50 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 py-3 px-4 rounded-xl neu-button-emerald text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending email...</span>
              </>
            ) : (
              <span>Send Reset Email</span>
            )}
          </button>

        </form>

        {/* Back to Login Link */}
        <div className="mt-8 pt-5 border-t border-[#E5E5E5] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#737373] hover:text-[#047857] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>

      </div>

      <div className="mt-6 text-[11px] text-[#737373] text-center">
        ResumeAI · Password recovery
      </div>
    </div>
  );
}
