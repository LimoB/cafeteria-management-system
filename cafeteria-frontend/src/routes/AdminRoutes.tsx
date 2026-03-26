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
import AddUser from '../pages/admin/users/AddUser'; // Import the new page component

const AdminRoutes = () => {
  return (
    <Routes>
      {/* 1. Protect the entire /admin/* branch */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        
        {/* 2. Wrap all admin pages in the AdminLayout */}
        <Route element={<AdminLayout />}>
          {/* Default Redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Menu Management */}
          <Route path="menu" element={<MenuList />} />
          <Route path="menu/add" element={<AddMenu />} />
          <Route path="menu/edit/:id" element={<AddMenu />} />
          
          {/* Orders & Requests */}
          <Route path="orders" element={<AdminOrders />} />
          <Route path="custom-orders" element={<AdminCustomOrders />} />
          
          {/* User Management */}
          <Route path="users" element={<UserList />} />
          {/* New Path for Adding/Registering Users */}
          <Route path="users/add" element={<AddUser />} />
        </Route>

      </Route>

      {/* 3. Catch-all for undefined admin paths */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;