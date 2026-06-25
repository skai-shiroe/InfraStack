import { Routes, Route, Navigate } from 'react-router-dom';  // Retirez BrowserRouter
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Stock from './pages/Stock';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Clients from './pages/Clients';
import Sales from './pages/Sales';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-500 text-lg">Loading...</div></div>;
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-500 text-lg">Loading...</div></div>;
  return token ? <Navigate to="/" /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="stock" element={<Stock />} />
        <Route path="categories" element={<Categories />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="clients" element={<Clients />} />
        <Route path="sales" element={<Sales />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>                           {/* PLUS de <BrowserRouter> ici */}
      <AppRoutes />
    </AuthProvider>
  );
}