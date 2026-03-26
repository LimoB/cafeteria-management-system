import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchPaymentHistory } from '../../../app/slices/paymentSlice';
import { 
  Receipt, Clock, 
  Loader2, ShieldCheck, AlertCircle, ArrowLeft,
  Smartphone, Calendar, RefreshCcw, User, Tag
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';

const PaymentHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { history, isProcessing, isError, message } = useAppSelector((state) => state.payments);
  const { role } = useAppSelector((state) => state.auth);
  const isAdmin = role === 'admin';

  useEffect(() => {
    dispatch(fetchPaymentHistory(isAdmin));
  }, [dispatch, isAdmin]);

  const handleRefresh = () => {
    dispatch(fetchPaymentHistory(isAdmin));
  };

  if (isProcessing && (!history || history.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Global Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Exit to Admin Panel
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 italic">
                {isAdmin ? "Global Merchant Audit" : "Personal Financial Log"}
              </span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Transaction <span className="text-red-600">Ledger</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="p-4 rounded-full border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-red-600 transition-all active:rotate-180 duration-500"
            >
              <RefreshCcw size={20} className={isProcessing ? "animate-spin" : ""} />
            </button>

            <div className="bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
               <div className="text-right border-r border-gray-100 pr-6">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Total Volume</p>
                  <p className="text-xl font-black text-gray-900">{Array.isArray(history) ? history.length : 0}</p>
               </div>
               <Receipt className="text-red-600 opacity-20" size={32} />
            </div>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2.5rem] flex items-center gap-4">
          <AlertCircle className="text-red-600 shrink-0" size={24} />
          <div>
            <p className="text-xs font-black text-red-600 uppercase">Database Sync Interrupted</p>
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight italic">
              {message || "The Daraja gateway reported a 500 status. Audit incomplete."}
            </p>
          </div>
        </div>
      )}

      {/* Ledger Grid */}
      <div className="grid grid-cols-1 gap-4">
        {!Array.isArray(history) || history.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-32 text-center">
            <Receipt className="mx-auto text-gray-100 mb-6" size={64} />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Zero Transactions Recorded</p>
          </div>
        ) : (
          history.map((tx: any) => {
            const status = (tx.paymentStatus || tx.status || 'pending').toLowerCase();
            const isCustom = !!tx.description; // Custom orders usually have a description
            const isCompleted = status === 'completed' || status === 'success';
            const isFailed = ['failed', 'cancelled', 'rejected'].includes(status);

            return (
              <div 
                key={tx.id} 
                className="group relative bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 hover:border-red-100 transition-all duration-500"
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-amber-500'
                }`} />

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Icon Box */}
                    <div className={`h-16 w-16 rounded-[1.8rem] flex items-center justify-center shadow-sm ${
                      isCompleted ? 'bg-emerald-50 text-emerald-600' : 
                      isFailed ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {isCompleted ? <ShieldCheck size={28} /> : <Clock size={28} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                          isCustom ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {isCustom ? "Custom Request" : "Canteen Order"}
                        </span>
                        
                        <span className={`text-[8px] font-black uppercase tracking-widest ${
                           isCompleted ? 'text-emerald-500' : isFailed ? 'text-red-500' : 'text-amber-500'
                        }`}>
                          {status}
                        </span>
                      </div>
                      
                      {/* Order Reference & M-Pesa Code */}
                      <p className="text-lg font-black text-gray-900 uppercase tracking-tighter italic">
                        {tx.mpesaReceiptNumber || `REF: ${tx.id.slice(-8).toUpperCase()}`}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                        {/* Admin Specific: User Identity */}
                        {isAdmin && (
                          <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                            <User size={12} className="text-red-600" /> 
                            {tx.user?.username || "Guest User"} ({tx.userId || 'N/A'})
                          </span>
                        )}

                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
                          <Calendar size={12} /> 
                          {formatDate(tx.createdAt)}
                        </span>

                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
                          <Smartphone size={12} /> 
                          {tx.phoneNumber || tx.user?.phone || 'No Phone Log'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Column */}
                  <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Revenue Collected</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter italic">
                        {formatCurrency(Number(tx.amount || tx.price || 0))}
                      </p>
                    </div>

                    <div className="h-12 w-12 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-gray-900 group-hover:text-white transition-all">
                      <Tag size={18} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <footer className="pt-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ledger Integrity Verified</p>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-200" />
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Auth as: {role}</p>
        </div>
        <p className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.5em]">Laikipia Canteen Financial System © 2026</p>
      </footer>
    </div>
  );
};

export default PaymentHistory;