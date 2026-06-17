const { sendOrderReceiptEmail } = require("../services/emailService");

const createPaymentController = ({ orderModel, stripe }) => {
  const handleStripeWebhook = async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (webhookSecret) {
        const signature = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      } else {
        event = JSON.parse(req.body.toString());
        console.warn("[STRIPE] STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev only)");
      }
    } catch (err) {
      console.error("[STRIPE] Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("[STRIPE] No orderId in session metadata");
        return res.json({ received: true });
      }

      try {
        const order = await orderModel.findById(orderId);
        if (!order) {
          console.error("[STRIPE] Order not found:", orderId);
          return res.json({ received: true });
        }

        if (order.payment.status === "PAID") {
          return res.json({ received: true });
        }

        order.status = "ORDERED";
        order.payment.status = "PAID";
        order.payment.stripeSessionId = session.id;
        order.payment.stripePaymentIntentId = session.payment_intent;
        order.payment.amount = session.amount_total / 100;
        order.payment.currency = session.currency;
        order.payment.paidAt = new Date();
        order.payment.receiptUrl = session.receipt_url || "";

        await order.save();
        await sendOrderReceiptEmail(order);

        console.log(`[STRIPE] Order ${orderId} marked as ORDERED/PAID`);
      } catch (err) {
        console.error("[STRIPE] Failed to update order:", err.message);
      }
    }

    if (event.type === "checkout.session.expired") {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) {
        await orderModel.findByIdAndUpdate(orderId, {
          "payment.status": "FAILED",
        });
      }
    }

    res.json({ received: true });
  };

  return { handleStripeWebhook };
};

module.exports = createPaymentController;
