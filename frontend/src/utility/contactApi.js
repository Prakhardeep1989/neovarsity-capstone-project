const API_BASE = process.env.REACT_APP_SERVER_DOMIN;

export const sendContactMessage = async ({ name, email, message }) => {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, email, message }),
  });
  return res.json();
};
