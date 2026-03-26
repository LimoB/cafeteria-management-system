import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout } from '../../../app/slices/authSlice';
import { updateProfile, fetchUserProfile } from '../../../app/slices/userSlice';
import { fetchPaymentHistory, initiateMpesaPayment } from '../../../app/slices/paymentSlice';
import { UserProfile } from '../../../types/user.types'; 
import { 
  User as UserIcon, CreditCard, LogOut, CheckCircle2, ShieldCheck,
  Zap, History, Edit3, Loader2, BookOpen, Hash, Phone, RefreshCw, Clock
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/dateFormatter';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user: authUser } = useAppSelector((state) => state.auth);
  const { history = [], isProcessing: paymentsLoading } = useAppSelector((state) => state.payments);
  const { isLoading: userLoading, selectedUser } = useAppSelector((state) => state.users);

  const profileData = (selectedUser || authUser) as UserProfile | null;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      dispatch(fetchUserProfile(Number(authUser.id)));
      dispatch(fetchPaymentHistory(false));
    }
  }, [dispatch, authUser?.id]);

  useEffect(() => {
    if (profileData?.phone) {
      setPhoneNumber(String(profileData.phone));
    }
  }, [profileData?.phone]);

  /** * VERIFICATION LOGIC
   * Matches your interface: paymentStatus must be 'completed'
   */
  const isBananaVerified = (profileData as any)?.isVerified || 
    (Array.isArray(history) && history.some(p => 
      p.paymentStatus === 'completed' && Number(p.amount) === 1
    ));

  const handleRefresh = async () => {
    if (!authUser?.id) return;
    const loadId = toast.loading("Syncing Ledger...");
    try {
      await dispatch(fetchPaymentHistory(false)).unwrap();
      await dispatch(fetchUserProfile(Number(authUser.id))).unwrap();
      toast.success("Status Updated", { id: loadId });
    } catch (err) {
      toast.error("Sync failed", { id: loadId });
    }
  };

  const triggerVerification = async () => {
    const activePhone = profileData?.phone || phoneNumber;
    if (!activePhone) {
      toast.error("M-Pesa number required!");
      return;
    }
    setIsVerifying(true);
    try {
      await dispatch(initiateMpesaPayment({
        orderId: `VERIFY-${profileData?.id || Date.now()}`,
        amount: 1,
        phoneNumber: String(activePhone) 
      })).unwrap();
      toast.success("Check your phone for PIN prompt");
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : "STK Push failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!profileData?.id) return;
    let cleanPhone = phoneNumber.replace(/\s/g, '').replace('+', '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    
    try {
      await dispatch(updateProfile({ 
        id: Number(profileData.id), 
        userData: { phone: cleanPhone } 
      })).unwrap();
      setIsEditingPhone(false);
      toast.success("M-Pesa Link Updated!");
    } catch (err: any) {
      toast.error("Update failed.");
    }
  };

  // Calculations based on 'completed' status
  const totalSpent = history.reduce((acc, curr) => 
    acc + (curr.paymentStatus === 'completed' ? Number(curr.amount) : 0), 0
  );
  
  const successfulOrders = history.filter(h => h.paymentStatus === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 blur-[120px] rounded-full -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-tr from-red-600 to-orange-500 p-0.5 shadow-2xl">
              <div className="h-full w-full bg-slate-950 rounded-[2.4rem] flex items-center justify-center text-4xl font-black italic uppercase">
                {profileData?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <div className={`absolute -bottom-2 -right-2 p-2 rounded-full border-4 border-slate-950 shadow-lg ${isBananaVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}>
              {isBananaVerified ? <ShieldCheck size={18} className="text-white" /> : <Clock size={18} className="text-white" />}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none mb-4">
              {profileData?.name || "Student"}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span 
                onClick={() => !isBananaVerified && triggerVerification()}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${isBananaVerified ? 'bg-emerald-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isVerifying ? <Loader2 size={12} className="animate-spin" /> : (isBananaVerified ? <><CheckCircle2 size={12}/> Verified Student</> : <><Zap size={12}/> Verify Account (Ksh 1)</>)}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleRefresh} 
            disabled={paymentsLoading} 
            className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 active:scale-90"
          >
            <RefreshCw size={20} className={paymentsLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 border-t border-white/5 pt-10">
          <Stat label="Total Fuelled" value={formatCurrency(totalSpent)} />
          <Stat label="Success Orders" value={successfulOrders} />
          <Stat label="Security Tier" value={isBananaVerified ? 'Tier 1' : 'Unverified'} color={isBananaVerified ? 'text-emerald-400' : 'text-red-500'} />
          <div className="flex flex-col justify-end items-center md:items-end">
            <button onClick={() => { dispatch(logout()); navigate('/login'); }} className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <LogOut size={14} /> Terminate
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-3">
               <UserIcon size={16} className="text-red-600" /> Identity Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <ProfileField label="Reg Number" value={profileData?.registerNumber} icon={<Hash size={14}/>} />
              <ProfileField label="Academic Unit" value={profileData?.department} icon={<BookOpen size={14}/>} />
              
              <div className="space-y-3 md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={10} className="text-red-600" /> M-Pesa Link
                </p>
                <div className={`flex items-center justify-between p-3 pl-6 rounded-2xl border transition-all ${isEditingPhone ? 'border-red-600 ring-4 ring-red-50 bg-white' : 'border-gray-100 bg-slate-50'}`}>
                  {isEditingPhone ? (
                    <input autoFocus type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-transparent outline-none font-black text-sm w-full" />
                  ) : (
                    <span className="font-bold text-gray-900">{profileData?.phone || "Not Linked"}</span>
                  )}
                  <button onClick={() => isEditingPhone ? handleUpdatePhone() : setIsEditingPhone(true)} className="p-3 bg-white border border-gray-100 rounded-xl hover:text-red-600">
                    {userLoading ? <Loader2 size={16} className="animate-spin" /> : (isEditingPhone ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Edit3 size={16} />)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RECENT ACTIVITY --- */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm h-full">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-3">
              <History size={16} className="text-red-600" /> Recent Activity
            </h3>

            <div className="space-y-4">
              {history.length > 0 ? (
                history.slice(0, 5).map((pay, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-gray-50 hover:border-red-100 transition-all">
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-tighter ${pay.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {pay.paymentStatus === 'completed' ? 'SUCCESS' : pay.paymentStatus.toUpperCase()}
                      </p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">
                        {/* Fixed null createdAt check */}
                        {pay.createdAt ? formatDate(pay.createdAt) : 'Awaiting sync'}
                      </p>
                    </div>
                    <p className="text-sm font-black text-gray-900">{formatCurrency(pay.amount)}</p>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20"><CreditCard size={32} className="mx-auto" /></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const Stat = ({ label, value, color = "text-white" }: { label: string; value: string | number; color?: string }) => (
  <div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

const ProfileField = ({ label, value, icon }: { label: string; value?: string | number; icon: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{icon} {label}</p>
    <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100 flex items-center font-bold text-gray-900 uppercase text-xs truncate">
      {value || "NOT SET"}
    </div>
  </div>
);

export default Profile;