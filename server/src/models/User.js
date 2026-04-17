const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    accountNumber: String,
    ifsc: String,
    beneficiaryName: String,
    razorpayContactId: String,
    razorpayFundAccountId: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    fullName: String,
    profilePhotoUrl: String,
    roles: {
      type: [String],
      enum: ["guest", "host", "organizer", "admin"],
      default: ["guest"],
    },
    kycStatus: {
      type: String,
      enum: ["none", "pending", "verified", "rejected"],
      default: "none",
      index: true,
    },
    aadhaarRef: String,
    trustScore: { type: Number, default: 50 },
    preferredLanguage: { type: String, default: "en" },
    bankDetails: bankDetailsSchema,
    responseRate: { type: Number, default: 0.5 },
    communityScore: { type: Number, default: 0 },
    otpCode: String,
    otpExpiry: Date,
    lastActiveAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
