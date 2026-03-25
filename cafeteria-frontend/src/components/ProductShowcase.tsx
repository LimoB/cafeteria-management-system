import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Plus, Minus, Loader2, Utensils, PackageOpen } from "lucide-react";
import * as menuApi from "../api/menu";
import { MenuItem } from "../types/menu.types";
import { addToCart, decrementQuantity } from "../app/slices/cartSlice";

interface ProductShowcaseProps {
  onOrderNowClick: () => void;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ }) => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const dispatch = useAppDispatch();
  const { items: menuItemsFromStore } = useAppSelector((state) => state.menu);
  const { items: cartItems } = useAppSelector((state) => state.cart);

  // Helper to get current quantity of a specific item from Redux
  const getQuantity = (id: number | string) => {
    const item = cartItems.find((i) => String(i.id) === String(id));
    return item ? item.quantity : 0;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1. Check Store First
        if (Array.isArray(menuItemsFromStore) && menuItemsFromStore.length > 0) {
          setProducts(menuItemsFromStore.slice(0, 12));
          setLoading(false);
          return;
        }

        // 2. API Fallback
        const response = await menuApi.getMenu();
        const apiData = response.data || response; 
        
        if (Array.isArray(apiData)) {
          const sanitized = apiData.map((item: any) => ({
            ...item,
            id: Number(item.id),
            price: typeof item.price === 'number' ? item.price.toString() : item.price
          }));
          setProducts(sanitized.slice(0, 12));
        }
      } catch (error) {
        console.error("Failed to sync canteen menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [menuItemsFromStore]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      <p className="text-gray-400 font-black text-xs tracking-widest uppercase italic">Updating Campus Menu...</p>
    </div>
  );

  return (
    <section className="px-4 py-16 bg-slate-50/50 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                Laikipia Student Center
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">
              Student <span className="text-red-600">Specials</span>
            </h2>
          </div>
          <p className="text-gray-500 max-w-sm text-sm font-medium leading-relaxed">
            Quick pick-ups for busy schedules. Browse today's meals and pay via M-Pesa.
          </p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
             <PackageOpen size={48} className="text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">The kitchen is currently prepping...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
              const quantity = getQuantity(product.id);
              const displayImage = product.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop";

              return (
                <div key={product.id} className="flex flex-col bg-white rounded-[2.5rem] p-3 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-red-200/40 transition-all duration-500 group">
                  {/* Image Container */}
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100">
                    <img
                      src={displayImage}
                      alt={product.foodName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-gray-900 shadow-sm uppercase tracking-widest">
                      {product.category || "Main Dish"}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="px-2 pb-2 flex flex-col flex-grow">
                    <h3 className="font-black text-gray-900 text-base mb-1 truncate">{product.foodName}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-4 font-bold uppercase tracking-tight">
                      <Utensils size={12} className="text-red-600" />
                      <span>Canteen Counter 01</span>
                    </div>
                    
                    {/* Price & Add Logic */}
                    <div className="flex items-center justify-between mt-auto bg-gray-50 p-2 rounded-2xl group-hover:bg-red-50/50 transition-colors">
                      <div className="flex flex-col pl-2">
                        <span className="text-[10px] text-gray-400 font-black leading-none uppercase tracking-tighter">Ksh</span>
                        <span className="text-gray-900 font-black text-lg">{product.price}</span>
                      </div>

                      {quantity > 0 ? (
                        <div className="flex items-center gap-3 bg-white rounded-xl p-1 shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={() => dispatch(decrementQuantity(product.id))} 
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition active:scale-90"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-black text-gray-900 w-4 text-center">{quantity}</span>
                          <button 
                            onClick={() => dispatch(addToCart(product))} 
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition active:scale-90"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => dispatch(addToCart(product))}
                          className="p-3 bg-red-600 text-white rounded-xl hover:bg-black shadow-lg shadow-red-100 transition-all active:scale-90"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
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