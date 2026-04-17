const cron = require("node-cron");
const Booking = require("../models/Booking");
const { transitionBooking } = require("../services/booking.service");

function startAutoCancelJob() {
  cron.schedule("*/15 * * * *", async () => {
    const expired = await Booking.find({
      status: "pending",
      hostResponseDeadline: { $lt: new Date() },
    }).select("_id");
    for (const booking of expired) {
      await transitionBooking(booking._id, "cancelled", "system");
    }
  });
}

module.exports = { startAutoCancelJob };
