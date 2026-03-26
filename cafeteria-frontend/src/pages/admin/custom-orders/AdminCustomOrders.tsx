import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { getCustomOrders, updateOrder, cancelCustomOrder } from '../../../app/slices/customOrderSlice';
import { 
  ChefHat, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Loader2, 
  Trash2, 
  Calendar, 
  MapPin, 
  Banknote,
  Clock} from 'lucide-react';
import { CustomOrder, OrderStatus } from '../../../types/customOrder.types';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/dateFormatter';

const AdminCustomOrders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customOrders, isLoading } = useAppSelector((state) => state.customOrders);
  
  const [orderPrices, setOrderPrices] = useState<Record<string, string>>({});
  const [localProcessingId, setLocalProcessingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getCustomOrders());
  }, [dispatch]);

  const handlePriceChange = (id: string, value: string) => {
    setOrderPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateStatus = async (id: string, approvalStatus: 'approved' | 'rejected') => {
    const quotePrice = parseFloat(orderPrices[id] || "0");

    if (approvalStatus === 'approved' && (!quotePrice || quotePrice <= 0)) {
      toast.error("Please enter a valid price quote before approving.");
      return;
    }

    setLocalProcessingId(id);
    try {
      // Logic: Approval moves standard status to 'placed', Rejection moves it to 'cancelled'
      const updateData: Partial<CustomOrder> = { 
        approvalStatus, 
        status: (approvalStatus === 'approved' ? 'placed' : 'cancelled') as OrderStatus,
        price: approvalStatus === 'approved' ? quotePrice : 0,
        paymentStatus: 'pending' // Reset/Ensure pending until user pays via M-Pesa
      };
      
      await dispatch(updateOrder({ id, updateData })).unwrap();
      toast.success(`Request ${approvalStatus === 'approved' ? 'Approved & Quoted' : 'Rejected'}`);
    } catch (err) {
      toast.error("Failed to update request status");
    } finally {
      setLocalProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanently delete this custom request? This action cannot be undone.")) {
      try {
        await dispatch(cancelCustomOrder(id)).unwrap();
        toast.success("Request removed from system");
      } catch (err) {
        toast.error("Failed to delete request");
      }
    }
  };

  if (isLoading && customOrders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Syncing Special Requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8 mt-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-2 w-8 bg-red-600 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Admin Panel</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            Custom <span className="text-red-600">Requests</span>
          </h1>
        </div>

        <div className="bg-white px-8 py-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
            <ChefHat size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Queue Size</p>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {customOrders.filter(o => o.approvalStatus === 'pending').length} Active
            </p>
          </div>
        </div>
      </div>

      {/* --- LIST --- */}
      <div className="grid grid-cols-1 gap-8">
        {customOrders.map((req) => (
          <div key={req.id} className="group relative bg-white rounded-[3rem] border border-gray-100 p-8 md:p-10 shadow-sm transition-all duration-500 overflow-hidden">
            
            {/* Color-coded Status Sidebar */}
            <div className={`absolute top-0 left-0 w-2.5 h-full transition-all duration-500 ${
              req.approvalStatus === 'approved' ? 'bg-emerald-500' : 
              req.approvalStatus === 'rejected' ? 'bg-red-500' : 'bg-orange-400'
            }`} />

            <div className="flex flex-col xl:flex-row justify-between gap-10">
              <div className="flex flex-col md:flex-row gap-10 flex-grow">
                
                {/* User Identity Section */}
                <div className="flex flex-col items-center md:items-start gap-4 shrink-0">
                  <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-red-600 border border-gray-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                    <ChefHat size={40} />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-base font-black text-gray-900 uppercase tracking-tight">
                       {req.user?.username || "Student User"}
                    </p>
                    <div className="mt-1 flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-gray-400 uppercase">
                      <Phone size={12} /> {req.user?.phone || "No Phone"}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-slate-900 text-white font-black text-[10px] px-4 py-1.5 rounded-xl tracking-widest">
                      ID: {req.id.toUpperCase()}
                    </span>
                    
                    {/* Dynamic Status Badge */}
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border ${
                      req.approvalStatus === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      req.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {req.approvalStatus}
                    </span>

                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border ${
                      req.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {req.paymentStatus === 'completed' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="bg-gray-50/70 p-6 rounded-[2rem] border border-gray-100 italic font-bold text-gray-700 text-lg leading-relaxed">
                    "{req.description}"
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar size={14} className="text-red-500" /> {req.createdAt ? formatDate(req.createdAt) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <MapPin size={14} className="text-red-500" /> {req.takeawayLocation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Center - Handle based on Approval Status */}
              <div className="flex flex-col justify-center gap-4 min-w-[280px]">
                {req.approvalStatus === 'pending' ? (
                  <div className="space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="relative group/input">
                      <Banknote size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number"
                        placeholder="Price Quote (KES)"
                        value={orderPrices[req.id] || ''}
                        onChange={(e) => handlePriceChange(req.id, e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm outline-none focus:bg-white focus:border-red-200 transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                        disabled={localProcessingId === req.id}
                        className="flex-grow bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {localProcessingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Approve & Quote
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <div className={`p-5 rounded-[2rem] text-center border ${
                      req.approvalStatus === 'approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                    }`}>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Final Price</p>
                      <p className={`text-2xl font-black ${req.approvalStatus === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                        KES {req.price}
                      </p>
                    </div>
                    
                    {/* Show delete/archive only after approval/rejection */}
                    <button 
                       onClick={() => handleDelete(req.id)}
                       className="w-full p-4 text-gray-300 hover:text-red-600 transition-all text-[10px] font-black uppercase tracking-widest border border-dashed border-gray-200 rounded-2xl hover:border-red-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Archive Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {customOrders.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <Clock className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-black text-gray-900 uppercase italic">Inbox Clear</h3>
          <p className="text-gray-400 text-sm font-bold">No custom food requests at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AdminCustomOrders;