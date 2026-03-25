import { Routes, Route } from 'react-router-dom';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';

// Auth Pages
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/auth/AdminLogin';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- AUTHENTICATION ROUTES --- */}
      <Route path="/auth">
        <Route path="login" element={<Login />} />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* --- ADMIN BRANCH --- */}
      {/* Order is important: Admin specific routes must come before the general User catch-all */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* --- USER/STUDENT BRANCH --- */}
      <Route path="/*" element={<UserRoutes />} />

      {/* GLOBAL FALLBACK */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-20 text-center font-sans">
          <h1 className="text-9xl font-black text-slate-200 tracking-tighter">404</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] mt-4">
            Route Not Found
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-10 px-8 py-3 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95"
          >
            Go Back
          </button>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;