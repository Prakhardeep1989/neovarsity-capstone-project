const { sendOrderReceiptEmail } = require("./emailService");

const markOrderAsPaid = async (order, { razorpayOrderId, razorpayPaymentId }) => {
  if (order.payment.status === "PAID") {
    return order;
  }

  order.status = "ORDERED";
  order.payment.status = "PAID";
  order.payment.razorpayOrderId = razorpayOrderId;
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.paidAt = new Date();
  await order.save();
  await sendOrderReceiptEmail(order);
  return order;
};

module.exports = { markOrderAsPaid };
