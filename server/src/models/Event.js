const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventName: { type: String, required: true },
    eventType: {
      type: String,
      enum: ["wedding", "pooja", "birthday", "navratri", "funeral", "hospital", "other"],
      default: "other",
    },
    venueLocation: {
      type: { type: String, enum: ["Point"], default: "Point", required: true },
      coordinates: { type: [Number], required: true },
    },
    venueAddress: String,
    eventDates: {
      start: Date,
      end: Date,
    },
    inviteCode: { type: String, required: true, unique: true, index: true },
    maxRadiusKm: { type: Number, default: 2 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSchema.index({ venueLocation: "2dsphere" });

module.exports = mongoose.model("Event", eventSchema);
