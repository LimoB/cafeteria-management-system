import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchAllUsers, removeUser } from '../../../app/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Search, Loader2, Trash2, 
  Phone, UserPlus, Users, GraduationCap, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

// 1. Fully Aligned Interface with your SQLite Schema
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  registerNumber: string;
  department: string;
  username: string;
  graduationYear: number;
  avatarUrl?: string;
  role: string; // Used for frontend logic (Admin vs Student)
}

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Explicitly type the selector to avoid 'unknown' errors
  const { users, isLoading } = useAppSelector((state) => state.users) as { users: User[], isLoading: boolean };
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const admins = users.filter((u: User) => u.role?.toLowerCase() === 'admin');
  const students = users.filter((u: User) => u.role?.toLowerCase() !== 'admin');

  const handleDeleteUser = async (id: number, name: string, role: string) => {
    if (role?.toLowerCase() === 'admin') {
      toast.error("SECURITY ALERT: Admin accounts cannot be purged.");
      return;
    }

    if (window.confirm(`PERMANENT ACTION: Revoke all access for ${name}?`)) {
      try {
        await dispatch(removeUser(id)).unwrap();
        toast.success("User purged from registry");
      } catch (err) {
        toast.error("Security override failed");
      }
    }
  };

  const filteredUsers = users.filter((u: User) => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Decrypting Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* --- STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-orange-500 transition-all">
          <div className="flex justify-between items-start mb-4">
            <Users className="text-slate-300 group-hover:text-orange-500 transition-colors" size={24} />
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{users.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Personnel</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
           <ShieldCheck className="absolute -right-4 -top-4 text-white/5" size={120} />
           <p className="text-4xl font-black text-white tracking-tighter relative z-10">{admins.length}</p>
           <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1 relative z-10">System Admins</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-orange-500 transition-all">
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{students.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Students</p>
        </div>
      </div>

      {/* --- SEARCH & NAVIGATION --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, reg, or username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => navigate('/admin/users/add')}
          className="flex items-center gap-3 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95 shadow-orange-500/20"
        >
          <UserPlus size={16} /> Add Personnel
        </button>
      </div>

      {/* --- REGISTRY TABLE --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-10 py-8">Identity</th>
                <th className="px-6 py-8">Classification</th>
                <th className="px-6 py-8">Contact Info</th>
                <th className="px-10 py-8 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user: User) => {
                const isUserAdmin = user.role?.toLowerCase() === 'admin';
                return (
                  <tr key={user.id} className="hover:bg-orange-50/30 transition-all group">
                    {/* Column 1: Identity */}
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 transition-all duration-300 overflow-hidden
                          ${isUserAdmin 
                            ? 'bg-slate-900 text-white border-orange-500' 
                            : 'bg-white text-slate-400 border-slate-100 group-hover:border-orange-500 group-hover:text-orange-600'}`}>
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                            <span className="text-orange-500">@</span>{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Classification (Dept & Year) */}
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase flex items-center gap-2">
                          <MapPin size={10} className="text-orange-500" /> {user.department}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                          <GraduationCap size={10} /> Class of {user.graduationYear}
                        </p>
                      </div>
                    </td>

                    {/* Column 3: Contact Info */}
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-900 flex items-center gap-2">
                          <Mail size={10} className="text-orange-500" /> {user.email}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                          <Phone size={10} className="text-slate-400" /> {user.phone}
                        </p>
                      </div>
                    </td>

                    {/* Column 4: Controls */}
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {!isUserAdmin ? (
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Purge User"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <div className="p-3 text-slate-200 cursor-not-allowed">
                             <ShieldCheck size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;