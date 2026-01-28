import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Store, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/customer-redirect");
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:block relative m-8 rounded-xl">
        <img
          src="/images/auth-drinks.jpg"
          alt="Soft drinks"
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
        />
        <div className="absolute inset-0 flex items-end p-6 ">
          <p className="text-white text-xl font-semibold w-full text-right">
            Refresh your sales experience
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 my-auto lg:mx-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg bg-coca-red">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">SoftSpree</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="bg-card card rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="alert alert-danger">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-dark"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="spinner border-white"></div>
                  <p>Signing in...</p>
                </>
              ) : (
                <p>Sign In</p>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="text-coca-red hover:text-coca-red-dark font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
