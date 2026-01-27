import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const posAPI = {
  // Get all branches
  getBranches: () => axios.get(`${API_URL}/pos/branches`),

  // Get products for a specific branch
  getBranchProducts: (branchId) =>
    axios.get(`${API_URL}/pos/branches/${branchId}/products`),

  // Preview order total
  previewOrder: (branchId, items) =>
    axios.post(`${API_URL}/pos/order/preview`, { branchId, items }),

  // Initiate M-Pesa payment
  initiatePayment: (branchId, phoneNumber, items, totalAmount) =>
    axios.post(`${API_URL}/pos/payment/initiate`, {
      branchId,
      phoneNumber,
      items,
      totalAmount,
    }),

  // Confirm payment and create sale
  confirmPayment: (
    checkoutRequestId,
    branchId,
    phoneNumber,
    items,
    totalAmount,
  ) =>
    axios.post(`${API_URL}/pos/payment/confirm`, {
      checkoutRequestId,
      branchId,
      phoneNumber,
      items,
      totalAmount,
    }),

  // Get receipt
  getReceipt: (transactionRef) =>
    axios.get(`${API_URL}/pos/receipt/${transactionRef}`),
};

export default posAPI;
