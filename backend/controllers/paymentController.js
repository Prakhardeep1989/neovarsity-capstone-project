const crypto = require("crypto");
const { markOrderAsPaid } = require("../services/paymentHelper");

const createPaymentController = ({ orderModel }) => {
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

      await markOrderAsPaid(order, {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
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
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"];
      const rawBody = req.body;

      if (webhookSecret && signature) {
        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(rawBody)
          .digest("hex");

        if (expectedSignature !== signature) {
          console.error("[RAZORPAY] Webhook signature mismatch");
          return res.status(400).json({ message: "Invalid webhook signature" });
        }
      } else if (!webhookSecret) {
        console.warn(
          "[RAZORPAY] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification (dev only)"
        );
      }

      const eventBody =
        Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString()) : req.body;
      const event = eventBody?.event;

      if (event === "payment.captured") {
        const payment = eventBody.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        const razorpayPaymentId = payment?.id;
        const mongoOrderId = payment?.notes?.orderId;

        let order = mongoOrderId
          ? await orderModel.findById(mongoOrderId)
          : await orderModel.findOne({ "payment.razorpayOrderId": razorpayOrderId });

        if (order && order.payment.status !== "PAID") {
          await markOrderAsPaid(order, { razorpayOrderId, razorpayPaymentId });
          console.log(`[RAZORPAY] Order ${order._id} marked as ORDERED/PAID via webhook`);
        }
      }

      if (event === "payment.failed") {
        const payment = eventBody.payload?.payment?.entity;
        const mongoOrderId = payment?.notes?.orderId;
        if (mongoOrderId) {
          await orderModel.findByIdAndUpdate(mongoOrderId, {
            "payment.status": "FAILED",
          });
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("[RAZORPAY] Webhook error:", err.message);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  };

  return { verifyPayment, handleRazorpayWebhook };
};

module.exports = createPaymentController;
