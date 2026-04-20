import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const searchListings = (params) =>
  mockOr(() => api.get("/listings/search", { params }), () => fixtures.mockSearchListings());

export const getListingDetail = (id) =>
  mockOr(() => api.get(`/listings/detail/${id}`), () => fixtures.mockListingById(id));

export const createListing = (body) =>
  mockOr(() => api.post("/listings", body), () => fixtures.mockCreateListing(body));

export const myListings = () => mockOr(() => api.get("/listings/my-listings"), () => fixtures.mockMyListings());

export const updateListing = (id, body) =>
  mockOr(() => api.put(`/listings/${id}`, body), () => ({ ...fixtures.mockListingById(id), ...body }));

export const updateListingStatus = (id, status) =>
  mockOr(() => api.put(`/listings/${id}/status`, { status }), () => ({ ...fixtures.mockListingById(id), status }));

export const uploadListingPhotos = (files) => {
  const fd = new FormData();
  files.forEach((f) => fd.append("photos", f));
  return api.post("/listings/upload-photos", fd, { headers: { "Content-Type": "multipart/form-data" } });
};
