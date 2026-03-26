import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, UtensilsCrossed, ClipboardList, 
  Users, LogOut, Menu as MenuIcon, ChefHat, 
  Zap, Clock, ShieldCheck, Globe
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/slices/authSlice";

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigation = [
    { name: "Terminal", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Inventory", href: "/admin/menu", icon: UtensilsCrossed },
    { name: "Live Queue", href: "/admin/orders", icon: ClipboardList },
    { name: "Specials", href: "/admin/custom-orders", icon: ChefHat },
    { name: "Directory", href: "/admin/users", icon: Users },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/auth/admin-login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      
      {/* --- GLASSMORPHIC SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- LUXE GLASS SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 transform transition-all duration-500 ease-in-out
        lg:relative lg:translate-x-0 
        ${isSidebarOpen ? "translate-x-0 shadow-2xl shadow-orange-900/10" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Brand Header */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-12 group cursor-pointer">
              <div className="bg-orange-500 p-2.5 rounded-2xl shadow-lg shadow-orange-500/30 group-hover:rotate-12 transition-all duration-300">
                <Zap className="text-white fill-white" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase italic text-slate-900 leading-none">
                  STAFF<span className="text-orange-500">.</span>OS
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">V2.0 Core System</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300
                      ${isActive 
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                        : "text-slate-400 hover:text-orange-600 hover:bg-orange-50/50"}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={16} className={isActive ? "text-orange-400" : "group-hover:scale-110 transition-transform"} />
                      {item.name}
                    </div>
                    {isActive && <div className="h-1 w-1 bg-orange-400 rounded-full animate-pulse" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto p-6 space-y-3">
            <Link 
              to="/home" 
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white/50 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
            >
              <Globe size={14} /> Portal Preview
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-slate-200 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:border-red-200 transition-all"
            >
              <LogOut size={14} /> Termination
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Floating Glass Header */}
        <header className="h-20 bg-white/40 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 lg:px-12 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden text-slate-900 p-2 bg-white rounded-xl shadow-sm border border-slate-200" 
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon size={18} />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                <Clock size={12} className="text-orange-500" /> System Uptime
              </div>
              <p className="text-lg font-black text-slate-900 tabular-nums tracking-tighter">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden xs:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 border border-orange-200">
                  <ShieldCheck size={10} /> Root Access
                </span>
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                  {user?.name || user?.username || "Admin"}
                </p>
              </div>
            </div>
            
            <div className="h-10 w-10 p-0.5 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 shadow-inner overflow-hidden shrink-0 group hover:scale-105 transition-transform cursor-pointer">
               <div className="w-full h-full rounded-[9px] bg-white overflow-hidden flex items-center justify-center">
                 {user?.avatarUrl ? (
                   <img src={user.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-slate-400 font-black text-sm">
                    {(user?.name || "A").charAt(0).toUpperCase()}
                   </span>
                 )}
               </div>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-grow overflow-y-auto p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            
            {/* Page Title */}
            <div className="mb-10 flex items-center justify-between">
               <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                    {navigation.find(n => n.href === location.pathname)?.name || "Management"}
                    <span className="text-orange-500">.</span>
                  </h1>
                  <div className="h-1 w-8 bg-orange-500 rounded-full mt-2" />
               </div>
               
               {/* Contextual Action Button (Optional UI element) */}
               <div className="hidden md:block">
                  <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Server: Online</span>
                  </div>
               </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;