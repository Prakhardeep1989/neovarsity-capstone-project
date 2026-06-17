const { Resend } = require("resend");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildReceiptHtml = (order) => {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">₹${item.price}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">₹${item.itemTotal}</td>
        </tr>`
    )
    .join("");

  const address = [
    order.deliveryDetails?.addressLine1,
    order.deliveryDetails?.addressLine2,
    order.deliveryDetails?.city,
    order.deliveryDetails?.state,
    order.deliveryDetails?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h1 style="color:#dc2626;">HOMELY Meals</h1>
      <h2>Order Receipt</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Customer:</strong> ${order.userDetails?.name}</p>
      <p><strong>Email:</strong> ${order.userDetails?.email}</p>
      <p><strong>Delivery Address:</strong> ${address}</p>
      <p><strong>Order Status:</strong> ${order.status}</p>
      <p><strong>Payment Status:</strong> ${order.payment?.status}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px;text-align:left;">Item</th>
            <th style="padding:8px;text-align:left;">Qty</th>
            <th style="padding:8px;text-align:left;">Price</th>
            <th style="padding:8px;text-align:left;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="font-size:18px;"><strong>Total Amount: ₹${order.totalAmount}</strong></p>
      <p>Thank you for ordering from HOMELY Meals! Your homely meal is being prepared.</p>
    </div>
  `;
};

const sendOrderReceiptEmail = async (order) => {
  const to = order.userDetails?.email;
  const subject = `HOMELY Meals — Order Receipt #${String(order._id).slice(-8).toUpperCase()}`;
  const html = buildReceiptHtml(order);
  const from =
    process.env.FROM_EMAIL || "HOMELY Meals <homely_meals@resend.dev>";

  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] RESEND_API_KEY not configured.");
    console.log(`[EMAIL TODO] Receipt for order ${order._id} would be sent to ${to}`);
    console.log(`Subject: ${subject}`);
    return { sent: false, reason: "Email not configured" };
  }

  if (!to) {
    console.error("[EMAIL] No recipient email on order", order._id);
    return { sent: false, reason: "Missing recipient email" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      return { sent: false, reason: error.message || JSON.stringify(error) };
    }

    console.log(
      `[EMAIL] Receipt sent to ${to} for order ${order._id} (id: ${data.id})`
    );
    return { sent: true, id: data.id };
  } catch (err) {
    console.error("[EMAIL] Failed to send receipt:", err.message);
    return { sent: false, reason: err.message };
  }
};

const sendContactEmail = async ({ name, email, message }) => {
  const to = process.env.CONTACT_EMAIL || "coolprakhar06@gmail.com";
  const subject = `HOMELY Meals — Contact request from ${name}`;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h1 style="color:#dc2626;">HOMELY Meals</h1>
      <h2>Quick connect request</h2>
      <p>
        <strong>${safeName}</strong> (<a href="mailto:${safeEmail}">${safeEmail}</a>)
        needs a quick connect with respect to the message below:
      </p>
      <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0;line-height:1.5;">
        ${safeMessage}
      </div>
      <p style="color:#64748b;font-size:14px;">Reply directly to ${safeEmail} to follow up.</p>
    </div>
  `;
  const from =
    process.env.FROM_EMAIL || "HOMELY Meals <homely_meals@resend.dev>";

  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] RESEND_API_KEY not configured.");
    console.log(`[EMAIL TODO] Contact message from ${name} <${email}> would be sent to ${to}`);
    return { sent: false, reason: "Email not configured" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Resend contact error:", error);
      return { sent: false, reason: error.message || JSON.stringify(error) };
    }

    console.log(`[EMAIL] Contact message from ${email} sent to ${to} (id: ${data.id})`);
    return { sent: true, id: data.id };
  } catch (err) {
    console.error("[EMAIL] Failed to send contact message:", err.message);
    return { sent: false, reason: err.message };
  }
};

module.exports = { sendOrderReceiptEmail, buildReceiptHtml, sendContactEmail };
