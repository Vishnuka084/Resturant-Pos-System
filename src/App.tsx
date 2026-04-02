import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RootLayout } from './components/layout/RootLayout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { POSPage } from './pages/pos/POSPage';
import { KitchenDisplay } from './pages/kitchen/KitchenDisplay';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QRMenu } from './pages/customer/QRMenu';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="menu" element={<QRMenu />} />
              
              <Route path="pos" element={
                <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                  <POSPage />
                </ProtectedRoute>
              } />
              
              <Route path="kitchen" element={
                <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                  <KitchenDisplay />
                </ProtectedRoute>
              } />
              
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
