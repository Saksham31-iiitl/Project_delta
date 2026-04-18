const { z } = require("zod");

const sendOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const verifyOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

module.exports = { sendOtpSchema, verifyOtpSchema };
