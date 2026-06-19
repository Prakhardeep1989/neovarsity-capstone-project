const API_BASE = process.env.REACT_APP_SERVER_DOMIN;

const jsonHeaders = { "content-type": "application/json" };

export const isCaptchaEnabled = () =>
  Boolean(process.env.REACT_APP_RECAPTCHA_SITE_KEY);

export async function login({ email, password, captchaToken }) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password, captchaToken }),
  });
  return response.json();
}

export async function forgotPassword({ email }) {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export async function resetPassword({ token, password, confirmPassword }) {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ token, password, confirmPassword }),
  });
  return response.json();
}

export async function changePassword(
  { currentPassword, newPassword, confirmPassword },
  token
) {
  const response = await fetch(`${API_BASE}/change-password`, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  return response.json();
}
