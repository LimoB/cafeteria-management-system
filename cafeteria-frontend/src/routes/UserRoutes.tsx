import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Home from '../pages/user/Home';
import LandingPage from '../pages/user/LandingPage';
import Cart from '../pages/user/cart/Cart';
import Orders from '../pages/user/orders/Orders';
// Import the new Payment History component
import PaymentHistory from '../pages/user/orders/PaymentHistory'; 
import Profile from '../pages/user/profile/Profile';
import RequestFood from '../pages/user/custom-requests/RequestFood';

const UserRoutes = () => {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<LandingPage />} />
      
      {/* --- Protected Student Routes --- */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<Orders />} />
        
        {/* --- Added Payment History Route --- */}
        <Route path="/payment-history" element={<PaymentHistory />} />
        
        <Route path="/profile" element={<Profile />} />
        
        {/* Custom Order / Specialized Requests */}
        <Route path="/request-food" element={<RequestFood />} />
      </Route>

      {/* Fallback for undefined user routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default UserRoutes;