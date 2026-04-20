import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const verifyPaymentOnly = (body) =>
  mockOr(() => api.post("/payments/verify", body), () => ({ ok: true }));

export const hostPayouts = () =>
  mockOr(() => api.get("/payments/host-payouts"), () => [{ id: "p1", amount: 4500, status: "processed" }]);

export const confirmUpiPayment = (body) =>
  mockOr(() => api.post("/payments/upi-confirm", body), () => ({ ok: true }));
