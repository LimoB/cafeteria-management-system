import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout } from '../../../app/slices/authSlice';
import { updateProfile, fetchUserProfile } from '../../../app/slices/userSlice';
import { fetchPaymentHistory } from '../../../app/slices/paymentSlice';
// Assuming your types are exported from a types file
import { UserProfile } from '../../../types/user.types'; 
import { 
  User as UserIcon, Mail, CreditCard, LogOut, CheckCircle2, ShieldCheck,
  Zap, ArrowRight, History, Edit3, Loader2, BookOpen, GraduationCap, Hash, Phone
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get auth state and user slice state
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { history } = useAppSelector((state) => state.payments);
  const { isLoading, selectedUser } = useAppSelector((state) => state.users);

  // Cast to UserProfile to ensure TS recognizes registerNumber, graduationYear, etc.
  const profileData = (selectedUser || authUser) as UserProfile | null;

  const [phoneNumber, setPhoneNumber] = useState(profileData?.phone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      dispatch(fetchUserProfile(Number(authUser.id)));
      dispatch(fetchPaymentHistory(false));
    }
  }, [dispatch, authUser?.id]);

  // Sync internal state when profile data is fetched
  useEffect(() => {
    if (profileData?.phone) {
      setPhoneNumber(profileData.phone);
    }
  }, [profileData?.phone]);

  const handleUpdatePhone = async () => {
    if (!profileData?.id) return;
    
    // Basic validation
    if (phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number (e.g., 2547...)");
      return;
    }

    try {
      await dispatch(updateProfile({ 
        id: Number(profileData.id), 
        userData: { phone: phoneNumber } 
      })).unwrap();
      setIsEditingPhone(false);
      toast.success("M-Pesa link updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile details.");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Derived Insights
  const totalSpent = history.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const successfulOrders = history.filter(h => h.status === 'completed').length;
  const avgSpend = successfulOrders > 0 ? totalSpent / successfulOrders : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10 pb-20">
      
      {/* --- HERO SECTION: DIGITAL ID CARD --- */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-slate-200 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-red-600/30 transition-colors duration-700" />
        <Zap className="absolute top-10 right-10 text-white/5 rotate-12" size={120} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-tr from-red-600 to-orange-500 p-1 shadow-2xl shadow-red-900/20">
              <div className="h-full w-full bg-slate-900 rounded-[2.3rem] flex items-center justify-center text-4xl font-black italic uppercase">
                {profileData?.name?.charAt(0) || profileData?.username?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-slate-900">
              <ShieldCheck size={16} className="text-white" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              {profileData?.name || "Student User"}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {profileData?.department || 'General Student'}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${profileData?.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'}`}>
                {profileData?.role === 'admin' ? 'Staff/Admin' : 'Active Student'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 border-t border-white/10 pt-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Fuelled</p>
            <p className="text-2xl font-black">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Orders Count</p>
            <p className="text-2xl font-black">{successfulOrders}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg per Meal</p>
            <p className="text-2xl font-black text-red-500">{formatCurrency(avgSpend)}</p>
          </div>
          <div className="flex flex-col justify-end">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              <LogOut size={14} /> Kill Session
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* --- LEFT: Account Settings --- */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
               <UserIcon size={16} className="text-red-600" /> Identity Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <ProfileField label="Full Name" value={profileData?.name} icon={<UserIcon size={14}/>} />
              <ProfileField label="Registration Number" value={profileData?.registerNumber} icon={<Hash size={14}/>} />
              <ProfileField label="Academic Department" value={profileData?.department} icon={<BookOpen size={14}/>} />
              <ProfileField label="Graduation Year" value={profileData?.graduationYear} icon={<GraduationCap size={14}/>} />
              <ProfileField label="Email Endpoint" value={profileData?.email} icon={<Mail size={14}/>} isFullWidth />

              {/* Editable Phone Field */}
              <div className="space-y-2 md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={10} className="text-red-600" /> Phone Link (M-Pesa Required)
                </p>
                <div className={`flex items-center justify-between p-2 pl-4 rounded-2xl border transition-all ${isEditingPhone ? 'border-red-600 bg-white ring-4 ring-red-50' : 'border-gray-100 bg-slate-50'}`}>
                  {isEditingPhone ? (
                    <input 
                      autoFocus
                      type="tel"
                      placeholder="2547..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-transparent outline-none font-black text-sm tracking-[0.2em] w-full"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 tracking-widest">
                      {profileData?.phone || "No phone linked"}
                    </span>
                  )}
                  
                  <button 
                    onClick={() => isEditingPhone ? handleUpdatePhone() : setIsEditingPhone(true)}
                    className="p-3 bg-white border border-gray-100 rounded-xl hover:text-red-600 shadow-sm transition-all"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isEditingPhone ? <CheckCircle2 size={16} className="text-green-600" /> : <Edit3 size={16} />)}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-[2rem] flex items-center gap-4">
             <div className="p-3 bg-white rounded-2xl shadow-sm">
                <ShieldCheck size={24} className="text-yellow-600" />
             </div>
             <div>
                <p className="text-[10px] font-black text-yellow-900 uppercase tracking-widest">Security Protocol</p>
                <p className="text-xs text-yellow-700 font-medium leading-tight mt-1">
                  Your biometric and payment data is secured by LU Digital's 256-bit encryption. All M-Pesa transactions are processed via Daraja API.
                </p>
             </div>
          </div>
        </div>

        {/* --- RIGHT: RECENT HISTORY PREVIEW --- */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                <History size={16} className="text-red-600" /> Payment Log
              </h3>
              <button onClick={() => navigate('/my-orders')} className="text-[10px] font-black uppercase text-red-600 flex items-center gap-1 hover:gap-2 transition-all">
                Full Log <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-4">
              {history.slice(0, 6).map((pay, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-50 group hover:border-red-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl group-hover:bg-red-50 transition-colors">
                      <CreditCard size={14} className="text-gray-400 group-hover:text-red-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-900 uppercase">{pay.status === 'completed' ? 'STK SUCCESS' : 'STK PENDING'}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(pay.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900">{formatCurrency(pay.amount)}</p>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                   <CreditCard size={32} />
                   <p className="text-[10px] font-black uppercase tracking-widest">No transactions logged</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const ProfileField = ({ label, value, icon, isFullWidth = false }: { label: string; value?: string | number; icon: React.ReactNode; isFullWidth?: boolean }) => (
  <div className={`space-y-2 ${isFullWidth ? 'md:col-span-2' : ''}`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </p>
    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 min-h-[56px] flex items-center">
      <span className="font-bold text-gray-900 truncate uppercase tracking-tight">{value || "N/A"}</span>
    </div>
  </div>
);

export default Profile;