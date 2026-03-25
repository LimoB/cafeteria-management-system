import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Wrappers
import MainLayout from './layouts/MainLayout';

// Route Groups
import UserRoutes from './routes/UserRoutes';
import AdminRoutes from './routes/AdminRoutes'; 

// Common Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
  return (
    <Router>
      {/* Updated Toaster to match the Neobrutalist look */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#000',
            color: '#fff',
            border: '2px solid #ef4444',
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          },
        }}
      />

      <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-red-200 selection:text-red-900">
        <Routes>
          {/* 1. AUTHENTICATION (NO NAV/FOOTER) */}
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="admin-login" element={<AdminLogin />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* 2. ADMIN PANEL (Isolated - Likely uses its own AdminLayout) */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* 3. STUDENT PORTAL & LANDING (Wrapped in MainLayout) */}
          <Route 
            path="/*" 
            element={
              <MainLayout>
                <UserRoutes />
              </MainLayout>
            } 
          />

          {/* 4. CUSTOM ERROR PAGE (Brutal Style) */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
              <div className="bg-red-600 border-4 border-black p-8 rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <h1 className="text-8xl font-black text-white tracking-tighter uppercase italic italic-none">403</h1>
                <p className="text-white mt-2 font-black uppercase tracking-[0.2em] text-xs">Access Denied</p>
              </div>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-12 bg-black text-white px-10 py-5 border-4 border-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Return to Campus
              </button>
            </div>
          } />
          
          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;