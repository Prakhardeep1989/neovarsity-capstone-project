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

  if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
    console.log("[EMAIL] SENDGRID_API_KEY or FROM_EMAIL not configured.");
    console.log(`[EMAIL TODO] Receipt for order ${order._id} would be sent to ${to}`);
    console.log(`Subject: ${subject}`);
    return { sent: false, reason: "Email not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.FROM_EMAIL, name: "HOMELY Meals" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[EMAIL] SendGrid error:", errText);
      return { sent: false, reason: errText };
    }

    console.log(`[EMAIL] Receipt sent to ${to} for order ${order._id}`);
    return { sent: true };
  } catch (err) {
    console.error("[EMAIL] Failed to send receipt:", err.message);
    return { sent: false, reason: err.message };
  }
};

module.exports = { sendOrderReceiptEmail, buildReceiptHtml };
