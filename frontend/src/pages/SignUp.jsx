import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Store, Eye, EyeOff } from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await signup(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName,
    );

    if (result.success) {
      // Redirect based on role
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
        <div className="absolute inset-0   flex items-end p-6">
          <p className="text-white w-full text-lg font-semibold text-right">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="alert alert-danger">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium mb-2"
                >
                  First Name (optional)
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  placeholder="John"
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium mb-2"
                >
                  Last Name (optional)
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
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
              <p className="text-xs text-muted-foreground mt-1">
                At least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="spinner border-white"></div>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Additional info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-coca-red hover:text-coca-red-dark  font-medium"
            >
              Sign in here
            </Link>
          </p>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <a href="#" className="text-coca-red hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-coca-red hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
