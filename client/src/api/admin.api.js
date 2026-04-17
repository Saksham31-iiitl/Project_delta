import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const pendingListings = () =>
  mockOr(() => api.get("/admin/listings/pending"), () => fixtures.mockAdminPending());

export const approveListing = (id) =>
  mockOr(() => api.put(`/admin/listings/${id}/approve`), () => ({ _id: id, status: "active" }));

export const rejectListing = (id) =>
  mockOr(() => api.put(`/admin/listings/${id}/reject`), () => ({ _id: id, status: "rejected" }));

export const pendingKyc = () => mockOr(() => api.get("/admin/kyc/pending"), () => []);

export const adminAnalytics = () =>
  mockOr(() => api.get("/admin/analytics"), () => ({ listings: 12, bookings: 48, revenue: 125000 }));
