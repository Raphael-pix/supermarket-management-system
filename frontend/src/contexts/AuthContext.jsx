import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set axios default authorization header
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      // Token might be invalid or expired
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      // Set default authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (email, password, firstName, lastName) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        firstName,
        lastName,
      });

      const { user, token } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      // Set default authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Signup failed";
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to change password";
      return { success: false, error: errorMessage };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
