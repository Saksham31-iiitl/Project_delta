const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { generateOtp, sendOtp } = require("../services/otp.service");

async function sendOtpController(req, res) {
  const { phone } = req.body;
  const otp = generateOtp();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  const user = await User.findOneAndUpdate(
    { phone },
    { $set: { phone, otpCode: otp, otpExpiry: expiry }, $setOnInsert: { roles: ["guest"] } },
    { upsert: true, new: true }
  );
  await sendOtp(phone, otp);
  res.json({ ok: true, userId: user._id });
}

async function verifyOtpController(req, res) {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone });
  if (!user || user.otpCode !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  user.otpCode = undefined;
  user.otpExpiry = undefined;
  user.lastActiveAt = new Date();
  await user.save();
  const token = jwt.sign({ sub: user._id, roles: user.roles, phone: user.phone }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  return res.json({ token, user });
}

module.exports = { sendOtpController, verifyOtpController };
