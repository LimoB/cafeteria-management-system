import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/dashboard/AdminDashboard';
import MenuList from '../pages/admin/menu/MenuList';
import AddMenu from '../pages/admin/menu/AddMenu';
import AdminOrders from '../pages/admin/orders/AdminOrders';
import AdminCustomOrders from '../pages/admin/custom-orders/AdminCustomOrders';
import UserList from '../pages/admin/users/UserList';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* 1. Protect the entire /admin/* branch. 
        Only users with the 'admin' role in authSlice can pass.
      */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        
        {/* 2. Wrap all admin pages in the AdminLayout.
          This provides the Sidebar and shared Navigation UI.
        */}
        <Route element={<AdminLayout />}>
          {/* Default Redirect from /admin to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Menu Management - Using your tree structure paths */}
          <Route path="menu" element={<MenuList />} />
          <Route path="menu/add" element={<AddMenu />} />
          <Route path="menu/edit/:id" element={<AddMenu />} />
          
          {/* Orders & Requests */}
          <Route path="orders" element={<AdminOrders />} />
          <Route path="custom-orders" element={<AdminCustomOrders />} />
          
          {/* User Management */}
          <Route path="users" element={<UserList />} />
        </Route>

      </Route>

      {/* 3. Catch-all for undefined admin paths */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;