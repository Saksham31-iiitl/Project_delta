const express = require("express");
const { sendOtpController, verifyOtpController } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate");
const { sendOtpSchema, verifyOtpSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/send-otp", validate(sendOtpSchema), sendOtpController);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpController);

module.exports = router;
