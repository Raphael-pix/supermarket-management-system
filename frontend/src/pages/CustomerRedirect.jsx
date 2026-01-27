import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const CustomerRedirect = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Welcome, Customer!
          </h1>

          <p className="text-slate-600 mb-4">
            Your account has been created successfully as a{" "}
            <strong>Customer</strong>.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Note:</strong> The customer shopping interface is not
              included in this demo.
            </p>
            <p className="text-xs text-blue-700">
              This is an <strong>admin-only dashboard</strong> system. If you
              need admin access, please contact an existing administrator to
              promote your account.
            </p>
          </div>

          <div className="space-y-3">
            <button onClick={handleLogout} className="btn btn-primary w-full">
              Sign Out
            </button>

            <Link to="/login" className="btn btn-outline w-full">
              Back to Login
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRedirect;
