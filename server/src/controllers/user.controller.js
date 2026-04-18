const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

async function getMe(req, res) {
  const user = await User.findById(req.user.sub);
  res.json(user);
}

async function updateMe(req, res) {
  const user = await User.findByIdAndUpdate(req.user.sub, req.body, { new: true });
  res.json(user);
}

async function updateBankDetails(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user.sub,
    { $set: { bankDetails: req.body } },
    { new: true }
  );
  res.json(user);
}

async function submitKyc(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.kycStatus === "verified") {
    return res.status(400).json({ message: "KYC already verified" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Aadhaar image is required" });
  }

  // Upload to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "kyc", resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  user.aadhaarRef = result.secure_url;
  user.kycStatus = "pending";
  await user.save();

  res.json({ ok: true, kycStatus: user.kycStatus });
}

module.exports = { getMe, updateMe, updateBankDetails, submitKyc };
