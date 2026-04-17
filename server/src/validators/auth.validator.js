const { z } = require("zod");

const sendOtpSchema = z.object({
  phone: z.string().min(10),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
});

module.exports = { sendOtpSchema, verifyOtpSchema };
