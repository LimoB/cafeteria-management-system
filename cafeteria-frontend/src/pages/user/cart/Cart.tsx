import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { addToCart, decrementQuantity, removeFromCart, clearCart } from '../../../app/slices/cartSlice';
import { fetchLocations } from '../../../app/slices/locationSlice';
import { placeOrder } from '../../../app/slices/orderSlice';
import { 
  Trash2, Plus, Minus, ShoppingBasket, CreditCard, 
  MapPin, ArrowRight, Loader2, 
  ShoppingBag, AlertCircle, Info 
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { items } = useAppSelector((state) => state.cart);
  const { locations } = useAppSelector((state) => state.locations);
  const { isLoading } = useAppSelector((state) => state.orders);
  const { role } = useAppSelector((state) => state.auth); // Access role
  
  const [selectedLocation, setSelectedLocation] = useState<number | string>('');
  const [isConfirming, setIsConfirming] = useState(false);

  const isAdmin = role === 'admin';

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const subtotal = items.reduce((acc, item) => {
    const itemPrice = Number(item.price);
    return acc + (itemPrice * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    // Block Admin Checkout
    if (isAdmin) return;
    if (!selectedLocation) return;

    const locationObj = locations.find(l => Number(l.id) === Number(selectedLocation));
    const locationName = locationObj ? locationObj.name : "Main Canteen";

    const orderData = {
      items: items.map(item => ({
        menuItemId: Number(item.id),
        quantity: item.quantity
      })),
      locationId: Number(selectedLocation),
      takeawayLocation: locationName,
      amount: subtotal 
    };

    try {
      const resultAction = await dispatch(placeOrder(orderData as any));
      if (placeOrder.fulfilled.match(resultAction)) {
        dispatch(clearCart());
        navigate('/my-orders');
      }
    } catch (err) {
      console.error("Checkout Error:", err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-100 mb-8 border border-gray-50 group">
          <ShoppingBag size={80} className="text-gray-100 group-hover:text-red-500 transition-colors duration-500 group-hover:scale-110" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Your tray is empty</h2>
        <p className="text-gray-400 mt-2 mb-10 font-medium italic">Ready to grab some campus fuel?</p>
        <button 
            className="rounded-3xl px-12 py-5 bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all active:scale-95"
            onClick={() => navigate('/home')}
        >
            Browse Today's Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      {/* ADMIN TERMINAL BANNER */}
      {isAdmin && (
        <div className="mb-8 p-4 bg-slate-900 text-white rounded-[2rem] flex items-center justify-between border-l-8 border-red-600 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4 px-2">
            <AlertCircle className="text-red-500" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Restricted Access: Staff Account</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Checkout is disabled for administrative users.</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all">
            Back to Dashboard
          </button>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl text-white shadow-lg ${isAdmin ? 'bg-slate-900' : 'bg-red-600 shadow-red-200'}`}>
                    <ShoppingBasket size={20} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAdmin ? 'text-slate-900' : 'text-red-600'}`}>
                  {isAdmin ? 'System Preview' : 'Checkout Terminal'}
                </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 italic">
                {isAdmin ? 'Order' : 'My'} <span className="text-red-600 underline decoration-gray-100 decoration-8">Tray</span>
            </h1>
        </div>
        <button 
            onClick={() => dispatch(clearCart())}
            className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-600 transition-all flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-gray-50 shadow-sm"
        >
            <Trash2 size={14} /> Clear All
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`group relative bg-white border rounded-[3rem] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-8 transition-all duration-700 ${isAdmin ? 'border-slate-200 opacity-80' : 'border-gray-100 hover:shadow-2xl'}`}
            >
              <div className="relative h-28 w-28 shrink-0">
                <img 
                    src={item.imageUrl ?? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                    className="h-full w-full object-cover rounded-[2.5rem] shadow-lg relative z-10" 
                    alt={item.foodName} 
                />
              </div>

              <div className="flex-grow text-center sm:text-left space-y-1">
                <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight italic">{item.foodName}</h3>
                <p className="text-red-600 font-black text-base">{formatCurrency(item.price)}</p>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest pt-2">Quantity Selected</p>
              </div>

              {/* Only show controls if NOT admin */}
              {!isAdmin && (
                <div className="flex items-center bg-slate-900 rounded-[1.5rem] p-1.5 gap-2 shadow-xl shadow-slate-200">
                  <button onClick={() => dispatch(decrementQuantity(item.id))} className="p-3 text-slate-400 hover:text-white transition-all"><Minus size={20} /></button>
                  <span className="font-black text-xl w-10 text-center text-white">{item.quantity}</span>
                  <button onClick={() => dispatch(addToCart(item))} className="p-3 text-slate-400 hover:text-white transition-all"><Plus size={20} /></button>
                </div>
              )}

              {isAdmin && (
                <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400">
                  Fixed Qty: {item.quantity}
                </div>
              )}

              <button 
                onClick={() => dispatch(removeFromCart(item.id))}
                className="absolute top-6 right-6 p-2 text-gray-200 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-32 bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-gray-400">
              <MapPin size={18} className="text-red-600" /> Pickup Selection
            </h2>
            
            <div className="space-y-8">
                <div className="relative group">
                    <select 
                        disabled={isAdmin}
                        value={selectedLocation}
                        onChange={(e) => {
                            setSelectedLocation(e.target.value);
                            setIsConfirming(false);
                        }}
                        className={`w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-black uppercase text-[11px] tracking-widest appearance-none transition-all ${isAdmin ? 'cursor-not-allowed' : 'focus:border-red-600 focus:bg-white cursor-pointer'}`}
                    >
                        <option value="">{isAdmin ? 'Restricted Selection' : 'Choose Collection Point'}</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                    {!isAdmin && <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
                </div>

                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 space-y-6 border border-slate-50">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Subtotal</span>
                        <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="pt-6 border-t border-slate-200/60 flex justify-between items-end">
                        <span className="text-xs font-black uppercase text-slate-900">Total Due</span>
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>
                </div>

                {isAdmin ? (
                    <div className="p-8 bg-red-50 rounded-[2.5rem] text-center space-y-4">
                        <Info className="mx-auto text-red-600" size={32} />
                        <p className="text-[10px] font-black uppercase text-red-600 tracking-widest leading-relaxed">
                            Staff accounts cannot place orders to prevent inventory discrepancy.
                        </p>
                    </div>
                ) : (
                    !isConfirming ? (
                        <button 
                            onClick={() => setIsConfirming(true)}
                            disabled={!selectedLocation}
                            className="w-full bg-slate-900 hover:bg-black text-white py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-2xl"
                        >
                            Final Order Review <ArrowRight size={20} className="text-red-600" />
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <button 
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Pay with M-Pesa</>}
                            </button>
                            <button onClick={() => setIsConfirming(false)} className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Edit Location</button>
                        </div>
                    )
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronDown = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default Cart;