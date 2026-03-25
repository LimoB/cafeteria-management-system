/**
 * Interface representing a single item in the student's cart
 */
export interface CartItem {
  id: number;
  foodName: string;
  price: number;
  quantity: number;
  amount: number;
}

/**
 * Interface for the validation result
 */
interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validates the student's shopping cart before processing payment or DB insertion.
 * @param cart - Array of food items from the frontend
 */
const validateCart = (cart: CartItem[]): ValidationResult => {
  // 1. Check if the cart is a valid array and not empty
  if (!Array.isArray(cart) || cart.length === 0) {
    return {
      isValid: false,
      message: "Please select at least one meal to place an order.",
    };
  }

  // 2. Validate every item structure and logic
  for (const item of cart) {
    // Basic structural check
    const hasRequiredFields = 
      item.id && 
      item.foodName && 
      typeof item.price === 'number' && 
      item.quantity > 0;

    if (!hasRequiredFields) {
      return {
        isValid: false,
        message: `Invalid data for item: ${item.foodName || 'Unknown Item'}.`,
      };
    }

    // 3. 🛡️ Security: Price Consistency Check
    // We recalculate the amount to ensure it matches (price * quantity)
    // This prevents "Man-in-the-middle" tampering with the total.
    const expectedAmount = item.price * item.quantity;
    if (Math.abs(item.amount - expectedAmount) > 0.01) { // Using 0.01 to handle float precision
      return {
        isValid: false,
        message: `Price mismatch detected for ${item.foodName}. Please refresh your cart.`,
      };
    }
  }

  return {
    isValid: true,
    message: "The cart is valid and ready for checkout.",
  };
};

export default validateCart;