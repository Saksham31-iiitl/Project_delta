import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const getMe = () => mockOr(() => api.get("/users/me"), () => ({ ...fixtures.mockAuthUser }));

export const updateMe = (body) =>
  mockOr(() => api.put("/users/me", body), () => ({ ...fixtures.mockAuthUser, ...body }));

export const submitKyc = (file) => {
  const form = new FormData();
  form.append("aadhaar", file);
  return mockOr(
    () => api.post("/users/me/kyc", form, { headers: { "Content-Type": "multipart/form-data" } }),
    () => ({ ok: true, kycStatus: "pending" })
  );
};
