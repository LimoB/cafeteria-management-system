import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Search, Flame, Clock, Zap, ShoppingBag, MapPin, ChevronRight } from 'lucide-react';
import ProductShowcase from '../../components/ProductShowcase';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const [searchQuery, setSearchQuery] = useState('');

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32 overflow-x-hidden">
      {/* --- RADIAL BACKGROUND BLOB (The "Modern" Touch) --- */}
      <div className="fixed top-[-10%] right-[-10%] w-[70%] h-[50%] bg-gradient-to-br from-red-100/50 to-orange-100/30 blur-[120px] rounded-full -z-10" />

      {/* --- TOP NAV / LOCATION --- */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
          <MapPin size={14} className="text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">Laikipia Main Cafeteria</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
          {user?.name?.charAt(0) || 'S'}
        </div>
      </nav>

      <header className="px-6 pt-6 pb-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-red-600 font-black uppercase text-[11px] tracking-[0.3em] mb-2 drop-shadow-sm">
            {getGreeting()}
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[0.9] tracking-tighter">
            HUNGRY, <br />
            <span className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent italic">
              {user?.name?.split(' ')[0] || 'CHAMP'}?
            </span>
          </h1>
        </div>

        {/* SEARCH BAR - Neumorphic / Glass Hybrid */}
        <div className="relative group max-w-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-400 rounded-3xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
          <div className="relative flex items-center bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden">
            <Search className="ml-6 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search Chapati, Pilau, Melons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-5 bg-transparent text-sm font-bold outline-none placeholder:text-gray-300"
            />
            <button className="mr-2 bg-black text-white px-6 py-3 rounded-[1.5rem] font-black text-xs uppercase hover:bg-red-600 transition-colors">
              Find
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* --- DYNAMIC PROMO - Gradient Style --- */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-red-950 to-black rounded-[2.5rem] p-8 mb-12 shadow-2xl transition-transform hover:scale-[1.01]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                Flash Deal
              </span>
              <span className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <Clock size={12} /> Science Lab Delivery
              </span>
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic leading-none mb-3">
              KSh 0 Delivery <br /> <span className="text-orange-400">Above 200/-</span>
            </h2>
            <p className="text-gray-400 text-xs font-medium max-w-[250px]">
              Exclusive for students ordering from the Main Cafeteria today.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <Flame className="absolute -right-8 -bottom-8 h-48 w-48 text-red-600/20 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <Zap className="absolute right-12 top-8 h-12 w-12 text-orange-400/30 -rotate-12" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-600/40 to-transparent blur-3xl" />
        </div>

        {/* --- LIVE MENU SECTION --- */}
        <div className="mt-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Menu</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 uppercase italic leading-none">
                Fresh <span className="text-red-600">Servings</span>
              </h2>
            </div>
            <button className="flex items-center gap-1 text-[11px] font-black uppercase text-red-600 hover:gap-2 transition-all">
              See All <ChevronRight size={14} />
            </button>
          </div>

          {/* Product Showcase Container with soft elevation */}
          <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-2 border border-white/50 shadow-inner">
            <ProductShowcase 
              onOrderNowClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            />
          </div>
        </div>
      </main>

      {/* --- CART BUTTON - Modern Floating Gradient --- */}
      {totalItems > 0 && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
          <button 
            onClick={() => navigate('/cart')}
            className="group w-full max-w-md h-16 bg-gradient-to-r from-black via-gray-900 to-black text-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-between px-2 active:scale-95 transition-all overflow-hidden"
          >
            <div className="flex items-center gap-4 pl-6">
              <div className="relative">
                <ShoppingBag className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full" />
              </div>
              <div>
                <span className="block font-black uppercase text-xs tracking-tight">View Your Tray</span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase">{totalItems} Items Added</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-600 to-orange-500 h-12 px-6 rounded-[1.5rem] flex items-center gap-2 mr-1">
               <span className="font-black text-sm">Checkout</span>
               <ChevronRight size={16} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;