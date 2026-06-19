const { Resend } = require("resend");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getFromAddress = () =>
  process.env.FROM_EMAIL || "HOMELY Meals <homely_meals@resend.dev>";

const isResendSandbox = () => getFromAddress().includes("@resend.dev");

const getSandboxRecipient = () =>
  process.env.RESEND_SANDBOX_EMAIL || process.env.CONTACT_EMAIL || null;

const resolveRecipient = (intendedTo) => {
  if (!intendedTo) {
    return { to: null, sandboxRedirect: false };
  }

  if (!isResendSandbox()) {
    return { to: intendedTo, sandboxRedirect: false };
  }

  const sandboxTo = getSandboxRecipient();
  if (!sandboxTo) {
    return { to: intendedTo, sandboxRedirect: false };
  }

  if (intendedTo.toLowerCase() === sandboxTo.toLowerCase()) {
    return { to: sandboxTo, sandboxRedirect: false };
  }

  return { to: sandboxTo, sandboxRedirect: true, intendedTo };
};

const sandboxNoticeHtml = (intendedTo) => `
  <div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px;border-radius:8px;margin-bottom:16px;font-size:14px;">
    <strong>Resend sandbox:</strong> This email was delivered to you because test mode only allows sending to
    <strong>${escapeHtml(getSandboxRecipient())}</strong>.
    In production it would go to <strong>${escapeHtml(intendedTo)}</strong>.
  </div>
`;

const sendEmail = async ({ to, subject, html, replyTo }) => {
  const { to: resolvedTo, sandboxRedirect, intendedTo } = resolveRecipient(to);

  if (!resolvedTo) {
    return { sent: false, reason: "Missing recipient email" };
  }

  const finalHtml = sandboxRedirect
    ? `${sandboxNoticeHtml(intendedTo)}${html}`
    : html;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const payload = {
    from: getFromAddress(),
    to: [resolvedTo],
    subject: sandboxRedirect ? `[Sandbox] ${subject}` : subject,
    html: finalHtml,
  };

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    console.error("[EMAIL] Resend error:", error);
    return { sent: false, reason: error.message || JSON.stringify(error) };
  }

  if (sandboxRedirect) {
    console.log(
      `[EMAIL] Sandbox redirect: "${subject}" sent to ${resolvedTo} (intended: ${intendedTo}, id: ${data.id})`
    );
  }

  return { sent: true, id: data.id, sandboxRedirect, intendedTo: intendedTo || resolvedTo };
};

const formatReceiptDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const buildReceiptHtml = (order) => {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
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

  const payment = order.payment || {};
  const paymentMode = payment.method || "Online";
  const paymentDetail = payment.methodDetail || "";
  const currency = payment.currency || "INR";
  const amountPaid = payment.amount ?? order.totalAmount;
  const orderDate = formatReceiptDate(order.createdAt);
  const paidOn = formatReceiptDate(payment.paidAt);

  const infoRow = (label, value) =>
    value
      ? `<tr>
          <td style="padding:8px 12px 8px 0;color:#64748b;vertical-align:top;width:140px;">${label}</td>
          <td style="padding:8px 0;font-weight:600;">${escapeHtml(String(value))}</td>
        </tr>`
      : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h1 style="color:#dc2626;margin-bottom:4px;">HOMELY Meals</h1>
      <p style="color:#64748b;margin-top:0;">Order Receipt</p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
        <h3 style="margin:0 0 12px;color:#334155;">Order Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${infoRow("Order ID", order._id)}
          ${infoRow("Order Date", orderDate)}
          ${infoRow("Order Status", order.status)}
          ${infoRow("Customer", order.userDetails?.name)}
          ${infoRow("Email", order.userDetails?.email)}
          ${infoRow("Phone", order.deliveryDetails?.phone || order.userDetails?.phone)}
          ${infoRow("Delivery Address", address)}
        </table>
      </div>

      <div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
        <h3 style="margin:0 0 12px;color:#166534;">Payment Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${infoRow("Payment Status", payment.status || "PAID")}
          ${infoRow("Payment Gateway", payment.provider || "RAZORPAY")}
          ${infoRow("Payment Mode", paymentMode)}
          ${infoRow("Payment Info", paymentDetail)}
          ${infoRow("Amount Paid", `₹${amountPaid} (${currency})`)}
          ${infoRow("Paid On", paidOn)}
          ${infoRow("Transaction ID", payment.razorpayPaymentId)}
          ${infoRow("Razorpay Order ID", payment.razorpayOrderId)}
        </table>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
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
      <p style="color:#64748b;font-size:14px;">Thank you for ordering from HOMELY Meals! Your homely meal is being prepared.</p>
    </div>
  `;
};

const sendOrderReceiptEmail = async (order) => {
  const to = order.userDetails?.email;
  const subject = `HOMELY Meals — Order Receipt #${String(order._id).slice(-8).toUpperCase()}`;
  const html = buildReceiptHtml(order);

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
    const result = await sendEmail({ to, subject, html });

    if (result.sent) {
      console.log(
        `[EMAIL] Receipt sent for order ${order._id} (id: ${result.id})`
      );
    }

    return result;
  } catch (err) {
    console.error("[EMAIL] Failed to send receipt:", err.message);
    return { sent: false, reason: err.message };
  }
};

const sendContactEmail = async ({ name, email, message }) => {
  const to = process.env.CONTACT_EMAIL;
  if (!to) {
    console.log("[EMAIL] CONTACT_EMAIL not configured.");
    return { sent: false, reason: "Contact email not configured" };
  }
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

  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] RESEND_API_KEY not configured.");
    console.log(`[EMAIL TODO] Contact message from ${name} <${email}> would be sent to ${to}`);
    return { sent: false, reason: "Email not configured" };
  }

  try {
    const result = await sendEmail({ to, subject, html, replyTo: email });

    if (result.sent) {
      console.log(
        `[EMAIL] Contact message from ${email} sent to ${result.intendedTo || to} (id: ${result.id})`
      );
    }

    return result;
  } catch (err) {
    console.error("[EMAIL] Failed to send contact message:", err.message);
    return { sent: false, reason: err.message };
  }
};

const buildPasswordResetHtml = ({ firstName, resetUrl }) => {
  const safeName = escapeHtml(firstName || "there");
  const safeUrl = escapeHtml(resetUrl);

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h1 style="color:#dc2626;margin-bottom:4px;">HOMELY Meals</h1>
      <p style="color:#64748b;margin-top:0;">Password reset request</p>
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your password. Click the button below to choose a new password. This link expires in 1 hour.</p>
      <p style="margin:24px 0;">
        <a href="${safeUrl}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600;display:inline-block;">
          Reset password
        </a>
      </p>
      <p style="color:#64748b;font-size:14px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
      <p style="color:#64748b;font-size:12px;word-break:break-all;">Or copy this link: ${safeUrl}</p>
    </div>
  `;
};

const sendPasswordResetEmail = async ({ email, firstName, resetToken }) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = "HOMELY Meals — Reset your password";
  const html = buildPasswordResetHtml({ firstName, resetUrl });

  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] RESEND_API_KEY not configured.");
    console.log(`[EMAIL TODO] Password reset for ${email}: ${resetUrl}`);
    return { sent: false, reason: "Email not configured", resetUrl };
  }

  try {
    const result = await sendEmail({ to: email, subject, html });

    if (result.sent) {
      console.log(`[EMAIL] Password reset sent to ${email} (id: ${result.id})`);
    }

    return result;
  } catch (err) {
    console.error("[EMAIL] Failed to send password reset:", err.message);
    return { sent: false, reason: err.message };
  }
};

module.exports = {
  sendOrderReceiptEmail,
  buildReceiptHtml,
  sendContactEmail,
  sendPasswordResetEmail,
};
