import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { addToCart, decrementQuantity, removeFromCart, clearCart } from '../../../app/slices/cartSlice';
import { fetchLocations } from '../../../app/slices/locationSlice';
import { placeOrder } from '../../../app/slices/orderSlice';
import { Trash2, Plus, Minus, ShoppingBasket, CreditCard, MapPin, ArrowRight, Loader2, ShieldCheck, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { items } = useAppSelector((state) => state.cart);
  const { locations } = useAppSelector((state) => state.locations);
  const { isLoading, isError, message } = useAppSelector((state) => state.orders);
  
  const [selectedLocation, setSelectedLocation] = useState<number | string>('');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  // Safety calculation to ensure no NaN values are processed
  const subtotal = items.reduce((acc, item) => {
    const itemPrice = Number(item.price);
    if (isNaN(itemPrice)) {
      console.error(`Price Error: Item ${item.foodName} has an invalid price:`, item.price);
    }
    return acc + (itemPrice * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (!selectedLocation) return;

    // Debug logs for tracking the data flow
    console.log("Checkout Initiated");
    console.log("Current Items:", items);
    console.log("Calculated Subtotal:", subtotal);
    console.log("Selected Location ID:", selectedLocation);

    if (isNaN(subtotal) || subtotal <= 0) {
      console.error("Aborting: Subtotal is invalid (NaN or 0)");
      alert("Error calculating total. Please check your items.");
      return;
    }

    const locationObj = locations.find(l => Number(l.id) === Number(selectedLocation));
    const locationName = locationObj ? locationObj.name : "Main Canteen";

    // Fixed: Sending 'amount' instead of 'totalAmount' to match backend schema
    const orderData = {
      items: items.map(item => ({
        menuItemId: Number(item.id),
        quantity: item.quantity
      })),
      locationId: Number(selectedLocation),
      takeawayLocation: locationName,
      amount: subtotal 
    };

    console.log("Sending Payload to Backend:", orderData);

    try {
      const resultAction = await dispatch(placeOrder(orderData as any));
      
      if (placeOrder.fulfilled.match(resultAction)) {
        console.log("Order Successful:", resultAction.payload);
        dispatch(clearCart());
        navigate('/my-orders');
      } else {
        console.error("Order Rejected:", resultAction.payload);
      }
    } catch (err) {
      console.error("Thunk Error:", err);
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
            className="rounded-3xl px-12 py-5 bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:-translate-y-1 transition-all active:scale-95 shadow-xl shadow-red-100"
            onClick={() => navigate('/home')}
        >
            Browse Today's Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg shadow-red-200">
                    <ShoppingBasket size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Checkout Terminal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 italic">
                My <span className="text-red-600 underline decoration-gray-100 decoration-8">Tray</span>
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
              className="group relative bg-white border border-gray-100 rounded-[3rem] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-8 hover:shadow-[0_32px_64px_-20px_rgba(0,0,0,0.1)] transition-all duration-700"
            >
              <div className="relative h-28 w-28 shrink-0">
                <div className="absolute inset-0 bg-red-600/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                    src={item.imageUrl ?? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop"} 
                    className="h-full w-full object-cover rounded-[2.5rem] shadow-lg group-hover:scale-105 transition-transform duration-500 relative z-10" 
                    alt={item.foodName} 
                />
              </div>

              <div className="flex-grow text-center sm:text-left space-y-1">
                <h3 className="font-black text-xl text-gray-900 leading-tight uppercase tracking-tight italic">{item.foodName}</h3>
                <p className="text-red-600 font-black text-base">{formatCurrency(item.price)}</p>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest pt-2">Quantity Selected</p>
              </div>

              <div className="flex items-center bg-slate-900 rounded-[1.5rem] p-1.5 gap-2 shadow-xl shadow-slate-200">
                <button 
                  onClick={() => dispatch(decrementQuantity(item.id))}
                  className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <Minus size={20} />
                </button>
                <span className="font-black text-xl w-10 text-center text-white">{item.quantity}</span>
                <button 
                  onClick={() => dispatch(addToCart(item))}
                  className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <Plus size={20} />
                </button>
              </div>

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
          <div className="sticky top-32 bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-[0_48px_80px_-24px_rgba(0,0,0,0.12)]">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-gray-400">
              <MapPin size={18} className="text-red-600" /> Pickup Selection
            </h2>
            
            <div className="space-y-8">
                <div className="relative group">
                    <select 
                        value={selectedLocation}
                        onChange={(e) => {
                            setSelectedLocation(e.target.value);
                            setIsConfirming(false);
                        }}
                        className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:border-red-600 focus:bg-white outline-none font-black uppercase text-[11px] tracking-widest appearance-none cursor-pointer transition-all pr-12"
                    >
                        <option value="">Choose Collection Point</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id} className="font-bold py-2">{loc.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 space-y-6 border border-slate-50">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Items Subtotal</span>
                        <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>LU Platform Fee</span>
                        <span className="text-green-600 italic">KSH 0.00</span>
                    </div>
                    <div className="pt-6 border-t border-slate-200/60 flex justify-between items-end">
                        <span className="text-xs font-black uppercase text-slate-900">Total Due</span>
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>
                </div>

                {!isConfirming ? (
                    <button 
                        onClick={() => setIsConfirming(true)}
                        disabled={!selectedLocation}
                        className="w-full bg-slate-900 hover:bg-black text-white py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-2xl shadow-slate-200"
                    >
                        Final Order Review <ArrowRight size={20} className="text-red-600" />
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {isError && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest text-center">
                            {message || "Order Failed"}
                          </div>
                        )}
                        
                        <button 
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] disabled:bg-red-400"
                        >
                            {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin" size={24} />
                                  <span>Processing...</span>
                                </>
                            ) : (
                                <><CreditCard size={20} /> Confirm & Pay with M-Pesa</>
                            )}
                        </button>
                        <button 
                            onClick={() => setIsConfirming(false)}
                            disabled={isLoading}
                            className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-black transition-colors disabled:opacity-0"
                        >
                            Back to Location
                        </button>
                    </div>
                )}
                
                <div className="flex items-center justify-center gap-3 pt-6">
                    <div className="h-px bg-slate-100 flex-grow" />
                    <ShieldCheck size={16} className="text-green-500" />
                    <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Secured by Safaricom</span>
                    <div className="h-px bg-slate-100 flex-grow" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronDown = ({ size, className }: { size: number, className: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default Cart;