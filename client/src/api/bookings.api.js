import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const createBooking = (body) =>
  mockOr(() => api.post("/bookings", body), () => fixtures.mockCreateBooking(body));

export const verifyBookingPayment = (body) =>
  mockOr(() => api.post("/bookings/verify", body), () => ({ ok: true, booking: { _id: body.bookingId, paymentId: body.paymentId } }));

export const confirmBooking = (id) =>
  mockOr(() => api.put(`/bookings/${id}/confirm`), () => ({ _id: id, status: "confirmed" }));

export const declineBooking = (id) =>
  mockOr(() => api.put(`/bookings/${id}/decline`), () => ({ _id: id, status: "cancelled" }));

export const cancelBooking = (id) =>
  mockOr(() => api.put(`/bookings/${id}/cancel`), () => ({ _id: id, status: "cancelled" }));

export const checkoutBooking = (id) =>
  mockOr(() => api.put(`/bookings/${id}/checkout`), () => ({ _id: id, status: "completed" }));

export const myBookings = () => mockOr(() => api.get("/bookings/my-bookings"), () => fixtures.mockMyBookings());

export const hostBookings = () => mockOr(() => api.get("/bookings/host-bookings"), () => fixtures.mockHostBookings());
