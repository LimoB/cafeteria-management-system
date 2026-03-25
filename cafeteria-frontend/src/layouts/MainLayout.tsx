import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../app/slices/authSlice';
import { 
  ShoppingCart, LogOut, Menu, X, 
  ChevronDown, LayoutDashboard, Zap, History, Utensils,
  Settings, CreditCard, ShieldCheck, MessageSquarePlus, ClipboardList
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
  
  // Note: Replace this with your actual customOrders state if available
  const hasRequestUpdates = false; 
  
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isLoggedIn = !!user; 

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

  // NAVIGATION LINKS
  const navLinks = [
    { name: "Feed", href: "/", icon: Zap, public: true },
    { name: "Cafeteria", href: "/home", icon: Utensils, public: false },
    { name: "Kitchen Request", href: "/request-food", icon: MessageSquarePlus, public: false },
    { name: "Orders", href: "/my-orders", icon: History, public: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB] font-sans text-slate-900 overflow-x-hidden">
      {/* --- MODERN STICKY NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-red-600 to-orange-500 p-2 rounded-[14px] shadow-lg shadow-red-200 group-hover:rotate-6 transition-transform">
                <Zap className="text-white fill-white" size={18} />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic flex items-center">
                LAIKIPIA<span className="text-red-600 text-2xl">.</span>GO
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                if (!link.public && !isLoggedIn) return null;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.15em] transition-all relative group
                      ${isActive ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-black hover:bg-gray-50"}`}
                  >
                    {link.name}
                    {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Stack */}
          <div className="flex items-center gap-4">
            {/* Public Cart Pill */}
            <Link 
              to="/cart" 
              onClick={handleCartClick}
              className="relative p-2.5 bg-gray-100 rounded-full hover:bg-red-50 transition-colors group"
            >
              <ShoppingCart size={20} className="text-gray-600 group-hover:text-red-600 transition-colors" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {!isLoggedIn ? (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/auth/login" className="font-black text-[11px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Login</Link>
                <Link to="/auth/register" className="bg-black text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-red-600 hover:shadow-red-200 transition-all active:scale-95">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 md:gap-5">
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 border border-gray-200 rounded-full bg-white hover:border-red-200 hover:shadow-md transition-all active:scale-95"
                  >
                    <div className="h-8 w-8 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white text-xs font-black shadow-inner overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        (user?.name || user?.username || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="hidden lg:block text-left pr-1">
                       <p className="text-[10px] font-black uppercase text-gray-900 leading-none">
                         {(user?.name || user?.username || 'User').split(' ')[0]}
                       </p>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-red-600' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-4 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="px-8 py-4 bg-gray-50/50 mb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          {role === 'admin' ? 'Staff Member' : 'Authenticated Student'}
                        </p>
                        <p className="text-sm font-black text-gray-900 truncate">{user?.email || user?.username}</p>
                        <div className="mt-2 flex gap-2">
                            <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
                            {role === 'admin' && (
                              <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter italic flex items-center gap-1">
                                <ShieldCheck size={10} /> Staff Access
                              </span>
                            )}
                        </div>
                      </div>
                      
                      <div className="px-4 space-y-1">
                        <Link to="/profile" className="flex items-center gap-4 px-5 py-3 text-xs font-black uppercase text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                          <Settings size={18} /> Account Settings
                        </Link>
                        
                        <Link 
                          to={role === 'admin' ? '/admin/dashboard' : '/my-orders'} 
                          className="flex items-center gap-4 px-5 py-3 text-xs font-black uppercase text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          {role === 'admin' ? <LayoutDashboard size={18} /> : <CreditCard size={18} />}
                          {role === 'admin' ? 'Admin Portal' : 'Order History'}
                        </Link>

                        {/* Special Requests Link with Notification Badge */}
                        {role !== 'admin' && (
                           <Link to="/request-food" className="flex items-center justify-between px-5 py-3 text-xs font-black uppercase text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                             <div className="flex items-center gap-4">
                               <ClipboardList size={18} /> My Requests
                             </div>
                             {hasRequestUpdates && (
                               <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                             )}
                           </Link>
                        )}

                        <div className="pt-2 mt-2 border-t border-gray-100">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-5 py-4 text-xs font-black uppercase text-red-600 hover:bg-red-50 rounded-2xl transition-all"
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

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 bg-white z-40 p-8 space-y-6 animate-in slide-in-from-right">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Navigation</p>
                {navLinks.map((link) => {
                  if (!link.public && !isLoggedIn) return null;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] font-black uppercase text-sm group active:bg-red-50"
                    >
                      <span className="flex items-center gap-4">
                        <link.icon size={20} className="text-red-600" /> 
                        {link.name}
                      </span>
                      <ChevronDown size={18} className="-rotate-90 text-gray-300" />
                    </Link>
                  );
                })}
            </div>

            {!isLoggedIn && (
              <div className="flex flex-col gap-4 pt-10">
                <Link to="/auth/login" className="p-5 border border-gray-200 rounded-[2rem] text-center font-black uppercase text-xs">Login</Link>
                <Link to="/auth/register" className="p-5 bg-red-600 text-white rounded-[2rem] text-center font-black uppercase text-xs shadow-lg shadow-red-200">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2 group">
            <div className="bg-red-600 p-1.5 rounded-lg shadow-md">
                <Zap className="text-white fill-white" size={16} />
            </div>
            <span className="font-black text-lg uppercase tracking-tighter italic">
              LAIKIPIA<span className="text-red-600">.</span>GO
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-gray-400">System Online / Daraja API 2.0</span>
          </div>

          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            &copy; 2026 LAIKIPIA CANTEEN DIGITAL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;