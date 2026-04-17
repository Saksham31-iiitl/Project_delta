const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { recomputeTrustScore } = require("../services/trust.service");

async function submitReview(req, res) {
  const booking = await Booking.findById(req.body.bookingId);
  if (!booking || booking.status !== "completed") {
    return res.status(400).json({ message: "Review allowed only after checkout" });
  }
  const role = `${booking.guestId}` === req.user.sub ? "guest_to_host" : "host_to_guest";
  const revieweeId = role === "guest_to_host" ? booking.hostId : booking.guestId;
  const review = await Review.create({
    bookingId: booking._id,
    reviewerId: req.user.sub,
    revieweeId,
    listingId: booking.listingId,
    role,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  const agg = await Review.aggregate([
    { $match: { listingId: booking.listingId, role: "guest_to_host" } },
    { $group: { _id: "$listingId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await Listing.findByIdAndUpdate(booking.listingId, { avgRating: agg[0].avg, reviewCount: agg[0].count });
  }
  await recomputeTrustScore(revieweeId);
  res.status(201).json(review);
}

async function getListingReviews(req, res) {
  const reviews = await Review.find({ listingId: req.params.listingId, role: "guest_to_host" }).sort({
    createdAt: -1,
  });
  res.json(reviews);
}

module.exports = { submitReview, getListingReviews };
