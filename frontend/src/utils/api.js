import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Dashboard API
export const dashboardAPI = {
  getMetrics: () => api.get("/dashboard/metrics"),
  getSalesTimeline: () => api.get("/dashboard/sales-timeline"),
  getRecentTransactions: (limit = 10) =>
    api.get(`/dashboard/recent-transactions?limit=${limit}`),
};

// Inventory API
export const inventoryAPI = {
  getInventory: (params) => api.get("/inventory", { params }),
  getBranches: () => api.get("/inventory/branches"),
  getProducts: () => api.get("/inventory/products"),
  getLowStock: () => api.get("/inventory/low-stock"),
  restockBranch: (data) => api.post("/inventory/restock", data),
};

// Sales API
export const salesAPI = {
  getReports: (params) => api.get("/sales/reports", { params }),
  getDetailedSales: (params) => api.get("/sales/detailed", { params }),
  getAnalytics: () => api.get("/sales/analytics"),
};

// Users API
export const usersAPI = {
  getAllUsers: (params) => api.get("/users", { params }),
  getUserStats: () => api.get("/users/stats"),
  promoteToAdmin: (userId) => api.post(`/users/${userId}/promote`),
  demoteToUser: (userId) => api.post(`/users/${userId}/demote`),
};

export default api;
