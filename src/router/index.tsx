import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/UserManagement';
import GameData from '../pages/GameData';
import Login from '../pages/Login';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
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
        path: 'settings',
        element: <div style={{ padding: 24 }}>系统设置页面开发中...</div>,
      },
    ],
  },
]);

export default router;
