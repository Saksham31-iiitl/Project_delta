import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const sendOtp = (phone) =>
  mockOr(() => api.post("/auth/send-otp", { phone }), () => ({ ok: true, userId: fixtures.IDS.guest }));

export const verifyOtp = (phone, otp) =>
  mockOr(
    () => api.post("/auth/verify-otp", { phone, otp }),
    () => ({
      token: "mock.jwt.token.demo",
      user: { ...fixtures.mockAuthUser, phone: phone || fixtures.mockAuthUser.phone },
    })
  );
