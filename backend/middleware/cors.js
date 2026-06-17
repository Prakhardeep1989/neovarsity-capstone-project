const cors = require("cors");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean);

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

module.exports = corsMiddleware;
