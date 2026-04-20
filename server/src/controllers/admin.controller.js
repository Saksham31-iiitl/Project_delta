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

async function getAllUsers(req, res) {
  const users = await User.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "listings",
        localField: "_id",
        foreignField: "hostId",
        as: "listings",
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        phone: 1,
        roles: 1,
        createdAt: 1,
        listingCount: { $size: "$listings" },
        hasListing: { $gt: [{ $size: "$listings" }, 0] },
      },
    },
  ]);
  res.json(users);
}

async function searchUser(req, res) {
  const { email } = req.query;
  if (!email?.trim()) return res.status(400).json({ message: "Email is required" });
  const user = await User.findOne({ email: email.trim().toLowerCase() })
    .select("fullName email phone roles createdAt");
  if (!user) return res.status(404).json({ message: "No user found with that email" });
  res.json(user);
}

const ALLOWED_ROLES = ["guest", "host", "organizer", "admin"];

async function setUserRoles(req, res) {
  const { roles } = req.body;
  if (!Array.isArray(roles) || roles.length === 0)
    return res.status(400).json({ message: "Roles must be a non-empty array" });
  if (roles.some((r) => !ALLOWED_ROLES.includes(r)))
    return res.status(400).json({ message: "Invalid role value" });
  // Prevent an admin from removing their own admin role
  if (String(req.params.id) === String(req.user._id) && !roles.includes("admin"))
    return res.status(400).json({ message: "You cannot remove your own admin role" });
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { roles },
    { new: true, runValidators: true }
  ).select("fullName email phone roles");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

module.exports = {
  pendingListings, approveListing, rejectListing,
  pendingKyc, approveKyc, rejectKyc,
  analytics, getAllUsers, searchUser, setUserRoles,
};
