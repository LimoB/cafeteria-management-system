import React, { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { X, ShoppingBasket, ArrowRight, CreditCard, Trash2, Minus, Plus } from "lucide-react";
import { addToCart, decrementQuantity, removeFromCart } from "../app/slices/cartSlice";

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderNow: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose, onOrderNow }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  
  const { items } = useAppSelector((state) => state.cart);
  
  // Fixed TS(7006) by explicitly typing 'sum'
  const total = items.reduce((sum: number, item) => sum + (Number(item.price) * item.quantity), 0);

  useEffect(() => {
    if (!panelRef.current) return;
    if (isOpen) {
      panelRef.current.removeAttribute("inert");
      document.body.style.overflow = "hidden";
    } else {
      panelRef.current.setAttribute("inert", "");
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity" onClick={onClose} />
      )}

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 w-full sm:w-[420px] h-full z-[110] bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg shadow-red-200">
              <ShoppingBasket size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">My Tray</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{items.length} Items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Scroll Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBasket size={60} className="text-gray-100" />
              <p className="text-gray-400 font-medium text-sm italic">Your tray is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-3xl p-4 border border-gray-100 space-y-3">
                <div className="flex gap-4">
                  {/* FIXED TS(2322): Added ?? fallback to handle 'string | null' */}
                  <img 
                    src={item.imageUrl ?? "/placeholder-food.jpg"} 
                    className="w-16 h-16 rounded-2xl object-cover" 
                    alt={item.foodName} 
                  />
                  <div className="flex-grow">
                    <p className="font-black text-gray-900 text-sm leading-tight">{item.foodName}</p>
                    <p className="text-red-600 font-bold text-xs mt-1">Ksh {item.price}</p>
                  </div>
                  <button 
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="h-8 w-8 flex items-center justify-center text-gray-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                  <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-gray-100">
                    <button onClick={() => dispatch(decrementQuantity(item.id))} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Minus size={14}/>
                    </button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => dispatch(addToCart(item))} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Plus size={14}/>
                    </button>
                  </div>
                  <p className="font-black text-gray-900 text-sm">Ksh {Number(item.price) * item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t bg-gray-50/50 rounded-t-[3rem]">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
              <span>Subtotal</span>
              <span>Ksh {total}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-gray-900 font-black text-lg">Amount to Pay</span>
              <span className="text-3xl font-black text-red-600 tracking-tighter">Ksh {total}</span>
            </div>
          </div>

          <button
            onClick={onOrderNow}
            disabled={items.length === 0}
            className="w-full bg-black hover:bg-red-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20 shadow-xl shadow-gray-200"
          >
            <CreditCard size={20} />
            ORDER VIA M-PESA
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPanel;