const { z } = require("zod");

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/nearbystay"),
  JWT_SECRET: z.string().default("dev-secret"),
  JWT_EXPIRES_IN: z.string().default("30d"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

const env = envSchema.parse(process.env);

module.exports = { env };
