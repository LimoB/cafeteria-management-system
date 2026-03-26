import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Shield, Mail, Hash, 
  ChevronLeft, Zap, Building2, Phone 
} from 'lucide-react';
import toast from 'react-hot-toast';

// NOTE: interface Props removed to fix the TypeScript error in AdminRoutes

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    registerNumber: '', 
    department: '', 
    phone: '', 
    role: 'student'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to dispatch your create user action would go here
    toast.success(`Access Protocol Initialized for ${formData.name}`);
    navigate('/admin/users'); // Redirect back to list after success
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Back Navigation */}
      <button 
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-orange-500 transition-all mb-8 group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Return to Registry
      </button>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          {/* Decorative background icon */}
          <Zap className="absolute -right-10 -bottom-10 text-white/5 rotate-12" size={240} />
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="bg-orange-500 p-4 rounded-[2rem] shadow-lg shadow-orange-500/20">
              <UserPlus size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                Register <span className="text-orange-500">Personnel</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">
                System Identity Access Protocol
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            
            {/* Full Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Shield size={12} className="text-orange-500" /> Full Identity
              </label>
              <input 
                required 
                type="text"
                placeholder="e.g. Alexander Pierce"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Mail size={12} className="text-orange-500" /> System Email
              </label>
              <input 
                required 
                type="email" 
                placeholder="name@laikipia.ac.ke"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 transition-all"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            {/* Register Number */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Hash size={12} className="text-orange-500" /> Register Number
              </label>
              <input 
                required 
                type="text"
                placeholder="L11/XXXXX/XX"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 transition-all"
                value={formData.registerNumber} 
                onChange={e => setFormData({...formData, registerNumber: e.target.value})} 
              />
            </div>

            {/* Privilege Level */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Zap size={12} className="text-orange-500" /> Privilege Level
              </label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 cursor-pointer transition-all appearance-none"
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="student">Student Access</option>
                <option value="admin">Executive Admin</option>
              </select>
            </div>

            {/* Department */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Building2 size={12} className="text-orange-500" /> Department
              </label>
              <input 
                type="text"
                placeholder="Computer Science"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 transition-all"
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})} 
              />
            </div>

            {/* Phone */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                <Phone size={12} className="text-orange-500" /> Contact Line
              </label>
              <input 
                type="text"
                placeholder="+254..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 transition-all"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-orange-600 transition-all shadow-2xl active:scale-[0.98] shadow-orange-900/20"
            >
              Initialize Personnel Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;