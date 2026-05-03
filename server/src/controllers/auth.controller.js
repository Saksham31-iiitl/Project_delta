const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { generateOtp, sendOtp } = require("../services/otp.service");

async function sendOtpController(req, res) {
  const { email } = req.body;
  const otp = generateOtp();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { email, otpCode: otp, otpExpiry: expiry }, $setOnInsert: { roles: ["guest"] } },
    { upsert: true, new: true }
  );

  await sendOtp({ email, otp });
  res.json({ ok: true, userId: user._id });
}

async function verifyOtpController(req, res) {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otpCode !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.otpCode = undefined;
  user.otpExpiry = undefined;
  user.lastActiveAt = new Date();
  await user.save();

  const token = jwt.sign(
    { sub: user._id, roles: user.roles, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const isProd = env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  return res.json({ token, user });
}

module.exports = { sendOtpController, verifyOtpController };
