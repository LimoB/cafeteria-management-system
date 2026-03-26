import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../app/slices/authSlice';
import { 
  ShoppingCart, LogOut, Menu, X, 
  ChevronDown, LayoutDashboard, Zap, History, Utensils,
  Settings, MessageSquarePlus, 
  ArrowRight, Layers
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, role } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isLoggedIn = !!user; 
  const isAdmin = role === 'admin';

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/auth/login');
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/auth/login');
    }
  };

  // --- DYNAMIC ROLE-BASED NAVIGATION ---
  const navLinks = [
    { name: "Feed", href: "/", icon: Zap, public: true },
    { name: "Cafeteria", href: "/home", icon: Utensils, public: false },
    ...(!isAdmin ? [
      // STUDENT ONLY LINKS
      { name: "Requests", href: "/request-food", icon: MessageSquarePlus, public: false },
      { name: "Orders", href: "/my-orders", icon: History, public: false },
    ] : [
      // ADMIN ONLY LINKS (Order Queue removed as it is in Admin Dash)
      { name: "Staff Terminal", href: "/admin/dashboard", icon: LayoutDashboard, public: false },
    ]),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB] font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- ADMIN OVERRIDE TOP BAR --- */}
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 h-8 bg-slate-950 z-[60] flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
              System Admin: <span className="text-white italic">Authorized Session</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest hidden sm:block">Env: Production_Alpha</span>
            <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-colors group">
              Dashboard <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* --- MODERN STICKY NAVBAR --- */}
      <nav className={`fixed left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm transition-all duration-500 ${isAdmin ? 'top-8' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className={`p-2 rounded-[14px] shadow-lg group-hover:rotate-6 transition-transform ${isAdmin ? 'bg-slate-900 shadow-slate-200' : 'bg-red-600 shadow-red-100'}`}>
                <Zap className="text-white fill-white" size={18} />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic flex items-center">
                LAIKIPIA<span className="text-red-600 text-2xl">.</span>{isAdmin ? 'OS' : 'GO'}
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                if (!link.public && !isLoggedIn) return null;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] transition-all relative group
                      ${isActive ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-black hover:bg-gray-50"}`}
                  >
                    {link.name}
                    {isActive && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Stack */}
          <div className="flex items-center gap-4">
            {/* Cart Pill */}
            <Link 
              to="/cart" 
              onClick={handleCartClick}
              className={`relative p-2.5 rounded-full transition-all group ${isAdmin ? 'bg-slate-100 hover:bg-slate-200' : 'bg-gray-100 hover:bg-red-50'}`}
            >
              <ShoppingCart size={20} className={isAdmin ? 'text-slate-900' : 'text-gray-600 group-hover:text-red-600'} />
              {totalCartItems > 0 && (
                <span className={`absolute -top-1 -right-1 text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white ${isAdmin ? 'bg-slate-900' : 'bg-red-600'}`}>
                  {totalCartItems}
                </span>
              )}
            </Link>

            {!isLoggedIn ? (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/auth/login" className="font-black text-[11px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Login</Link>
                <Link to="/auth/register" className="bg-black text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-red-600 transition-all active:scale-95">
                  Join Network
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 pl-2 pr-4 py-1.5 border rounded-full bg-white transition-all ${isAdmin ? 'border-slate-900 shadow-sm' : 'border-gray-200 hover:border-red-200'}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-black ${isAdmin ? 'bg-slate-900' : 'bg-red-600'}`}>
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        (user?.name || user?.username || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl py-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="px-8 py-6 bg-slate-50/50 mb-4 border-b border-slate-50">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">
                          {isAdmin ? 'ADMINISTRATOR' : 'STUDENT ACCOUNT'}
                        </p>
                        <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tighter">{user?.name || user?.username}</p>
                      </div>
                      
                      <div className="px-4 space-y-1">
                        <Link to="/profile" className="flex items-center gap-4 px-6 py-3.5 text-[10px] font-black uppercase text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                          <Settings size={18} /> Settings
                        </Link>
                        
                        {isAdmin && (
                          <Link to="/admin/dashboard" className="flex items-center gap-4 px-6 py-3.5 text-[10px] font-black uppercase text-slate-900 bg-slate-50 rounded-2xl transition-all">
                            <Layers size={18} /> System Management
                          </Link>
                        )}

                        <div className="pt-2 mt-2 border-t border-gray-100">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                          >
                            <LogOut size={18} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button className="md:hidden p-2 text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 bg-white z-40 p-8 space-y-4 animate-in slide-in-from-bottom">
             {navLinks.map((link) => (
               <Link
                 key={link.href}
                 to={link.href}
                 onClick={() => setIsMenuOpen(false)}
                 className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] font-black uppercase text-xs"
               >
                 <link.icon size={20} className="text-red-600" /> {link.name}
               </Link>
             ))}
          </div>
        )}
      </nav>

      {/* Dynamic Padding for Admin Bar */}
      <main className={`flex-grow transition-all duration-500 ${isAdmin ? 'pt-28' : 'pt-20'}`}>
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="font-black text-xs uppercase tracking-tighter italic">
            LAIKIPIA<span className="text-red-600">.</span>{isAdmin ? 'OS' : 'GO'}
          </span>
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-red-600 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[9px] font-black uppercase text-gray-400">
              {isAdmin ? 'Secure Staff Session' : 'Network Active'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;