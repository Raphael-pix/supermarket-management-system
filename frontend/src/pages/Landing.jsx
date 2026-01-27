import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Check user role and redirect accordingly
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        // For customers - show message since we don't have customer interface
        navigate("/customer-redirect", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="spinner border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting you...</p>
      </div>
    </div>
  );
};

export default Landing;
