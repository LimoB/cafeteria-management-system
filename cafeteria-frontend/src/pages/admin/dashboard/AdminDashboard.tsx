import React, { useEffect } from "react";
import { 
  Users, ShoppingBag, 
  Wallet, Plus, FileText, 
  Zap, ArrowUpRight, Loader2, RefreshCcw
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchMenu } from "../../../app/slices/menuSlice";
import { fetchAllUsers } from "../../../app/slices/userSlice";
import { fetchDashboardStats } from "../../../app/slices/adminSlice"; 
import { fetchAllOrders } from "../../../app/slices/orderSlice"; // Added this
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Connect to Admin, Menu, User, and Order states
  const { stats, isLoading: statsLoading } = useAppSelector((state) => state.admin);
  const { items: menuItems, isLoading: menuLoading } = useAppSelector((state) => state.menu);
  const { users } = useAppSelector((state) => state.users);
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);

  useEffect(() => {
    // Sync all nodes
    dispatch(fetchDashboardStats());
    dispatch(fetchMenu());
    dispatch(fetchAllUsers());
    dispatch(fetchAllOrders(true)); // Pass true for Admin fetch
  }, [dispatch]);

  const isInitialSync = (statsLoading || menuLoading || ordersLoading) && !stats;

  // Helper for status badge colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-emerald-500 bg-emerald-50';
      case 'pending': return 'text-orange-500 bg-orange-50';
      case 'cancelled': return 'text-red-500 bg-red-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  if (isInitialSync) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <Zap className="absolute inset-0 m-auto text-slate-200" size={16} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing System Nodes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Command<span className="text-red-600">Center</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest">
            Node Status: <span className="text-emerald-600 font-black">Operational</span> • Orders Active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              dispatch(fetchDashboardStats());
              dispatch(fetchAllOrders(true));
            }}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-black hover:border-black transition-all active:rotate-180 duration-500 shadow-sm"
          >
            <RefreshCcw size={18} />
          </button>
          <button 
            onClick={() => navigate("/admin/menu/add")}
            className="flex items-center gap-2 px-6 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:-translate-y-0.5 transition-all active:scale-95 group"
          >
            <Plus size={16} className="text-red-500 group-hover:text-white transition-colors" /> Add Food Item
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-100 transition-all">
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:rotate-6 transition-transform duration-500">
              <Wallet size={24} />
            </div>
            <span className="bg-emerald-100/50 text-[9px] font-black px-2 py-1 rounded-lg text-emerald-700 uppercase tracking-tighter">KES</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight relative z-10">Ksh {stats?.revenue.toLocaleString() || "0"}</h3>
          <Wallet className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:-rotate-12 transition-all duration-700 text-emerald-600" size={140} />
        </div>

        {/* Daily Volume */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-red-100 transition-all">
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 group-hover:rotate-6 transition-transform duration-500">
              <Zap size={24} />
            </div>
            <span className="bg-red-100/50 text-[9px] font-black px-2 py-1 rounded-lg text-red-700 uppercase tracking-tighter">Live</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Today's Orders</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight relative z-10">{stats?.today || "0"}</h3>
          <Zap className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:-rotate-12 transition-all duration-700 text-red-600" size={140} />
        </div>

        {/* Users */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-100 transition-all">
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:rotate-6 transition-transform duration-500">
              <Users size={24} />
            </div>
            <span className="bg-blue-100/50 text-[9px] font-black px-2 py-1 rounded-lg text-blue-700 uppercase tracking-tighter">Accounts</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Total Students</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight relative z-10">{stats?.users || users.length}</h3>
          <Users className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:-rotate-12 transition-all duration-700 text-blue-600" size={140} />
        </div>

        {/* Archive */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-100 transition-all">
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-orange-50 text-orange-600 group-hover:rotate-6 transition-transform duration-500">
              <ShoppingBag size={24} />
            </div>
            <span className="bg-orange-100/50 text-[9px] font-black px-2 py-1 rounded-lg text-orange-700 uppercase tracking-tighter">Global</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Total Orders</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight relative z-10">{stats?.orders || orders.length}</h3>
          <ShoppingBag className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:-rotate-12 transition-all duration-700 text-orange-600" size={140} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Recent Transactions</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest Orders from Students</p>
            </div>
            <button className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
              <FileText size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.slice(0, 5).map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.2rem] border border-transparent hover:border-red-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group/row"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-white rounded-[1.2rem] flex items-center justify-center font-black text-[10px] text-slate-400 border border-slate-100 group-hover/row:bg-black group-hover/row:text-white transition-all">
                      #{order.id.toString().slice(-4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Order by {order.userId || "Student"}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • M-PESA
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm">Ksh {order.amount}</p>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-tighter ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <ArrowUpRight size={18} className="text-slate-200 group-hover/row:text-red-600 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No transaction records found</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory & Status */}
        <div className="space-y-8">
          <div className="bg-[#0F172A] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h3 className="font-black text-xl uppercase tracking-tight">Availability</h3>
              <ShoppingBag size={20} className="text-red-500" />
            </div>
            <div className="space-y-8 relative z-10">
              {menuItems.slice(0, 4).map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">{item.foodName}</p>
                    <p className={`text-[9px] font-black ${item.isAvailable ? 'text-emerald-400' : 'text-red-500'}`}>
                      {item.isAvailable ? 'INSTOCK' : 'OUT'}
                    </p>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className={`h-full ${item.isAvailable ? 'bg-emerald-500 w-full' : 'bg-red-600 w-1/4'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-600 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-white fill-white" />
                <p className="text-xs font-black uppercase tracking-widest text-white">Kitchen Status</p>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black text-white animate-pulse">LIVE</div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex justify-between items-baseline text-white">
              <span className="text-[10px] font-black uppercase opacity-80 tracking-widest">Est. Wait Time</span>
              <span className="text-2xl font-black italic">~ 8 MIN</span>
            </div>
            <Zap className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform duration-700" size={150} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;