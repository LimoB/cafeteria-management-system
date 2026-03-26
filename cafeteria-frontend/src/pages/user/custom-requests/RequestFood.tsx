import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { submitCustomOrder, getCustomOrders, initiateCustomPayment } from '../../../app/slices/customOrderSlice';
import { fetchLocations } from '../../../app/slices/locationSlice';
import { fetchPaymentHistory } from '../../../app/slices/paymentSlice';
import { fetchUserProfile } from '../../../app/slices/userSlice';
import { 
  UtensilsCrossed, Send, Info, 
  MapPin, ChevronDown, Clock, CheckCircle2, XCircle, 
  Zap, Loader2, History as HistoryIcon,
  BadgeCheck, CreditCard, Banknote, Phone, RefreshCw
} from 'lucide-react';
import { CustomOrderRequest } from '../../../types/customOrder.types';
import { formatDate } from '../../../utils/dateFormatter';
import toast from 'react-hot-toast';

const RequestFood: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux Slices
  const { customOrders = [], isLoading: ordersLoading } = useAppSelector((state) => state.customOrders);
  const { locations = [] } = useAppSelector((state) => state.locations);
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { selectedUser, users = [] } = useAppSelector((state) => state.users);
  const { history = [] } = useAppSelector((state) => state.payments);
  
  // Local Form State
  const [description, setDescription] = useState('');
  const [baseMeal, setBaseMeal] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  
  // Isolated Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  // Memoize activeUser for phone number accuracy
  const activeUser = useMemo(() => {
    const foundInList = users.find(u => String(u.id) === String(authUser?.id));
    return foundInList || selectedUser || authUser;
  }, [selectedUser, users, authUser]);

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(getCustomOrders()); 
    
    if (authUser?.id) {
      dispatch(fetchUserProfile(Number(authUser.id)));
    }

    if (!history || history.length === 0) {
      dispatch(fetchPaymentHistory(false));
    }
  }, [dispatch, authUser?.id]);

  const refreshData = async () => {
    toast.loading("Syncing kitchen data...", { id: 'sync-data' });
    try {
        await Promise.all([
            dispatch(getCustomOrders()).unwrap(),
            dispatch(fetchLocations()).unwrap(),
            authUser?.id ? dispatch(fetchUserProfile(Number(authUser.id))).unwrap() : Promise.resolve()
        ]);
        toast.success("Ledger Updated", { id: 'sync-data' });
    } catch (error) {
        toast.error("Sync failed", { id: 'sync-data' });
    }
  };

  const isBananaVerified = (activeUser as any)?.isVerified || 
    (Array.isArray(history) && history.some(p => p.status === 'completed' && Number(p.amount) === 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !selectedLocation) {
      toast.error("Please provide instructions and a pickup location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const locationName = locations.find(l => String(l.id) === selectedLocation)?.name || "Main Canteen";
      const finalDescription = baseMeal ? `[${baseMeal.toUpperCase()}] ${description}` : description;

      const requestData: CustomOrderRequest = {
          description: finalDescription,
          takeawayLocation: locationName,
          requestDate: new Date().toISOString()
      };

      await dispatch(submitCustomOrder(requestData)).unwrap();
      toast.success("Request sent to the kitchen!");
      setDescription('');
      setBaseMeal('');
      setSelectedLocation('');
    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (orderId: string) => {
    const orderToPay = customOrders.find(o => o.id === orderId);
    
    if (!orderToPay || !orderToPay.price || orderToPay.price <= 0) {
      toast.error("Price not assigned or invalid.");
      return;
    }

    const phone = activeUser?.phone || (authUser as any)?.phone;

    if (!phone || String(phone).trim() === '') {
      toast.error("Phone number missing. Update your profile.");
      return;
    }

    setIsPaying(orderId);
    try {
      const cleanPhone = String(phone).replace(/\s/g, '');
      await dispatch(initiateCustomPayment({ 
        orderId, 
        phoneNumber: cleanPhone 
      })).unwrap();
      
      toast.success(`M-Pesa Prompt sent to ${cleanPhone}`);
    } catch (err: any) {
      toast.error(err || "Payment failed to initiate");
    } finally {
      setIsPaying(null);
    }
  };

  const getStatusStyle = (status: string | undefined) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: <CheckCircle2 size={12} />, label: 'Quoted' };
      case 'rejected': return { bg: 'bg-red-500/10', text: 'text-red-600', icon: <XCircle size={12} />, label: 'Declined' };
      case 'pending': return { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: <Clock size={12} />, label: 'In Review' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-600', icon: <Info size={12} />, label: 'Processing' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 blur-[120px] rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-red-600 to-orange-500 p-0.5">
              <div className="h-full w-full bg-slate-950 rounded-[1.4rem] flex items-center justify-center">
                <UtensilsCrossed size={32} className="text-red-500" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                  Custom <span className="text-red-600">Specials</span>
                </h1>
                {isBananaVerified && <BadgeCheck className="text-emerald-400" size={28} />}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">
                Bespoke Dining & Dietary Engineering
              </p>
            </div>
          </div>

          <button 
            onClick={refreshData} 
            disabled={ordersLoading}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-white active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={ordersLoading ? "animate-spin" : ""} /> Sync Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* --- FORM SECTION --- */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-3">
               <Zap size={16} className="text-red-600" /> Request Parameters
            </h3>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Meal</label>
                  <input 
                    type="text"
                    placeholder="e.g. Rice & Beans"
                    value={baseMeal}
                    onChange={(e) => setBaseMeal(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-red-200 font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pickup Point</label>
                  <div className="relative">
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-gray-100 rounded-2xl outline-none appearance-none font-bold cursor-pointer focus:bg-white focus:border-red-200"
                    >
                      <option value="">Select Window...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={String(loc.id)}>{loc.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Instructions</label>
                <textarea 
                  rows={4}
                  placeholder="Tell the chef exactly what you need (allergies, extra portions, etc.)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-red-200 font-medium resize-none shadow-inner"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-950 hover:bg-red-600 text-white font-black uppercase tracking-widest py-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send to Kitchen</>}
              </button>
            </form>
          </div>
        </div>

        {/* --- ACTIVITY LOG SECTION --- */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm h-full flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3 mb-8">
              <HistoryIcon size={16} className="text-red-600" /> My Requests
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {(!customOrders || customOrders.length === 0) ? (
                <div className="py-20 text-center opacity-20">
                   <UtensilsCrossed size={40} className="mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No active requests</p>
                </div>
              ) : (
                customOrders.map((order) => {
                  const style = getStatusStyle(order.approvalStatus);
                  const isReadyToPay = order.approvalStatus === 'approved' && order.paymentStatus === 'pending';
                  const isPaid = order.paymentStatus === 'completed';
                  const displayPhone = activeUser?.phone || (authUser as any)?.phone;

                  return (
                    <div key={order.id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-gray-100 transition-all hover:border-red-100 group animate-in slide-in-from-right-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${style.bg} ${style.text}`}>
                          {style.icon} {style.label}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {order.createdAt ? formatDate(order.createdAt) : 'Recent'}
                        </span>
                      </div>
                      
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-4 leading-relaxed italic">"{order.description}"</p>
                      
                      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200/50">
                        {order.approvalStatus === 'approved' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <Banknote size={14} className="text-emerald-500" />
                                 <span className="text-sm font-black text-emerald-600 uppercase tracking-tighter">
                                   KES {order.price}
                                 </span>
                               </div>

                               {isReadyToPay && (
                                 <button 
                                   type="button"
                                   onClick={() => handlePayment(order.id)}
                                   disabled={isPaying === order.id}
                                   className="bg-slate-950 text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                  >
                                   {isPaying === order.id ? <Loader2 size={10} className="animate-spin" /> : <CreditCard size={12} />}
                                   Pay
                                 </button>
                               )}

                               {isPaid && (
                                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1">
                                   <CheckCircle2 size={10} /> Paid
                                 </span>
                               )}
                            </div>

                            {isReadyToPay && (
                               <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg border border-slate-100">
                                  <Phone size={10} className="text-slate-400" />
                                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Target: {displayPhone || "N/A"}
                                  </span>
                               </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-2">
                             <MapPin size={12} className="text-red-600" /> {order.takeawayLocation}
                           </span>
                           {order.approvalStatus === 'rejected' && (
                             <span className="text-[9px] font-black text-red-400 uppercase">Declined</span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestFood;