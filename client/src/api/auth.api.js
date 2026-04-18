import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const sendOtp = (email) =>
  mockOr(
    () => api.post("/auth/send-otp", { email }),
    () => ({ ok: true, userId: fixtures.IDS.guest })
  );

export const verifyOtp = (email, otp) =>
  mockOr(
    () => api.post("/auth/verify-otp", { email, otp }),
    () => ({
      token: "mock.jwt.token.demo",
      user: { ...fixtures.mockAuthUser, email: email || fixtures.mockAuthUser.email },
    })
  );
