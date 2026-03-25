import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/slices/authSlice";
import { 
  ShoppingBag, User, LogOut, Utensils, 
  Zap, Menu, X, ChevronRight, History} from "lucide-react";

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const navLinks = [
    { name: "Daily Menu", href: "/home", icon: Utensils },
    { name: "My Orders", href: "/my-orders", icon: History },
    { name: "Custom Request", href: "/custom-request", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-slate-900">
      {/* --- Navigation Bar --- */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="bg-red-600 p-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
              <Zap className="text-white fill-white" size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">
              LAIKIPIA<span className="text-red-600">.</span>MEALS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  location.pathname === link.href 
                  ? "bg-black text-white" 
                  : "text-slate-500 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Badge */}
            <Link 
              to="/cart" 
              className="relative p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <ShoppingBag size={20} className="text-black" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-black animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Profile Dropdown (Desktop) */}
            <div className="hidden md:block group relative">
              <button className="flex items-center gap-3 p-1.5 border-2 border-black rounded-2xl bg-gray-50 hover:bg-white transition-colors">
                <div className="h-9 w-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-black border-2 border-black">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="pr-2 text-left">
                   <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Student</p>
                   <p className="text-xs font-black truncate max-w-[80px]">{user?.name?.split(' ')[0]}</p>
                </div>
              </button>
              
              <div className="absolute right-0 mt-2 w-56 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/profile" className="flex items-center gap-3 px-5 py-3 text-sm font-black uppercase tracking-tighter hover:bg-red-50 text-slate-700">
                  <User size={18} className="text-red-600" /> My Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-black uppercase tracking-tighter text-red-600 hover:bg-red-50 border-t-2 border-gray-100 mt-2 pt-4"
                >
                  <LogOut size={18} /> End Session
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-3 bg-black text-white rounded-2xl"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t-4 border-black p-6 space-y-4 animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black rounded-2xl font-black uppercase text-sm"
              >
                <div className="flex items-center gap-3">
                  <link.icon size={18} className="text-red-600" /> {link.name}
                </div>
                <ChevronRight size={18} />
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-4 font-black uppercase text-sm text-slate-500"
            >
              <User size={18} /> View Profile
            </Link>
          </div>
        )}
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow">
        {children}
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t-4 border-black py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Zap className="text-red-600" size={24} />
            <span className="font-black text-lg uppercase tracking-tighter">Laikipia <span className="text-red-600">Canteen</span></span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            &copy; 2026 Powered by Daraja API & React
          </p>
          <div className="flex gap-6">
             <Link to="/terms" className="text-[10px] font-black uppercase text-slate-400 hover:text-black">Terms</Link>
             <Link to="/help" className="text-[10px] font-black uppercase text-slate-400 hover:text-black">Kitchen Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;