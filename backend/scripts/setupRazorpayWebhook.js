require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const {
  WEBHOOK_API_EVENTS,
  toWebhookEventsPayload,
  formatWebhookEvents,
} = require("../utils/razorpayWebhook");

const printManualSteps = (url, secret) => {
  console.log("\n--- Manual setup (Razorpay Dashboard) ---");
  console.log("1. Open https://dashboard.razorpay.com/app/webhooks (Test Mode)");
  console.log("2. Click + Add New Webhook");
  console.log(`3. Webhook URL: ${url}`);
  console.log(`4. Secret: ${secret}`);
  console.log(`5. Active Events: ${WEBHOOK_API_EVENTS.join(", ")}`);
  console.log("6. Save — use the same secret in backend/.env as RAZORPAY_WEBHOOK_SECRET");
  console.log("7. Restart the backend and keep ngrok running on port 8080");
};

const main = async () => {
  const url = process.env.WEBHOOK_URL;
  let secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env");
    process.exit(1);
  }

  if (!url) {
    console.error(
      "Set WEBHOOK_URL in backend/.env\n" +
        "  Example: https://very-stiffly-datebook.ngrok-free.dev/api/payments/razorpay/webhook"
    );
    process.exit(1);
  }

  if (!secret) {
    secret = crypto.randomBytes(24).toString("hex");
    console.log(`Generated RAZORPAY_WEBHOOK_SECRET=${secret}`);
    console.log("Add it to backend/.env before continuing.\n");
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const payload = {
    url,
    secret,
    events: toWebhookEventsPayload(WEBHOOK_API_EVENTS),
  };

  if (process.env.CONTACT_EMAIL) {
    payload.alert_email = process.env.CONTACT_EMAIL;
  }

  try {
    const { items = [] } = await razorpay.webhooks.all();
    const existing = items.find((webhook) => webhook.url === url);

    const result = existing
      ? await razorpay.webhooks.edit(payload, existing.id)
      : await razorpay.webhooks.create(payload);

    console.log(`${existing ? "Updated" : "Created"} Razorpay webhook (${result.id})`);
    console.log(`URL:    ${result.url}`);
    console.log(`Events: ${formatWebhookEvents(result.events)}`);
  } catch (err) {
    console.warn(
      "API registration failed:",
      err.error?.description || err.message
    );
    console.warn("Use the Razorpay Dashboard instead:");
    printManualSteps(url, secret);
    process.exit(1);
  }

  console.log("\nbackend/.env should contain:");
  console.log(`WEBHOOK_URL=${url}`);
  console.log(`RAZORPAY_WEBHOOK_SECRET=${secret}`);
  console.log("\nRestart the backend after updating .env.");
};

main().catch((err) => {
  console.error("Webhook setup failed:", err.error?.description || err.message);
  process.exit(1);
});
