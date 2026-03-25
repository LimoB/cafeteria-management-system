// import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// import Axios from "axios";
// import useUserAuth from "../hooks/user/useUserAuth";

// const context = createContext(null);

// function GlobalProvider({ children }) {
//   const [cart, setCart] = useState([]);
//   // Use null initially to distinguish between "Loading" and "Guest"
//   const [user, setUser] = useState(null);
//   const authorizeUser = useUserAuth();

//   // fetch user data
//   const fetchUserData = useCallback(async () => {
//     try {
//       const { isAuthorized, user: authUser } = await authorizeUser();

//       if (isAuthorized) {
//         console.log("global.jsx: User is authorized");
        
//         // Try to get full details if not provided by auth check
//         const { data } = await Axios.get(
//           `${process.env.NEXT_PUBLIC_API_HOST}/user`,
//           { withCredentials: true }
//         );

//         if (data?.user) {
//           const { name, email, phone } = data.user;
//           setUser({ name, email, phone });
//         }
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       // FIX: Safe error handling with Optional Chaining
//       const errMsg = error.response?.data?.message || error.message || "Session error";
//       console.error("GlobalProvider Error:", errMsg);
//       setUser(null);
//     }
//   }, [authorizeUser]);

//   // Initial Data Load
//   useEffect(() => {
//     fetchUserData();
    
//     // Load Cart
//     const storedCart = localStorage.getItem("cart");
//     if (!storedCart) {
//       localStorage.setItem("cart", JSON.stringify([]));
//     } else {
//       try {
//         setCart(JSON.parse(storedCart));
//       } catch (e) {
//         setCart([]);
//       }
//     }
//   }, [fetchUserData]);

//   const saveCartToStorage = (updatedCart) => {
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//   };

//   const addToCart = (cartItem) => {
//     const newCart = [
//       ...cart.filter((item) => item.id !== cartItem.id),
//       { ...cartItem, quantity: 1, amount: cartItem.price },
//     ];
//     saveCartToStorage(newCart);
//   };

//   const deleteFromCart = (id) => {
//     const newCart = cart.filter((cartItem) => cartItem.id !== id);
//     saveCartToStorage(newCart);
//   };

//   const resetCart = () => {
//     saveCartToStorage([]);
//   };

//   const handleQuantityIncrement = (id) => {
//     const newCart = cart.map((cartItem) => {
//       if (cartItem.id === id) {
//         const newQty = cartItem.quantity + 1;
//         return { ...cartItem, quantity: newQty, amount: newQty * cartItem.price };
//       }
//       return cartItem;
//     });
//     saveCartToStorage(newCart);
//   };

//   const handleQuantityDecrement = (id) => {
//     const item = cart.find((i) => i.id === id);
//     if (!item) return;

//     if (item.quantity === 1) return deleteFromCart(id);

//     const newCart = cart.map((cartItem) => {
//       if (cartItem.id === id) {
//         const newQty = cartItem.quantity - 1;
//         return { ...cartItem, quantity: newQty, amount: newQty * cartItem.price };
//       }
//       return cartItem;
//     });
//     saveCartToStorage(newCart);
//   };

//   const cartCount = () => cart.length;

//   const cartTotal = () => cart.reduce((total, item) => total + item.amount, 0);

//   const isPresentInCart = (id) => cart.some((item) => item.id === id);

//   return (
//     <context.Provider
//       value={{
//         cart,
//         addToCart,
//         deleteFromCart,
//         handleQuantityIncrement,
//         handleQuantityDecrement,
//         cartTotal,
//         cartCount,
//         resetCart,
//         user,
//         setUser,
//         isPresentInCart,
//       }}
//     >
//       {children}
//     </context.Provider>
//   );
// }

// export const useGlobalContext = () => useContext(context);

// export default GlobalProvider;