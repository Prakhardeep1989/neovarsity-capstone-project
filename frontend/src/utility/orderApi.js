const API_BASE = process.env.REACT_APP_SERVER_DOMIN;

const authHeaders = (token) => ({
  "content-type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const createCheckoutSession = async (payload, token) => {
  const res = await fetch(`${API_BASE}/api/orders/create-checkout-session`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const fetchMyOrders = async (token) => {
  const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const fetchAllOrders = async (token) => {
  const res = await fetch(`${API_BASE}/api/orders/admin/all`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const updateOrderStatus = async (orderId, status, token) => {
  const res = await fetch(`${API_BASE}/api/orders/admin/${orderId}/status`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const formatOrderStatus = (status) =>
  status?.replace(/_/g, " ") || "";

export const formatPaymentStatus = (status) => status || "PENDING";

export const formatOrderDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDeliveryAddress = (details) => {
  if (!details) return "";
  return [
    details.addressLine1,
    details.addressLine2,
    details.city,
    details.state,
    details.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};
