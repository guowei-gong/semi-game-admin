import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/UserManagement';
import GameData from '../pages/GameData';
import HotUpdate from '../pages/HotUpdate';
import Login from '../pages/Login';
import AccountSettings from '../pages/AccountSettings';

const AuthGuard = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <AuthGuard />,
    children: [{
      path: '/',
      element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <div style={{ padding: 24 }}>仪表盘页面开发中...</div>,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
      {
        path: 'game-data',
        element: <GameData />,
      },
      {
        path: 'hot-update',
        element: <HotUpdate />,
      },
      {
        path: 'settings',
        element: <div style={{ padding: 24 }}>系统设置页面开发中...</div>,
      },
      {
        path: 'account-settings',
        element: <AccountSettings />,
      },
    ],
  }],
  },
]);

export default router;
