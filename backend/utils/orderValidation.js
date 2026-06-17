const mongoose = require("mongoose");

const PHONE_REGEX = /^[6-9]\d{9}$/;

const ADMIN_ORDER_STATUSES = [
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const validateDeliveryDetails = (deliveryDetails) => {
  const errors = [];
  const { fullName, phone, addressLine1 } = deliveryDetails || {};

  if (!fullName?.trim()) errors.push("Full name is required");
  if (!phone?.trim() || !PHONE_REGEX.test(phone.trim())) {
    errors.push("Valid 10-digit contact number is required");
  }
  if (!addressLine1?.trim() || addressLine1.trim().length < 10) {
    errors.push("Delivery address must be at least 10 characters");
  }

  return { errors };
};

const validateCartItems = (items) => {
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Cart must contain at least one item");
    return { errors, sanitized: [] };
  }

  const sanitized = [];
  for (const item of items) {
    const productId = item.productId || item._id;
    const quantity = Number(item.quantity ?? item.qty);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      errors.push("Invalid product ID in cart");
      continue;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push("Each item must have quantity of at least 1");
      continue;
    }

    sanitized.push({ productId, quantity });
  }

  return { errors, sanitized };
};

const validateAdminStatusUpdate = (status) => {
  if (!ADMIN_ORDER_STATUSES.includes(status)) {
    return {
      valid: false,
      message: `Status must be one of: ${ADMIN_ORDER_STATUSES.join(", ")}`,
    };
  }
  return { valid: true };
};

module.exports = {
  validateDeliveryDetails,
  validateCartItems,
  validateAdminStatusUpdate,
  ADMIN_ORDER_STATUSES,
};
