const { sendOrderReceiptEmail } = require("./emailService");

const markOrderAsPaid = async (
  order,
  { razorpayOrderId, razorpayPaymentId, method, methodDetail }
) => {
  if (order.payment.status === "PAID") {
    return order;
  }

  order.status = "ORDERED";
  order.payment.status = "PAID";
  order.payment.razorpayOrderId = razorpayOrderId;
  order.payment.razorpayPaymentId = razorpayPaymentId;
  if (method) order.payment.method = method;
  if (methodDetail) order.payment.methodDetail = methodDetail;
  order.payment.paidAt = new Date();
  await order.save();
  await sendOrderReceiptEmail(order);
  return order;
};

module.exports = { markOrderAsPaid };
