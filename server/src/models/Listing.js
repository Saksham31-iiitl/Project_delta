const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["room", "floor", "home", "suite", "farmhouse"],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    address: {
      street: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    pricePerNight: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    maxGuests: { type: Number, default: 2 },
    rules: String,
    photos: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["under_review", "active", "paused", "rejected"],
      default: "under_review",
      index: true,
    },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Listing", listingSchema);
