import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from '../../app/slices/authSlice';
import { ShieldCheck, Loader2, Lock, User, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { username, password } = formData;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, message, role } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Monitor Redux Auth State
    console.log("[AdminLogin State Update]:", { user, role, isError, message });

    if (user && role === 'admin') {
      console.log("[AdminLogin]: Admin verified. Redirecting...");
      navigate('/admin/dashboard');
    } else if (user && role !== 'admin') {
      console.error("[AdminLogin]: Role Mismatch! Found role:", role);
      toast.error(`Access Denied: Account is a ${role}, not an admin`);
    }
    
    // REMOVED cleanup: dispatch(resetAuth()) here was wiping the state 
    // before the ProtectedRoute could read it.
  }, [user, role, navigate, isError, message]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[AdminLogin Submit]: Dispatching login with isAdmin: true", { username });
    dispatch(login({ username, password, isAdmin: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-black/50 border border-slate-800/10">
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-100 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck className="h-10 w-10 text-slate-900" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Canteen <span className="text-red-600">Staff</span>
          </h2>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
            Secure Management Portal
          </p>
        </div>

        {isError && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 flex items-center gap-3 animate-shake">
            <AlertCircle className="h-5 w-5 shrink-0" /> 
            <p>{message || "Unauthorized Access"}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Staff ID / Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={onChange}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-bold text-sm"
                  placeholder="admin_boaz"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={onChange}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-5 px-4 text-xs font-black uppercase tracking-widest rounded-2xl text-white bg-slate-900 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>Enter Dashboard <ChevronRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-slate-50">
          <Link to="/auth/login" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors">
            Switch to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;