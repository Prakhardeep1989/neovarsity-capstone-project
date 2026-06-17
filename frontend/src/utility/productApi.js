const API_BASE = process.env.REACT_APP_SERVER_DOMIN;

const buildHeaders = (token, json = true) => {
  const headers = {};
  if (json) headers["content-type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchProducts = async (token) => {
  const res = await fetch(`${API_BASE}/api/products`, {
    headers: buildHeaders(token),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const fetchProductById = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    headers: buildHeaders(token),
  });
  if (!res.ok) return null;
  return res.json();
};

export const createProduct = async (payload, token) => {
  const res = await fetch(`${API_BASE}/api/products/admin`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateProduct = async (id, payload, token) => {
  const res = await fetch(`${API_BASE}/api/products/admin/${id}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteProduct = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/products/admin/${id}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  return res.json();
};
