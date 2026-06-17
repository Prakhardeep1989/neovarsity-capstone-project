const crypto = require("crypto");

const WEBHOOK_HANDLED_EVENTS = ["payment.captured", "payment.failed", "order.paid"];

// Registered via Razorpay API / dashboard (POST /v1/webhooks expects boolean map)
const WEBHOOK_API_EVENTS = ["payment.captured", "payment.failed", "order.paid"];

const toWebhookEventsPayload = (eventNames) =>
  Object.fromEntries(eventNames.map((name) => [name, true]));

const formatWebhookEvents = (events) => {
  if (Array.isArray(events)) return events.join(", ");
  return Object.entries(events)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
    .join(", ");
};

const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { valid: false, reason: "RAZORPAY_WEBHOOK_SECRET is not configured" };
    }
    console.warn(
      "[RAZORPAY] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification (dev only)"
    );
    return { valid: true, skipped: true };
  }

  if (!signature) {
    return { valid: false, reason: "Missing x-razorpay-signature header" };
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return { valid: false, reason: "Invalid webhook signature" };
  }

  return { valid: true };
};

const parseWebhookBody = (rawBody) => {
  const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString() : rawBody;
  return typeof bodyString === "string" ? JSON.parse(bodyString) : bodyString;
};

const findOrderForPayment = async (orderModel, { mongoOrderId, razorpayOrderId }) => {
  if (mongoOrderId) {
    const byId = await orderModel.findById(mongoOrderId);
    if (byId) return byId;
  }

  if (razorpayOrderId) {
    return orderModel.findOne({ "payment.razorpayOrderId": razorpayOrderId });
  }

  return null;
};

module.exports = {
  WEBHOOK_HANDLED_EVENTS,
  WEBHOOK_API_EVENTS,
  WEBHOOK_EVENTS: WEBHOOK_API_EVENTS,
  toWebhookEventsPayload,
  formatWebhookEvents,
  verifyWebhookSignature,
  parseWebhookBody,
  findOrderForPayment,
};
