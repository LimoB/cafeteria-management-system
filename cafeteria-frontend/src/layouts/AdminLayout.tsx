import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, UtensilsCrossed, ClipboardList, 
  Users, LogOut, Menu as MenuIcon, ChefHat, 
  Zap 
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/slices/authSlice";

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // TypeScript now recognizes 'user' correctly thanks to useAppSelector
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigation = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Menu Items", href: "/admin/menu", icon: UtensilsCrossed },
    { name: "Live Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Custom Requests", href: "/admin/custom-orders", icon: ChefHat },
    { name: "Manage Users", href: "/admin/users", icon: Users },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/auth/admin-login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-red-100">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 border-r border-white/5
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-red-600 p-2.5 rounded-2xl shadow-lg shadow-red-900/40">
                <Zap className="text-white fill-white" size={22} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl leading-none tracking-tighter uppercase">
                  LAIKIPIA<span className="text-red-600">.</span>STAFF
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Control Center</span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all group
                      ${isActive 
                        ? "bg-red-600 text-white shadow-xl shadow-red-900/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"}
                    `}
                  >
                    <item.icon size={18} className={isActive ? "scale-110" : "group-hover:scale-110 transition-transform"} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-6 space-y-4">
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Server Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Daraja API Active</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl font-black text-[10px] text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.2em]"
            >
              <LogOut size={16} /> End Session
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-3 bg-slate-100 rounded-xl text-slate-900" 
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Time</p>
              <p className="text-sm font-black text-slate-900">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
             <div className="flex flex-col items-end hidden xs:flex text-right">
                <p className="text-sm font-black text-slate-900 leading-none">
                  {user?.name || user?.username || "Staff Admin"}
                </p>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1 italic">
                  Level: Administrator
                </p>
             </div>
             
             <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black border-4 border-white shadow-lg overflow-hidden shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Staff" className="w-full h-full object-cover" />
                ) : (
                  (user?.name || "A").charAt(0).toUpperCase()
                )}
             </div>
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full">
          {/* Dashboard contents render here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;