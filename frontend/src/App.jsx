import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// POS Pages (no authentication required)
import BranchSelection from "./pages/pos/BranchSelection";
import ProductSelection from "./pages/pos/ProductSelection";
import Checkout from "./pages/pos/Checkout";
import Receipt from "./pages/pos/Receipt";

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner border-blue-600"></div>
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

// Public Route Component (redirect to home if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Access Denied Page
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="card max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-600 mb-4">
          You do not have administrator privileges. This area is restricted to
          authorized personnel only.
        </p>
        <p className="text-sm text-slate-500">
          If you believe this is an error, please contact your system
          administrator.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - Only accessible when NOT signed in */}
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

          {/* POS Routes - No authentication required */}
          <Route path="/pos" element={<BranchSelection />} />
          <Route path="/pos/products" element={<ProductSelection />} />
          <Route path="/pos/checkout" element={<Checkout />} />
          <Route path="/pos/receipt/:transactionRef" element={<Receipt />} />

          {/* Landing/redirect page for authenticated users */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Landing />
              </ProtectedRoute>
            }
          />

          {/* Customer redirect page - for non-admin users */}
          <Route
            path="/customer-redirect"
            element={
              <ProtectedRoute>
                <CustomerRedirect />
              </ProtectedRoute>
            }
          />

          {/* Protected admin routes */}
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

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
