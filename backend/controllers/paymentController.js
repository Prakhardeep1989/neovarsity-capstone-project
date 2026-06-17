const crypto = require("crypto");
const { markOrderAsPaid } = require("../services/paymentHelper");
const { processRazorpayWebhook } = require("../services/razorpayWebhookService");
const {
  verifyWebhookSignature,
  parseWebhookBody,
} = require("../utils/razorpayWebhook");
const { fetchRazorpayPaymentDetails } = require("../utils/razorpayPaymentDetails");

const createPaymentController = ({ orderModel, razorpay }) => {
  const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  };

  const verifyPayment = async (req, res) => {
    try {
      const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (
        !orderId ||
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          message: "Missing payment verification details",
          alert: false,
        });
      }

      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found", alert: false });
      }

      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied", alert: false });
      }

      if (order.payment.razorpayOrderId !== razorpay_order_id) {
        return res.status(400).json({
          message: "Razorpay order ID mismatch",
          alert: false,
        });
      }

      const isValid = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        order.payment.status = "FAILED";
        await order.save();
        return res.status(400).json({
          message: "Invalid payment signature",
          alert: false,
        });
      }

      const paymentDetails = await fetchRazorpayPaymentDetails(
        razorpay,
        razorpay_payment_id
      );

      await markOrderAsPaid(order, {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        ...paymentDetails,
      });

      res.json({
        message: "Payment verified successfully",
        alert: true,
        orderId: order._id,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message || "Payment verification failed",
        alert: false,
      });
    }
  };

  const handleRazorpayWebhook = async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const rawBody = req.body;

      const verification = verifyWebhookSignature(rawBody, signature);
      if (!verification.valid) {
        console.error("[RAZORPAY] Webhook rejected:", verification.reason);
        return res.status(400).json({ message: verification.reason });
      }

      const eventBody = parseWebhookBody(rawBody);
      const result = await processRazorpayWebhook(orderModel, eventBody);

      res.json({ received: true, ...result });
    } catch (err) {
      console.error("[RAZORPAY] Webhook error:", err.message);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  };

  return { verifyPayment, handleRazorpayWebhook };
};

module.exports = createPaymentController;
