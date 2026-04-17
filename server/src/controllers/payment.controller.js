const Booking = require("../models/Booking");
const { verifySignature } = require("../services/payment.service");

async function verifyPayment(req, res) {
  const valid = verifySignature(req.body);
  if (!valid) return res.status(400).json({ message: "Invalid signature" });
  res.json({ ok: true });
}

async function webhook(req, res) {
  res.json({ received: true });
}

async function hostPayouts(req, res) {
  const payouts = await Booking.find({ hostId: req.user.sub, status: "completed" }).select(
    "hostPayout updatedAt"
  );
  res.json(payouts);
}

module.exports = { verifyPayment, webhook, hostPayouts };
