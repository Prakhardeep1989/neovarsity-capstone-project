const { markOrderAsPaid } = require("./paymentHelper");
const { parseRazorpayPayment } = require("../utils/razorpayPaymentDetails");
const { findOrderForPayment } = require("../utils/razorpayWebhook");

const handlePaymentCaptured = async (orderModel, payment) => {
  const razorpayOrderId = payment?.order_id;
  const razorpayPaymentId = payment?.id;
  const mongoOrderId = payment?.notes?.orderId;

  const order = await findOrderForPayment(orderModel, {
    mongoOrderId,
    razorpayOrderId,
  });

  if (!order) {
    console.warn(
      `[RAZORPAY] payment.captured: no order for razorpay order ${razorpayOrderId}`
    );
    return { handled: false, reason: "order_not_found" };
  }

  if (order.payment.status === "PAID") {
    return { handled: true, reason: "already_paid", orderId: order._id };
  }

  const paymentDetails = parseRazorpayPayment(payment);
  await markOrderAsPaid(order, {
    razorpayOrderId,
    razorpayPaymentId,
    ...paymentDetails,
  });

  console.log(`[RAZORPAY] Order ${order._id} marked ORDERED/PAID via webhook`);
  return { handled: true, orderId: order._id };
};

const handleOrderPaid = async (orderModel, orderEntity, paymentEntity) => {
  const razorpayOrderId = orderEntity?.id;
  const mongoOrderId = orderEntity?.notes?.orderId;

  const order = await findOrderForPayment(orderModel, {
    mongoOrderId,
    razorpayOrderId,
  });

  if (!order) {
    console.warn(
      `[RAZORPAY] order.paid: no order for razorpay order ${razorpayOrderId}`
    );
    return { handled: false, reason: "order_not_found" };
  }

  if (order.payment.status === "PAID") {
    return { handled: true, reason: "already_paid", orderId: order._id };
  }

  const razorpayPaymentId =
    paymentEntity?.id || orderEntity?.payment_id || order.payment.razorpayPaymentId;
  const paymentDetails = paymentEntity
    ? parseRazorpayPayment(paymentEntity)
    : { method: "Online", methodDetail: "Razorpay" };

  await markOrderAsPaid(order, {
    razorpayOrderId,
    razorpayPaymentId,
    ...paymentDetails,
  });

  console.log(`[RAZORPAY] Order ${order._id} marked ORDERED/PAID via order.paid webhook`);
  return { handled: true, orderId: order._id };
};

const handlePaymentFailed = async (orderModel, payment) => {
  const razorpayOrderId = payment?.order_id;
  const mongoOrderId = payment?.notes?.orderId;

  const order = await findOrderForPayment(orderModel, {
    mongoOrderId,
    razorpayOrderId,
  });

  if (!order) {
    console.warn(
      `[RAZORPAY] payment.failed: no order for razorpay order ${razorpayOrderId}`
    );
    return { handled: false, reason: "order_not_found" };
  }

  if (order.payment.status === "PAID") {
    return { handled: true, reason: "already_paid", orderId: order._id };
  }

  order.payment.status = "FAILED";
  await order.save();

  console.log(`[RAZORPAY] Order ${order._id} payment marked FAILED via webhook`);
  return { handled: true, orderId: order._id };
};

const processRazorpayWebhook = async (orderModel, eventBody) => {
  const event = eventBody?.event;

  switch (event) {
    case "payment.captured":
      return handlePaymentCaptured(
        orderModel,
        eventBody.payload?.payment?.entity
      );
    case "order.paid":
      return handleOrderPaid(
        orderModel,
        eventBody.payload?.order?.entity,
        eventBody.payload?.payment?.entity
      );
    case "payment.failed":
      return handlePaymentFailed(
        orderModel,
        eventBody.payload?.payment?.entity
      );
    default:
      console.log(`[RAZORPAY] Webhook event ignored: ${event || "unknown"}`);
      return { handled: false, reason: "ignored_event" };
  }
};

module.exports = { processRazorpayWebhook };
