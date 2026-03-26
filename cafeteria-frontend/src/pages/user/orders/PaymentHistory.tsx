import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchPaymentHistory } from '../../../app/slices/paymentSlice';
import { 
  Receipt, Clock, 
  Loader2, ShieldCheck, AlertCircle, ArrowLeft,
  Smartphone, Hash, Calendar, RefreshCcw
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';

const PaymentHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Accessing slice state as defined in your paymentSlice
  const { history, isProcessing, isError, message } = useAppSelector((state) => state.payments);
  const { role } = useAppSelector((state) => state.auth);
  const isAdmin = role === 'admin';

  useEffect(() => {
    // Initial fetch
    dispatch(fetchPaymentHistory(isAdmin));
  }, [dispatch, isAdmin]);

  const handleRefresh = () => {
    dispatch(fetchPaymentHistory(isAdmin));
  };

  // 1. Loading State (Full Screen if no data exists yet)
  if (isProcessing && (!history || history.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Auditing Ledger Transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 italic">Financial Audit Log</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Payment <span className="text-red-600">History</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="p-4 rounded-full border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-red-600 transition-all active:rotate-180 duration-500"
              title="Refresh Ledger"
            >
              <RefreshCcw size={20} className={isProcessing ? "animate-spin" : ""} />
            </button>

            <div className="bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
               <div className="text-right border-r border-gray-100 pr-6">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Logged Entries</p>
                  <p className="text-xl font-black text-gray-900">{Array.isArray(history) ? history.length : 0}</p>
               </div>
               <Receipt className="text-red-600 opacity-20" size={32} />
            </div>
        </div>
      </div>

      {/* Error Logic - Shows specific message from the server */}
      {isError && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2.5rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="text-red-600 shrink-0" size={24} />
          <div>
            <p className="text-xs font-black text-red-600 uppercase">Gateway Sync Error</p>
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight italic">
              {message || "The payment server returned a 500 error. Check your connection."}
            </p>
          </div>
        </div>
      )}

      {/* Ledger List - Using defensive check to ensure array exists */}
      <div className="grid grid-cols-1 gap-4">
        {!Array.isArray(history) || history.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-32 text-center shadow-sm">
            <Receipt className="mx-auto text-gray-100 mb-6" size={64} />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">No transaction records found</p>
          </div>
        ) : (
          history.map((tx: any) => {
            // Priority: paymentStatus from our schema, fallback to status
            const status = (tx.paymentStatus || tx.status || 'pending').toLowerCase();
            const isCompleted = status === 'completed';
            const isFailed = status === 'failed' || status === 'cancelled';

            return (
              <div 
                key={tx.id} 
                className="group relative bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden"
              >
                {/* Decorative Status Bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-colors ${
                  isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-amber-500'
                }`} />

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${
                      isCompleted ? 'bg-emerald-50 text-emerald-600' : 
                      isFailed ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {isCompleted ? <ShieldCheck size={28} /> : <Clock size={28} />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            {tx.id.startsWith("CUST-") ? "Custom Request" : "Standard Order"}
                        </span>
                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 
                          isFailed ? 'bg-red-500 text-white border-red-500' : 
                          'bg-amber-500 text-white border-amber-500'
                        }`}>
                          {status}
                        </div>
                      </div>
                      
                      <p className="text-lg font-black text-gray-900 uppercase tracking-tighter italic flex items-center gap-2">
                        Ref: {tx.id?.replace("LKN-", "").replace("CUST-", "").toUpperCase() || "PROCESSING"}
                        {tx.mpesaReceiptNumber && (
                           <span className="text-[10px] font-normal text-gray-400 not-italic ml-2">[{tx.mpesaReceiptNumber}]</span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
                          <Calendar size={12} className="text-red-600" /> 
                          {tx.createdAt ? formatDate(tx.createdAt) : 'Recent Entry'}
                        </span>
                        {/* Display User Phone if available (from schema.phone or STK body) */}
                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
                          <Smartphone size={12} className="text-red-600" /> 
                          {tx.user?.phone || tx.phoneNumber || 'User Device'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Settled</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter italic">
                        {formatCurrency(Number(tx.amount || tx.price || 0))}
                      </p>
                    </div>

                    <div className="h-14 w-14 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all">
                      <Hash size={20} className="text-gray-200 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer System Status */}
      <footer className="pt-10 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
           <div className={`h-1.5 w-1.5 rounded-full ${isError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Daraja API Node Active</p>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-200" />
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Laikipia.GO Terminal</p>
      </footer>
    </div>
  );
};

export default PaymentHistory;