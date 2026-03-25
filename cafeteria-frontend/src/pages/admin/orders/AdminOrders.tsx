import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAllOrders, changeOrderStatus } from "../../../app/slices/orderSlice";
import { 
  Clock, Package, Loader2, CheckCircle2, 
  User, MapPin, Phone, ShieldCheck, AlertCircle, XCircle 
} from "lucide-react";
import { OrderStatus } from "../../../types/order.types";
import toast from "react-hot-toast";
import { formatCurrency } from "../../../utils/formatCurrency";

const AdminOrders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrders(true));

    const interval = setInterval(() => {
      setIsRefreshing(true);
      dispatch(fetchAllOrders(true)).finally(() => setIsRefreshing(false));
    }, 30000); 

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStatusUpdate = async (id: string, nextStatus: OrderStatus) => {
    try {
      await dispatch(changeOrderStatus({ id, status: nextStatus })).unwrap();
      toast.success(`Order marked as ${nextStatus.toUpperCase()}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleCancelOrder = async (id: string, isPaid: boolean) => {
    const confirmCancel = window.confirm(
      isPaid 
        ? "This order is PAID. Cancelling will require a manual M-Pesa refund. Continue?" 
        : "Are you sure you want to cancel this order?"
    );

    if (confirmCancel) {
      try {
        await dispatch(changeOrderStatus({ id, status: "cancelled" as OrderStatus })).unwrap();
        toast.error("Order Cancelled Successfully");
      } catch (err) {
        toast.error("Failed to cancel order");
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return order.status !== "cancelled";
    if (activeTab === "pending") return order.status === "placed" || order.status === "preparing";
    if (activeTab === "ready") return order.status === "ready";
    if (activeTab === "completed") return order.status === "collected";
    return true;
  });

  const tabs = [
    { id: "all", label: "All Active" },
    { id: "pending", label: "In Queue" },
    { id: "ready", label: "Ready" },
    { id: "completed", label: "Handed Over" },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mt-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className={`h-2 w-2 rounded-full bg-red-600 ${isRefreshing ? 'animate-ping' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Admin Dashboard</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Kitchen <span className="text-red-600">Feed</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-gray-400 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-32 text-center">
            <Package className="mx-auto text-gray-200 mb-6" size={48} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active orders</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPaid = order.paymentStatus === 'completed';
            
            return (
              <div key={order.id} className="group relative bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center gap-8 hover:shadow-2xl transition-all duration-500">
                
                {/* 1. Status & ID */}
                <div className="lg:w-48 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-gray-900 tracking-tighter italic">#{order.id.slice(-6).toUpperCase()}</span>
                    {isPaid ? (
                      <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md">
                        <ShieldCheck size={16} />
                      </div>
                    ) : (
                      <div className="bg-amber-50 text-amber-600 p-1 rounded-md animate-pulse">
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> {formatDate(order.createdAt)}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded w-fit ${isPaid ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>

                {/* 2. Order Details */}
                <div className="flex-1 min-w-[250px]">
                   <ul className="space-y-1">
                      {order.details?.map((item: any, idx: number) => (
                        <li key={idx} className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
                          <span className="h-1.5 w-1.5 bg-red-600 rounded-full" />
                          {item.quantity}x {item.foodName}
                        </li>
                      ))}
                   </ul>
                   <div className="mt-4 flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase bg-red-50 px-3 py-1 rounded-full">
                        <MapPin size={12} /> {order.takeawayLocation}
                      </span>
                   </div>
                </div>

                {/* 3. Student Info */}
                <div className="lg:w-1/5 flex items-center gap-4 border-l lg:border-l border-gray-50 pl-0 lg:pl-8">
                  <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                    <User size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-gray-900 uppercase truncate">
                      {order.user?.name || "Student"}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                      <Phone size={10} /> {order.user?.phone || "No Phone"}
                    </p>
                    <p className="text-[11px] font-black text-emerald-600 mt-1">
                       {formatCurrency(order.amount)}
                    </p>
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="lg:ml-auto w-full lg:w-auto flex flex-col gap-2">
                   {order.status === "placed" && (
                     <button 
                       onClick={() => handleStatusUpdate(order.id, "preparing" as OrderStatus)}
                       className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-md"
                     >
                       Accept Order
                     </button>
                   )}
                   
                   {order.status === "preparing" && (
                     <button 
                       onClick={() => handleStatusUpdate(order.id, "ready" as OrderStatus)}
                       className="w-full bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md"
                     >
                       Mark Ready
                     </button>
                   )}

                   {order.status === "ready" && (
                     <button 
                       onClick={() => handleStatusUpdate(order.id, "collected" as OrderStatus)}
                       className="w-full bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md"
                     >
                       <CheckCircle2 size={16} /> Hand Over
                     </button>
                   )}

                   {/* Cancel Button (Visible for non-collected orders) */}
                   {order.status !== "collected" && (
                     <button 
                       onClick={() => handleCancelOrder(order.id, isPaid)}
                       className="w-full flex items-center justify-center gap-2 px-8 py-2 text-[8px] font-black text-red-600 uppercase border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                     >
                       <XCircle size={12} /> Cancel Order
                     </button>
                   )}

                   {order.status === "collected" && (
                     <div className="w-full px-8 py-4 bg-gray-50 text-gray-300 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center italic">
                       Completed
                     </div>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default AdminOrders;