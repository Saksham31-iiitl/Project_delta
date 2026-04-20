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

export const approveKyc = (userId) =>
  mockOr(() => api.put(`/admin/kyc/${userId}/approve`), () => ({ ok: true, kycStatus: "verified" }));

export const rejectKyc = (userId) =>
  mockOr(() => api.put(`/admin/kyc/${userId}/reject`), () => ({ ok: true, kycStatus: "rejected" }));

export const adminAnalytics = () =>
  mockOr(() => api.get("/admin/analytics"), () => ({ listings: 12, bookings: 48, revenue: 125000 }));

export const getAllUsers = () =>
  mockOr(() => api.get("/admin/users"), () => []);

export const searchUser = (email) =>
  mockOr(() => api.get("/admin/users/search", { params: { email } }), () => null);

export const setUserRoles = (id, roles) =>
  mockOr(() => api.put(`/admin/users/${id}/roles`, { roles }), () => ({ _id: id, roles }));

export const reGeocodeListing = (id) => api.post(`/admin/listings/${id}/geocode`);
export const reGeocodeAll     = ()   => api.post("/admin/listings/geocode-all");

export const getAllListings = () =>
  mockOr(() => api.get("/admin/listings/all"), () => []);

export const deleteListing = (id) =>
  mockOr(() => api.delete(`/admin/listings/${id}`), () => ({ ok: true }));
