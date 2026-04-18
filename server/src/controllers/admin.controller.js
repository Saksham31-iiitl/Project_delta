const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/Booking");

async function pendingListings(req, res) {
  const list = await Listing.find({ status: "under_review" }).sort({ createdAt: 1 });
  res.json(list);
}

async function approveListing(req, res) {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "active" }, { new: true });
  res.json(listing);
}

async function rejectListing(req, res) {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
  res.json(listing);
}

async function pendingKyc(req, res) {
  const users = await User.find({ kycStatus: "pending" }).select("fullName email kycStatus aadhaarRef createdAt");
  res.json(users);
}

async function approveKyc(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { kycStatus: "verified" },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ ok: true, kycStatus: user.kycStatus });
}

async function rejectKyc(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { kycStatus: "rejected", aadhaarRef: undefined },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ ok: true, kycStatus: user.kycStatus });
}

async function analytics(req, res) {
  const [users, listings, bookings] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments({ status: "active" }),
    Booking.countDocuments(),
  ]);
  res.json({ users, activeListings: listings, bookings });
}

module.exports = { pendingListings, approveListing, rejectListing, pendingKyc, approveKyc, rejectKyc, analytics };
