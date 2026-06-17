const METHOD_LABELS = {
  card: "Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Wallet",
  emi: "EMI",
  paylater: "Pay Later",
};

const parseRazorpayPayment = (payment) => {
  if (!payment) {
    return { method: "Online", methodDetail: "Razorpay" };
  }

  const methodKey = payment.method || "";
  const method = METHOD_LABELS[methodKey] || methodKey || "Online";
  let methodDetail = "";

  if (methodKey === "upi" && payment.vpa) {
    methodDetail = payment.vpa;
  } else if (methodKey === "card" && payment.card) {
    const network = payment.card.network || "Card";
    const last4 = payment.card.last4 || "****";
    methodDetail = `${network} •••• ${last4}`;
  } else if (methodKey === "netbanking" && payment.bank) {
    methodDetail = payment.bank;
  } else if (methodKey === "wallet" && payment.wallet) {
    methodDetail = payment.wallet;
  }

  return { method, methodDetail };
};

const fetchRazorpayPaymentDetails = async (razorpay, paymentId) => {
  if (!razorpay || !paymentId) {
    return { method: "Online", methodDetail: "Razorpay" };
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return parseRazorpayPayment(payment);
  } catch (err) {
    console.warn("[RAZORPAY] Could not fetch payment details:", err.message);
    return { method: "Online", methodDetail: paymentId };
  }
};

module.exports = { parseRazorpayPayment, fetchRazorpayPaymentDetails };
