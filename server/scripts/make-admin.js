/**
 * One-time script to grant admin role to a user by email.
 * Usage:  node scripts/make-admin.js someone@example.com
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/models/User");

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nearbystay";

(async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB:", MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { $addToSet: { roles: "admin" } },
    { new: true }
  ).select("fullName email roles");

  if (!user) {
    console.error(`No user found with email: ${email}`);
    console.error("Make sure the person has logged in at least once first.");
    process.exit(1);
  }

  console.log("\nSuccess!");
  console.log("  Name  :", user.fullName || "(no name yet)");
  console.log("  Email :", user.email);
  console.log("  Roles :", user.roles.join(", "));
  process.exit(0);
})().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
