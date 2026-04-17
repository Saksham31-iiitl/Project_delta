import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const getMe = () => mockOr(() => api.get("/users/me"), () => ({ ...fixtures.mockAuthUser }));

export const updateMe = (body) =>
  mockOr(() => api.put("/users/me", body), () => ({ ...fixtures.mockAuthUser, ...body }));
