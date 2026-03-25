import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks'; // Using your typed hooks
import { login, resetAuth } from '../../app/slices/authSlice';
import { UtensilsCrossed, Loader2, AlertCircle, Lock, User as UserIcon } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '', 
    password: '',
  });

  const { username, password } = formData;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux with proper types
  const { user, isLoading, isError, message, role } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // If login is successful, redirect based on role
    if (user && role) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    }

    // Cleanup error messages on unmount
    return () => {
      dispatch(resetAuth());
    };
  }, [user, role, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Using the LoginCredentials interface structure
    dispatch(login({
      username,
      password,
      isAdmin: false, // Explicitly student login
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100">
        
        {/* Branding Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-200 rotate-3 hover:rotate-0 transition-transform duration-300">
              <UtensilsCrossed className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-8 text-4xl font-black text-gray-900 tracking-tighter uppercase">
            Student <span className="text-red-600">Login</span>
          </h2>
          <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Laikipia Student Center
          </p>
        </div>

        {/* Error Feedback */}
        {isError && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 px-4 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in zoom-in duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{message || "Invalid credentials, please try again."}</p>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Username / Email
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-red-600 transition-colors" />
                <input
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={onChange}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent placeholder-gray-300 text-gray-900 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white transition-all font-bold text-sm"
                  placeholder="e.g. boaz_kip"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Secret Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-red-600 transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={onChange}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent placeholder-gray-300 text-gray-900 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white transition-all font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
  <Link 
    to="/auth/forgot-password" 
    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors"
  >
    Forgot password?
  </Link>
</div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-5 px-4 text-xs font-black uppercase tracking-widest rounded-2xl text-white bg-black hover:bg-red-600 focus:outline-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Secure Sign In"
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-gray-50">
           <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-tight">
            New at Laikipia?{' '}
            <Link to="/auth/register" className="text-red-600 font-black hover:underline underline-offset-4">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;