import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { KeyRound, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(username);
      setIsSubmitted(true);
      toast.success("Reset link sent to your registered email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-500 mb-8">
            We've sent password reset instructions to the email associated with <strong>{username}</strong>.
          </p>
          <Link to="/auth/login" className="text-primary font-bold hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-black text-gray-900 tracking-tight">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-500">Enter your username or Reg Number to recover your account.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="relative">
            <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Username / Reg Number</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all"
              placeholder="e.g. L12/12345/22"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-red-700 transition-all shadow-lg disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <Link to="/auth/login" className="text-gray-500 hover:text-primary font-medium inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Remembered it? Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;