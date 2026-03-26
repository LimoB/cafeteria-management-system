import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { 
  Plus, Minus, Loader2, PackageOpen, 
  EyeOff, ShieldCheck, Zap, Settings2, ShoppingBag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MenuItem } from "../types/menu.types";
import { addToCart, decrementQuantity } from "../app/slices/cartSlice";
import { fetchMenu } from "../app/slices/menuSlice"; // Added for self-healing
import toast from "react-hot-toast";

interface ProductShowcaseProps {
  onOrderNowClick?: () => void;
  filteredItems: MenuItem[]; 
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ filteredItems = [] }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isLoading, items: allItems } = useAppSelector((state) => state.menu);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { role, user } = useAppSelector((state) => state.auth);

  const isAdmin = role === 'admin';

  // --- 1. BOOTSTRAP / SELF-HEALING ---
  // If the component is rendered but Redux is empty, trigger a fetch automatically.
  useEffect(() => {
    if (allItems.length === 0 && !isLoading) {
      dispatch(fetchMenu());
    }
  }, [dispatch, allItems.length, isLoading]);

  const getQuantity = (id: number | string) => {
    const item = cartItems.find((i) => String(i.id) === String(id));
    return item ? item.quantity : 0;
  };

  // --- 2. AUTH-AWARE ACTIONS ---
  const handleAddToCart = (product: MenuItem) => {
    // If guest, we let them add (Persist) but warn them or redirect if you prefer 
    // strictly restricted access. For now, we allow the add to ensure "Persistence" 
    // works, but we redirect them if they try to go to the cart later.
    dispatch(addToCart(product));
    
    if (!user) {
      toast("Item added! Log in to checkout.", {
        icon: '🔐',
        style: { borderRadius: '12px', background: '#333', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
      });
    } else {
      toast.success(`${product.foodName} added to tray`, {
        icon: '🔥',
        style: { borderRadius: '12px', background: '#333', color: '#fff', fontSize: '12px' }
      });
    }
  };

  const handleRemoveOne = (product: MenuItem) => {
    dispatch(decrementQuantity(product.id));
  };

  if (isLoading && allItems.length === 0) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <div className={`relative ${isAdmin ? 'text-red-600' : 'text-slate-900'}`}>
        <Loader2 className="h-12 w-12 animate-spin" />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4" />
      </div>
      <p className="text-gray-400 font-black text-[10px] tracking-[0.3em] uppercase italic">
        {isAdmin ? "Syncing Terminal..." : "Kitchen is Prepping..."}
      </p>
    </div>
  );

  // We use allItems if filteredItems is empty but allItems has data (Fallback)
  const displayItems = filteredItems.length > 0 ? filteredItems : allItems;

  return (
    <section className={`px-4 py-10 relative transition-colors duration-500 ${isAdmin ? 'bg-slate-50/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${isAdmin ? 'bg-black text-white' : 'bg-white text-slate-600 border border-slate-100'}`}>
                {isAdmin ? "Management Mode" : "Laikipia Student Center"}
              </span>
              {isAdmin && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 uppercase tracking-tighter">
                  <ShieldCheck size={12} /> Interactive Preview
                </span>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
              {isAdmin ? "PREVIEW" : "FRESH"} <br />
              <span className="text-red-600 italic">
                {isAdmin ? "INVENTORY" : "SERVINGS"}
              </span>
            </h2>
          </div>
          
          {!isAdmin && (
            <button 
              onClick={() => navigate(user ? '/cart' : '/auth/login')}
              className="group flex items-center gap-4 bg-white p-2 pr-6 rounded-full shadow-xl border border-gray-100 hover:scale-105 transition-transform"
            >
              <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center text-white">
                <ShoppingBag size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Your Tray</p>
                <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)} Items
                </p>
              </div>
            </button>
          )}
        </div>

        {/* --- PRODUCT GRID --- */}
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
             <PackageOpen size={64} className="text-slate-200 mb-6" />
             <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {displayItems.map((product) => {
              const quantity = getQuantity(product.id);
              const isAvailable = product.isAvailable !== false;
              
              return (
                <div 
                  key={product.id} 
                  className="group relative flex flex-col bg-white rounded-[2.5rem] md:rounded-[3rem] p-3 md:p-4 shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/40"
                >
                  <div className="relative mb-4 md:mb-6 aspect-square overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-slate-50">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                      alt={product.foodName}
                      className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${!isAvailable ? 'grayscale opacity-50' : ''}`}
                    />
                    <div className="absolute bottom-3 left-3">
                       <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-slate-900 shadow-lg uppercase tracking-widest">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 md:px-2 flex flex-col flex-grow text-left">
                    <h3 className="font-black text-slate-900 text-base md:text-lg mb-1 tracking-tight truncate uppercase italic">
                      {product.foodName}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                       <div className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                       <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
                         {isAvailable ? 'In Stock' : 'Out of Stock'}
                       </span>
                    </div>
                    
                    <div className={`mt-auto flex items-center justify-between p-1.5 md:p-2 rounded-[2rem] transition-all duration-500 ${isAdmin ? 'bg-slate-50' : 'bg-orange-50/50 group-hover:bg-black group-hover:text-white'}`}>
                      <div className="pl-4">
                        <p className={`text-[8px] font-black uppercase tracking-tighter leading-none ${isAdmin ? 'text-slate-400' : 'text-red-600 group-hover:text-red-400'}`}>Ksh</p>
                        <p className={`text-xl font-black ${isAdmin ? 'text-slate-900' : 'text-slate-900 group-hover:text-white'}`}>
                          {product.price}
                        </p>
                      </div>

                      {isAdmin ? (
                        <button
                          onClick={() => navigate('/admin/menu')}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-900 hover:bg-black hover:text-white transition-all shadow-sm"
                        >
                          <Settings2 size={12} /> Edit
                        </button>
                      ) : (
                        quantity > 0 ? (
                          <div className="flex items-center gap-3 bg-white rounded-2xl p-1 shadow-lg border border-slate-100">
                            <button onClick={() => handleRemoveOne(product)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition active:scale-75">
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="text-sm font-black text-slate-900 w-4 text-center">{quantity}</span>
                            <button onClick={() => handleAddToCart(product)} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition active:scale-75">
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={!isAvailable}
                            onClick={() => handleAddToCart(product)}
                            className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${
                              !isAvailable 
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                              : 'bg-white text-red-600 group-hover:bg-white group-hover:text-black'
                            }`}
                          >
                            {!isAvailable ? <EyeOff size={16} /> : <Plus size={16} strokeWidth={3} />}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;