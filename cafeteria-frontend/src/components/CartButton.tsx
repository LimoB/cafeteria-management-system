import React from 'react';
import { ShoppingBag } from "lucide-react";
import { useAppSelector } from "../app/hooks";
// Import the CartItem type from your slice to ensure perfect type safety
import { CartItem } from "../app/slices/cartSlice";

interface CartButtonProps {
  onClick: () => void;
}

const CartButton: React.FC<CartButtonProps> = ({ onClick }) => {
  // Access items from the new 'cart' slice we registered in store.ts
  const { items } = useAppSelector((state) => state.cart);

  // 1. Calculate total items for the red badge
  // We explicitly type 'sum' as number to fix the TS(7006) error
  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // 2. Calculate total price for the button text
  const totalPrice = items.reduce((sum: number, i: CartItem) => {
    return sum + (Number(i.price) * i.quantity);
  }, 0);

  return (
    <button
      onClick={onClick}
      className="bg-black hover:bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 text-sm font-black transition-all active:scale-95 group border-2 border-transparent hover:border-white/20"
    >
      <div className="relative">
        <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
        
        {/* Only show badge if there are items in the tray */}
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-black animate-in zoom-in duration-300">
            {totalItems}
          </span>
        )}
      </div>

      <span className="tracking-tighter uppercase">
        {totalItems === 0 ? (
          "View Tray"
        ) : (
          `Tray • Ksh ${totalPrice}`
        )}
      </span>
    </button>
  );
};

export default CartButton;