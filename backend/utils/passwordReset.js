const crypto = require("crypto");

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateResetToken = () => {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  return {
    token,
    hashedToken: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
  };
};

module.exports = {
  hashResetToken,
  generateResetToken,
  RESET_TOKEN_EXPIRY_MS,
};
