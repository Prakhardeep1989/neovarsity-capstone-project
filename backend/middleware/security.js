const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

const sanitizeInput = mongoSanitize({
  replaceWith: "_",
});

module.exports = securityHeaders;
module.exports.sanitizeInput = sanitizeInput;
