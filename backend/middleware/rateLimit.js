const rateLimit = require("express-rate-limit");

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message, alert: false },
  });

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
    alert: false,
  },
  skip: (req) =>
    req.method === "OPTIONS" || req.path === "/api/payments/razorpay/webhook",
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login or signup attempts, please try again later",
});

const contactLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many contact form submissions, please try again later",
});

const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password reset attempts, please try again later",
});

module.exports = {
  generalLimiter,
  authLimiter,
  contactLimiter,
  passwordResetLimiter,
};
