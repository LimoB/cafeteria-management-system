import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchAllOrders } from '../../../app/slices/orderSlice';
import { fetchPaymentHistory, initiateMpesaPayment } from '../../../app/slices/paymentSlice'; 
import { fetchUserProfile } from '../../../app/slices/userSlice';
import { 
  Clock, AlertCircle, Utensils, RefreshCw, ChevronRight, CreditCard, 
  MapPin, Receipt, ShieldCheck, Loader2, Phone, Edit3, X 
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/dateFormatter';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../../types/user.types';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  const { role, user: authUser } = useAppSelector((state) => state.auth);
  const { selectedUser } = useAppSelector((state) => state.users);
  
  const user = (selectedUser || authUser) as UserProfile | null;
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [customPhone, setCustomPhone] = useState<string>('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    dispatch(fetchAllOrders(isAdmin));
    dispatch(fetchPaymentHistory(isAdmin));
    if (authUser?.id && !selectedUser) {
      dispatch(fetchUserProfile(Number(authUser.id)));
    }
  }, [dispatch, isAdmin, authUser?.id, selectedUser]);

  const refreshData = () => {
    dispatch(fetchAllOrders(isAdmin));
  };

  const handlePayment = async (orderId: string, amount: number) => {
    const targetPhone = customPhone || user?.phone;

    if (!targetPhone || targetPhone.trim() === '') {
      toast.error("Phone number missing! Redirecting to profile...");
      setTimeout(() => navigate('/profile'), 2000);
      return;
    }

    setProcessingId(orderId);
    try {
      await dispatch(initiateMpesaPayment({
          orderId, 
          amount,
          phoneNumber: targetPhone.replace(/\s/g, '') 
      })).unwrap();
      
      toast.success(`STK Push sent to ${targetPhone}`);
      setEditingOrderId(null);
    } catch (error: any) {
      toast.error(error?.message || "Payment failed");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase() || 'placed';
    switch (s) {
      case 'ready': return { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', label: 'Ready for Pickup' };
      case 'preparing': return { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', label: 'In Kitchen' };
      case 'collected': return { bg: 'bg-slate-50', text: 'text-slate-400', dot: 'bg-slate-300', label: 'Collected' };
      case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Cancelled' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Placed' };
    }
  };

  if (ordersLoading && orders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="relative">
          <RefreshCw className="animate-spin text-red-600" size={48} />
          <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing your meals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <Receipt size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                {isAdmin ? 'Management Console' : 'Digital Receipts'}
              </span>
              {/* Added Linked Number Badge */}
              {!isAdmin && user?.phone && (
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    Linked: {user.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-none">
            {isAdmin ? 'All' : 'My'} <span className="text-red-600 underline decoration-gray-100">Orders</span>
          </h1>
        </div>
        
        <button 
          onClick={refreshData} 
          disabled={ordersLoading}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-[10px] font-black uppercase tracking-widest text-gray-600 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={ordersLoading ? "animate-spin" : ""} /> Refresh Status
        </button>
      </header>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[3rem] p-16 text-center shadow-sm">
          <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Utensils size={40} className="text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">No orders yet</h2>
          <p className="text-gray-400 mt-2 mb-8 font-medium italic">Your stomach is waiting for an adventure.</p>
          <Button onClick={() => navigate('/home')} className="rounded-2xl px-8">Browse Menu</Button>
        </div>
      ) : (
        <div className="grid gap-8">
          {orders.map((order) => {
            const isPaid = order.paymentStatus === 'completed';
            const statusCfg = getStatusConfig(order.status);
            const isEditing = editingOrderId === order.id;
            
            return (
              <div 
                key={order.id} 
                className={`group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] ${!isPaid ? 'ring-1 ring-red-100 bg-red-50/10' : ''}`}
              >
                <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border border-transparent ${statusCfg.bg} ${statusCfg.text}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{statusCfg.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{order.id.toUpperCase()}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
                        {order.details && order.details.length > 0 
                          ? `${order.details[0].foodName}${order.details.length > 1 ? ` + ${order.details.length - 1} more` : ''}` 
                          : 'Campus Meal'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Clock size={14} className="text-red-600" /> {formatDate(order.createdAt)}</span>
                        <span className="flex items-center gap-2">
                           <MapPin size={14} className="text-red-600" /> {order.takeawayLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RESTORED: Collection Code Section */}
                  <div className="lg:w-48 bg-slate-900 rounded-[2rem] p-6 text-center shadow-xl shadow-slate-200 relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white rounded-full -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full -translate-y-1/2" />
                    
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Collection Code</p>
                    <span className={`text-3xl font-black tracking-tighter ${isPaid ? 'text-white' : 'text-slate-700 opacity-50'}`}>
                      {isPaid ? order.id.split('-').pop()?.toUpperCase() : '••••'}
                    </span>
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                       {isPaid ? (
                         <div className="flex items-center gap-1 text-[8px] font-bold text-green-400 uppercase">
                           <ShieldCheck size={10} /> Validated
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-[8px] font-bold text-red-500 uppercase">
                           <AlertCircle size={10} /> Awaiting Pay
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-6 lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                     <div className="text-left lg:text-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Bill</p>
                        <p className="text-2xl font-black text-gray-900">{formatCurrency(order.amount)}</p>
                     </div>

                     {isPaid ? (
                       <div className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-red-600 group-hover:bg-red-50 transition-all cursor-pointer">
                          <ChevronRight size={24} />
                       </div>
                     ) : (
                       <div className="flex flex-col gap-2 w-full">
                          {isEditing ? (
                            <div className="flex items-center bg-white border border-red-200 rounded-xl px-2 py-1">
                               <input 
                                 type="tel" 
                                 className="w-full text-[10px] font-bold outline-none"
                                 placeholder="254..."
                                 value={customPhone}
                                 onChange={(e) => setCustomPhone(e.target.value)}
                               />
                               <button onClick={() => setEditingOrderId(null)}><X size={12}/></button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setEditingOrderId(order.id)}
                              className="text-[8px] font-black text-red-600 uppercase flex items-center justify-center gap-1"
                            >
                              <Edit3 size={10} /> Pay with other number
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handlePayment(order.id, order.amount)}
                            disabled={processingId === order.id}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {processingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                            Pay Now
                          </button>
                       </div>
                     )}
                  </div>
                </div>

                {!isPaid && (
                  <div className="bg-slate-900 p-3 text-center flex items-center justify-center gap-2">
                    <Phone size={12} className="text-red-500" />
                    <p className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                       STK Push targeting: <span className="text-red-500">{customPhone || user?.phone || "None"}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;