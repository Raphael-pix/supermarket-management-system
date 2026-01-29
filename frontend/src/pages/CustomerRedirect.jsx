import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const CustomerRedirect = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-4">
        <div className="bg-card card rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-coca-red rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold mb-3">Welcome!</h1>

          <p className="mb-4">Your account has been created successfully</p>

          <div className="bg-accent border border-border rounded-lg p-4 mb-6 text-left">
            <p className="text-md">
              This is an <strong>admin-only dashboard</strong> system. please
              contact an existing administrator to promote your account.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full btn btn-primary bg-coca-red text-center"
            >
              Sign Out
            </button>

            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-muted-dark w-full"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRedirect;
