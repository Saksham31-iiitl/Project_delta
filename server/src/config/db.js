const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDB() {
  await mongoose.connect(env.MONGODB_URI);
  return mongoose.connection;
}

module.exports = { connectDB };
