const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guestsCount: { type: Number, default: 1 },
    totalAmount: Number,
    platformFee: Number,
    hostPayout: Number,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "disputed"],
      default: "pending",
      index: true,
    },
    paymentOrderId: String,
    paymentId: String,
    cancelledBy: { type: String, enum: ["guest", "host", "system", null], default: null },
    cancellationReason: String,
    hostResponseDeadline: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
