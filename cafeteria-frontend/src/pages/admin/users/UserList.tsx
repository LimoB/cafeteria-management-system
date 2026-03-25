import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchAllUsers, removeUser } from '../../../app/slices/userSlice';
import { ShieldCheck, Mail, Search, Loader2, UserMinus, GraduationCap, Building2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleDeleteUser = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove all their order history.`)) {
      try {
        await dispatch(removeUser(id)).unwrap();
        toast.success("User removed successfully");
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  // Filter logic for the search bar
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.registerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Student Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            User <span className="text-red-600">Directory</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm">Manage student accounts and cafeteria staff permissions.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search name, email or Reg No..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-red-500/5 focus:border-red-200 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Users</p>
          <p className="text-2xl font-black text-gray-900">{users.length}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 shadow-sm">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Admins</p>
          <p className="text-2xl font-black text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-gray-100">
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-6">Student Information</th>
                <th className="px-6 py-6">Academic Details</th>
                <th className="px-6 py-6">Access Role</th>
                <th className="px-6 py-6">Account Status</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-gray-400 font-bold text-sm italic">No users found matching "{searchTerm}"</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-red-50/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg border border-slate-200 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover rounded-2xl" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm tracking-tight">{user.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <Mail size={10} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-900 flex items-center gap-1.5 uppercase">
                          <GraduationCap size={12} className="text-red-500" /> {user.registerNumber}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                          <Building2 size={10} /> {user.department || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 bg-black text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-black/10">
                          <ShieldCheck size={12} className="text-red-500" /> System Admin
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-xl">Student</span>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1.5 rounded-xl border border-emerald-100">
                        <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={`tel:${user.phone}`}
                          className="p-3 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                          title="Call Student"
                        >
                          <Phone size={18} />
                        </a>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                          title="Revoke Access"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;