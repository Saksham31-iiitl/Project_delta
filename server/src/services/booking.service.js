const { EventEmitter } = require("events");
const Booking = require("../models/Booking");
const { createNotification } = require("./notification.service");

const eventBus = new EventEmitter();

const BOOKING_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "disputed"],
  cancelled: [],
  completed: [],
  disputed: ["completed", "cancelled"],
};

async function transitionBooking(bookingId, newStatus, actor = "system") {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (!BOOKING_TRANSITIONS[booking.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${booking.status} to ${newStatus}`);
  }
  booking.status = newStatus;
  booking.updatedAt = new Date();
  if (newStatus === "cancelled") booking.cancelledBy = actor;
  await booking.save();
  eventBus.emit(`booking:${newStatus}`, { booking, actor });
  return booking;
}

eventBus.on("booking:confirmed", async ({ booking }) => {
  await createNotification({
    userId: booking.guestId,
    type: "booking_confirmed",
    title: "Booking confirmed",
    body: "Your booking has been confirmed by the host.",
    data: { bookingId: booking._id },
    channels: ["push", "sms"],
  });
});

module.exports = { eventBus, transitionBooking };
