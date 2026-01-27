/**
 * Format currency in KES
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return formatDate(date);
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, length = 50) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "?";
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return first + last;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

/**
 * Get status color based on stock level
 */
export const getStockStatusColor = (current, threshold) => {
  if (current === 0) return "text-red-600 bg-red-50";
  if (current < threshold) return "text-yellow-600 bg-yellow-50";
  return "text-green-600 bg-green-50";
};

/**
 * Get stock status text
 */
export const getStockStatusText = (current, threshold) => {
  if (current === 0) return "Out of Stock";
  if (current < threshold) return "Low Stock";
  return "In Stock";
};
