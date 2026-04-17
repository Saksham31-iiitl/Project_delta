const express = require("express");
const {
  createBooking,
  verifyPayment,
  confirmBooking,
  declineBooking,
  cancelBooking,
  checkOut,
  myBookings,
  hostBookings,
} = require("../controllers/booking.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");
const { bookingSchema } = require("../validators/booking.validator");

const router = express.Router();
router.use(authMiddleware);

router.post("/", validate(bookingSchema), createBooking);
router.post("/verify", verifyPayment);
router.put("/:id/confirm", confirmBooking);
router.put("/:id/decline", declineBooking);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/checkout", checkOut);
router.get("/my-bookings", myBookings);
router.get("/host-bookings", hostBookings);

module.exports = router;
