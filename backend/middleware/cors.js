const cors = require("cors");

const stripQuotes = (value) => (value || "").replace(/^["']|["']$/g, "").trim();

const normalizeOrigin = (url) => stripQuotes(url).replace(/\/$/, "");

const allowedOrigins = [
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean),
  "http://localhost:3000",
];

const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL_PREVIEWS === "true";

const isAllowedOrigin = (origin) => {
  const normalized = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalized)) {
    return true;
  }

  if (!allowVercelPreviews) {
    return false;
  }

  try {
    const { protocol, hostname } = new URL(normalized);
    return protocol === "https:" && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

console.log(
  "[CORS] Allowed origins:",
  allowedOrigins.join(", ") || "(none configured)",
  allowVercelPreviews ? "| + https://*.vercel.app previews" : ""
);

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    console.warn("[CORS] Blocked origin:", origin);
    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

module.exports = corsMiddleware;
