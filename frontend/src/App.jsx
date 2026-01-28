import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import SalesReports from "./pages/SalesReports";
import Users from "./pages/Users";
import Login from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import Landing from "./pages/Landing";
import CustomerRedirect from "./pages/CustomerRedirect";

import BranchSelection from "./pages/pos/BranchSelection";
import ProductSelection from "./pages/pos/ProductSelection";
import Checkout from "./pages/pos/Checkout";
import Receipt from "./pages/pos/Receipt";
import { LockKeyhole } from "lucide-react";
import { Toaster } from "sonner";

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <AccessDenied />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <LockKeyhole className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You do not have administrator privileges. This area is restricted to
          authorized personnel only.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/sign-up"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />

          <Route path="/pos" element={<BranchSelection />} />
          <Route path="/pos/products" element={<ProductSelection />} />
          <Route path="/pos/checkout" element={<Checkout />} />
          <Route path="/pos/receipt/:transactionRef" element={<Receipt />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Landing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer-redirect"
            element={
              <ProtectedRoute>
                <CustomerRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<SalesReports />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
