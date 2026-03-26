import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { 
  Search, Flame, Clock, ShoppingBag, 
  MapPin, ChevronRight, ShieldCheck 
} from 'lucide-react';
import ProductShowcase from '../../components/ProductShowcase';
import { fetchMenu } from '../../app/slices/menuSlice'; // Ensure this path is correct

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux State
  const { user, role } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: menuItems } = useAppSelector((state) => state.menu);
  
  // Local State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const isAdmin = role === 'admin';
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // --- 1. BOOTSTRAP DATA ---
  useEffect(() => {
    console.group("🚀 Home Component Mounted");
    console.log("Current Menu Items in Store:", menuItems.length);
    
    // Only fetch if we don't have items to avoid infinite loops, 
    // or always fetch to ensure freshness
    if (menuItems.length === 0) {
      console.log("Triggering fetchMenu dispatch...");
      dispatch(fetchMenu());
    }
    console.groupEnd();
  }, [dispatch, menuItems.length]);

  // --- 2. FILTER LOGIC WITH LOGS ---
  const filteredProducts = useMemo(() => {
    const results = menuItems.filter((item) => {
      const itemTitle = item.foodName?.toLowerCase() || "";
      const itemCat = item.category?.toLowerCase() || "";
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch = search === "" || itemTitle.includes(search) || itemCat.includes(search);
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });

    console.log(`🔍 Filter Update: Query="${searchQuery}", Cat="${activeCategory}" | Result Count: ${results.length}`);
    return results;
  }, [menuItems, searchQuery, activeCategory]);

  // Derived Categories
  const categories = useMemo(() => {
    const uniqueCats = ['All', ...new Set(menuItems.map(item => item.category || 'Other'))];
    console.log("📂 Available Categories detected:", uniqueCats);
    return uniqueCats;
  }, [menuItems]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed top-[-10%] right-[-10%] w-[70%] h-[50%] bg-gradient-to-br from-red-100/50 to-orange-100/30 blur-[120px] rounded-full -z-10" />

      {/* --- TOP NAV --- */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
          <MapPin size={14} className="text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">
            {isAdmin ? "Admin Node: Laikipia Central" : "Laikipia Main Cafeteria"}
          </span>
        </div>
        
        <div 
          onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/profile')}
          className={`h-10 w-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs transition-transform hover:scale-110 cursor-pointer ${isAdmin ? 'bg-slate-900' : 'bg-gradient-to-tr from-red-600 to-orange-400'}`}
        >
          {isAdmin ? <ShieldCheck size={16} /> : (user?.name?.charAt(0) || 'S')}
        </div>
      </nav>

      <header className="px-6 pt-6 pb-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-red-600 font-black uppercase text-[11px] tracking-[0.3em] mb-2 flex items-center gap-2">
            {isAdmin && <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[8px] animate-pulse">Staff Mode</span>}
            {getGreeting()}
          </p>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[0.85] tracking-tighter">
            {isAdmin ? "COMMANDING," : "HUNGRY,"} <br />
            <span className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent italic">
              {isAdmin ? "DIRECTOR?" : (user?.name?.split(' ')[0] || 'CHAMP?')}
            </span>
          </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group max-w-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-400 rounded-3xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
          <div className="relative flex items-center bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden">
            <Search className="ml-6 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder={isAdmin ? "Test search engine..." : "Search Chapati, Pilau, Melons..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-5 bg-transparent text-sm font-bold outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="flex gap-3 mt-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat 
                ? 'bg-black text-white border-black shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* PROMO */}
        <div className={`group relative overflow-hidden rounded-[2.5rem] p-8 mb-12 shadow-2xl transition-transform hover:scale-[1.01] ${isAdmin ? 'bg-slate-900 border-4 border-emerald-500/20' : 'bg-gradient-to-br from-gray-900 via-red-950 to-black'}`}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className={`${isAdmin ? 'bg-emerald-500' : 'bg-red-600'} text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                {isAdmin ? 'System Sync' : 'Flash Deal'}
              </span>
              <span className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <Clock size={12} /> {isAdmin ? 'Live Simulation' : 'Main Cafeteria Delivery'}
              </span>
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic leading-none mb-3">
              {isAdmin ? "Client View" : "KSh 0 Delivery"} <br /> 
              <span className={isAdmin ? "text-emerald-400" : "text-orange-400"}>
                {isAdmin ? "Testing" : "Above 200/-"}
              </span>
            </h2>
          </div>
          <Flame className={`absolute -right-8 -bottom-8 h-48 w-48 opacity-20 rotate-12 transition-transform duration-700 ${isAdmin ? 'text-emerald-500' : 'text-red-600'}`} />
        </div>

        {/* SHOWCASE SECTION */}
        <div className="mt-8">
          {/* We pass filteredProducts here */}
          <ProductShowcase 
            onOrderNowClick={() => {}} 
            filteredItems={filteredProducts} 
          />
        </div>
      </main>

      {/* FLOAT CART BUTTON */}
      {totalItems > 0 && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
          <button 
            onClick={() => navigate('/cart')}
            className="group w-full max-w-md h-16 bg-black text-white rounded-[2rem] shadow-2xl flex items-center justify-between px-2 active:scale-95 transition-all overflow-hidden"
          >
            <div className="flex items-center gap-4 pl-6">
              <ShoppingBag className={isAdmin ? "text-emerald-400" : "text-red-500"} />
              <div className="text-left">
                <span className="block font-black uppercase text-xs tracking-tight">
                  {isAdmin ? "Test Tray" : "View Your Tray"}
                </span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase">{totalItems} Items Added</span>
              </div>
            </div>
            
            <div className={`h-12 px-6 rounded-[1.5rem] flex items-center gap-2 mr-1 ${isAdmin ? 'bg-emerald-600' : 'bg-gradient-to-r from-red-600 to-orange-500'}`}>
               <span className="font-black text-sm">{isAdmin ? "Process" : "Checkout"}</span>
               <ChevronRight size={16} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;