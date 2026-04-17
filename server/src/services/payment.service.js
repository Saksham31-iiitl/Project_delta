const Razorpay = require("razorpay");
const crypto = require("crypto");
const { env } = require("../config/env");

const razorpay =
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
    : null;

async function createOrder({ amount, receipt }) {
  if (!razorpay) return { id: `mock_order_${Date.now()}`, amount };
  return razorpay.orders.create({ amount, currency: "INR", receipt, payment_capture: 1 });
}

function verifySignature({ orderId, paymentId, signature, webhookSecret }) {
  const expected = crypto
    .createHmac("sha256", webhookSecret || env.RAZORPAY_KEY_SECRET || "dev")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

module.exports = { createOrder, verifySignature };
