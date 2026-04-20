const express = require("express");
const { verifyPayment, webhook, hostPayouts, upiConfirm } = require("../controllers/payment.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
router.post("/verify", verifyPayment);
router.post("/webhook", webhook);
router.get("/host-payouts", authMiddleware, hostPayouts);
router.post("/upi-confirm", authMiddleware, upiConfirm);

module.exports = router;
