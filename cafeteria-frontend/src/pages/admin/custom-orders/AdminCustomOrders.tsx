import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchCustomOrders, updateOrder, cancelCustomOrder } from '../../../app/slices/customOrderSlice';
import { ChefHat, MessageSquare, CheckCircle2, XCircle, Phone, Loader2, Trash2, Calendar } from 'lucide-react';
import { CustomOrder, OrderStatus } from '../../../types/customOrder.types';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/dateFormatter';

const AdminCustomOrders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customOrders, isLoading } = useAppSelector((state) => state.customOrders);
  const [localProcessingId, setLocalProcessingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCustomOrders());
  }, [dispatch]);

  const handleUpdateStatus = async (id: string, approvalStatus: 'approved' | 'rejected') => {
    setLocalProcessingId(id);
    try {
      /**
       * ApprovalStatus: Logic-based mapping.
       * If approved, we set the operational status to 'placed'.
       * If rejected, we move it to 'cancelled' or similar final state.
       */
      const updateData: Partial<CustomOrder> = { 
        approvalStatus, 
        status: (approvalStatus === 'approved' ? 'placed' : 'cancelled') as OrderStatus 
      };
      
      await dispatch(updateOrder({ id, updateData })).unwrap();
      toast.success(`Request ${approvalStatus === 'approved' ? 'Approved' : 'Rejected'} Successfully`);
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
        <div className="relative">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Syncing Special Requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-2 w-8 bg-red-600 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Admin Panel</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            Custom <span className="text-red-600">Requests</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">Manage catering inquiries and student meal customizations.</p>
        </div>

        <div className="bg-white px-8 py-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-105">
          <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
            <ChefHat size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pending Review</p>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {customOrders.filter(o => o.approvalStatus === 'pending').length} <span className="text-sm text-gray-300 font-bold">New</span>
            </p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 gap-8">
        {customOrders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border border-gray-100 shadow-inner">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <ChefHat size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No active student requests found</p>
          </div>
        ) : (
          customOrders.map((req) => (
            <div key={req.id} className="group relative bg-white rounded-[3rem] border border-gray-100 p-8 md:p-10 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden">
              
              {/* Vertical Status Accent */}
              <div className={`absolute top-0 left-0 w-2.5 h-full transition-all duration-500 ${
                req.approvalStatus === 'approved' ? 'bg-emerald-500' : 
                req.approvalStatus === 'rejected' ? 'bg-red-500' : 'bg-orange-400'
              }`} />

              <div className="flex flex-col xl:flex-row justify-between gap-10">
                <div className="flex flex-col md:flex-row gap-10 flex-grow">
                  
                  {/* Student/User Identity */}
                  <div className="flex flex-col items-center md:items-start gap-4 shrink-0">
                    <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-red-600 border border-gray-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                      <ChefHat size={40} />
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Requested By</p>
                      <p className="text-base font-black text-gray-900 uppercase tracking-tight leading-tight">
                         {req.user?.name || "Student User"}
                      </p>
                      <div className="mt-2 flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-emerald-600">
                        <Phone size={12} /> {req.user?.phone || "No Phone"}
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="space-y-6 flex-grow">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-slate-900 text-white font-black text-xs tracking-widest px-5 py-2 rounded-2xl">
                        #{req.id.slice(-6).toUpperCase()}
                      </div>
                      <div className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border ${
                        req.approvalStatus === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        req.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {req.approvalStatus}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest ml-auto md:ml-0">
                        <Calendar size={14} className="text-red-500" /> {formatDate(req.createdAt)}
                      </div>
                    </div>

                    <div className="bg-gray-50/70 p-8 rounded-[2.5rem] border border-gray-100 relative group-hover:bg-white group-hover:border-red-100 transition-all duration-500">
                      <MessageSquare size={24} className="absolute -top-3 -left-3 text-red-600 bg-white rounded-full p-1.5 shadow-md border border-red-50" />
                      <p className="text-gray-700 font-bold leading-relaxed text-base italic">
                        "{req.description}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-red-50/30 rounded-2xl w-fit">
                        <MapPinIcon size={14} className="text-red-600" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pickup Location: {req.takeawayLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Control Center */}
                <div className="flex flex-row xl:flex-col justify-end gap-4 min-w-[260px]">
                  {req.approvalStatus === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                        disabled={localProcessingId === req.id}
                        className="flex-1 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
                      >
                        {localProcessingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={18} />}
                        Approve Request
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        disabled={localProcessingId === req.id}
                        className="flex-1 bg-white text-gray-400 border border-gray-200 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                        <XCircle size={18} /> Decline
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-4 w-full animate-in zoom-in-95 duration-500">
                      <div className={`p-6 rounded-[2rem] text-center font-black text-[11px] uppercase tracking-[0.25em] shadow-inner border flex items-center justify-center gap-3 ${
                        req.approvalStatus === 'approved' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {req.approvalStatus === 'approved' ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                        {req.approvalStatus}
                      </div>
                      <button 
                         onClick={() => handleDelete(req.id)}
                         className="group/del p-5 text-gray-300 hover:text-red-600 transition-all text-[10px] font-black uppercase tracking-widest border border-dashed border-gray-200 rounded-[2rem] hover:border-red-200 hover:bg-red-50/30 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} className="group-hover/del:animate-bounce" /> Archive Record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Simple Icon fallback if Lucide MapPin isn't imported
const MapPinIcon = ({ size, className }: { size: number, className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default AdminCustomOrders;