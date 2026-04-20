const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { calculatePlatformFee } = require("../utils/feeCalculator");
const { createOrder, verifySignature } = require("../services/payment.service");
const { transitionBooking } = require("../services/booking.service");

async function createBooking(req, res) {
  const listing = await Listing.findById(req.body.listingId);
  if (!listing || listing.status !== "active") return res.status(400).json({ message: "Invalid listing" });
  const nights = Math.max(1, Math.ceil((new Date(req.body.checkOut) - new Date(req.body.checkIn)) / 86400000));
  const totalAmount = listing.pricePerNight * nights;
  const platformFee = calculatePlatformFee(totalAmount, listing.type);
  const hostPayout = totalAmount - platformFee;
  const isUpi = req.body.paymentMethod === "upi";
  const order = isUpi ? null : await createOrder({ amount: totalAmount, receipt: `book_${Date.now()}` });
  const booking = await Booking.create({
    listingId: listing._id,
    guestId: req.user.sub,
    hostId: listing.hostId,
    eventId: req.body.eventId ?? null,
    checkIn: new Date(req.body.checkIn),
    checkOut: new Date(req.body.checkOut),
    guestsCount: req.body.guestsCount,
    totalAmount,
    platformFee,
    hostPayout,
    paymentOrderId: isUpi ? "upi_pending" : order.id,
    hostResponseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  res.status(201).json({ booking, order });
}

async function verifyPayment(req, res) {
  const { orderId, paymentId, signature, bookingId } = req.body;
  const valid = verifySignature({ orderId, paymentId, signature });
  if (!valid) return res.status(400).json({ message: "Invalid signature" });
  const booking = await Booking.findByIdAndUpdate(bookingId, { paymentId }, { new: true });
  return res.json({ ok: true, booking });
}

async function confirmBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking || `${booking.hostId}` !== req.user.sub) return res.status(404).json({ message: "Not found" });
  const updated = await transitionBooking(booking._id, "confirmed", "host");
  res.json(updated);
}

async function declineBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking || `${booking.hostId}` !== req.user.sub) return res.status(404).json({ message: "Not found" });
  const updated = await transitionBooking(booking._id, "cancelled", "host");
  res.json(updated);
}

async function cancelBooking(req, res) {
  const updated = await transitionBooking(req.params.id, "cancelled", "guest");
  res.json(updated);
}

async function checkOut(req, res) {
  const updated = await transitionBooking(req.params.id, "completed", "guest");
  res.json(updated);
}

async function myBookings(req, res) {
  const bookings = await Booking.find({ guestId: req.user.sub }).sort({ createdAt: -1 });
  res.json(bookings);
}

async function hostBookings(req, res) {
  const bookings = await Booking.find({ hostId: req.user.sub }).sort({ createdAt: -1 });
  res.json(bookings);
}

module.exports = {
  createBooking,
  verifyPayment,
  confirmBooking,
  declineBooking,
  cancelBooking,
  checkOut,
  myBookings,
  hostBookings,
};
