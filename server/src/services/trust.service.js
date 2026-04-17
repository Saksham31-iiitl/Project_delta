const User = require("../models/User");
const Review = require("../models/Review");
const Booking = require("../models/Booking");

async function recomputeTrustScore(userId) {
  const [user, reviews, bookings] = await Promise.all([
    User.findById(userId),
    Review.find({ revieweeId: userId }),
    Booking.find({ hostId: userId }),
  ]);
  if (!user) return null;
  const kycWeight = { none: 0, pending: 5, verified: 20, rejected: 0 };
  const kycScore = kycWeight[user.kycStatus] || 0;
  const avgReview = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 3;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const completionRate = bookings.length ? completed / bookings.length : 1;
  const trustScore = Math.round(
    kycScore + (avgReview / 5) * 30 + completionRate * 30 + (user.responseRate || 0.5) * 20
  );
  user.trustScore = Math.min(100, trustScore);
  await user.save();
  return user.trustScore;
}

module.exports = { recomputeTrustScore };
