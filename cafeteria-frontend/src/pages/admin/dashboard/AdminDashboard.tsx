import React, { useEffect, useMemo } from "react";
import { 
  TrendingUp, Users, ShoppingBag, Clock, 
  Wallet, Plus, 
  FileText, Download, 
  Zap, ArrowUpRight, Loader2
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchMenu } from "../../../app/slices/menuSlice";
import { fetchAllUsers } from "../../../app/slices/userSlice";
// Assuming you have an orders slice
// import { fetchOrders } from "../../../app/slices/orderSlice"; 

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Connect to multiple slices for a true "Command Center"
  const { items: menuItems, isLoading: menuLoading } = useAppSelector((state) => state.menu);
  const { users } = useAppSelector((state) => state.users);
  // const { orders } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMenu());
    dispatch(fetchAllUsers());
    // dispatch(fetchOrders());
  }, [dispatch]);

  // Dynamic Stats Calculation
  const stats = useMemo(() => [
    { 
      label: "Revenue Today", 
      value: "Ksh 12,450", 
      icon: Wallet, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      trend: "+12%",
      description: "vs. yesterday"
    },
    { 
      label: "Active Orders", 
      value: "18", // This would be orders.filter(o => o.status !== 'delivered').length
      icon: Clock, 
      color: "text-orange-600", 
      bg: "bg-orange-50", 
      trend: "High Volume",
      description: "Kitchen at 85%"
    },
    { 
      label: "Students", 
      value: users.length.toLocaleString(), 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      trend: `+${users.filter(u => new Date(u.createdAt!).getDate() === new Date().getDate()).length}`,
      description: "New today"
    },
    { 
      label: "Menu Items", 
      value: menuItems.length.toString(), 
      icon: ShoppingBag, 
      color: "text-red-600", 
      bg: "bg-red-50", 
      trend: "Stable",
      description: "Available now"
    },
  ], [users, menuItems]);

  if (menuLoading && menuItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booting Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Command<span className="text-red-600">Center</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Real-time metrics for Laikipia Student Center.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <FileText size={16} className="text-slate-400" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:-translate-y-0.5 transition-all active:scale-95">
            <Plus size={16} className="text-red-500" /> Add Food Item
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-red-100 transition-all">
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-6 transition-transform duration-500`}>
                <stat.icon size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-slate-50 text-[9px] font-black px-2 py-1 rounded-lg text-slate-500 uppercase tracking-tighter">
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{stat.description}</p>
            </div>
            {/* Background Icon Watermark */}
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:-rotate-12 transition-all duration-700 ${stat.color}`}>
              <stat.icon size={140} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 group/table">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Recent Transactions</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest M-Pesa Payments</p>
            </div>
            <button className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
              <Download size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.2rem] border border-transparent hover:border-red-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group/row">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-white rounded-[1.2rem] flex items-center justify-center font-black text-xs text-slate-400 border border-slate-100 group-hover/row:bg-black group-hover/row:text-white transition-all">
                    #{1020 + i}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">Student Order #{i}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Ref: M-PESA • 12:4{i} PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-black text-slate-900">Ksh {150 * i}</p>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</p>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-200 group-hover/row:text-red-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics & Peak Info */}
        <div className="space-y-8">
          {/* Top Selling Dark Card */}
          <div className="bg-[#0F172A] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="font-black text-xl uppercase tracking-tight">Popularity</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Based on sales volume</p>
              </div>
              <TrendingUp size={20} className="text-red-500" />
            </div>

            <div className="space-y-8 relative z-10">
              {menuItems.slice(0, 4).map((item, idx) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.foodName}</p>
                    <p className="text-[10px] font-black text-red-500">{100 - (idx * 12)}%</p>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-red-600' : 'bg-white'}`} 
                      style={{ width: `${100 - (idx * 12)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <TrendingUp size={200} />
            </div>
          </div>

          {/* Kitchen Status Pulse Card */}
          <div className="bg-red-600 rounded-[3rem] p-8 shadow-2xl shadow-red-900/20 relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">Kitchen Peak</p>
                  <p className="text-[10px] text-red-100 font-bold">4 Staff Members Active</p>
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white animate-pulse">
                Live
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="flex justify-between items-center text-white">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Est. Wait Time</span>
                <span className="text-xl font-black italic">~ 7 Mins</span>
              </div>
            </div>
            <Zap className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform duration-700" size={150} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;