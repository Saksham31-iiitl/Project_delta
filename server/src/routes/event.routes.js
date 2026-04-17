const express = require("express");
const { createEvent, getEventByCode, getEventListings, myEvents } = require("../controllers/event.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");
const { eventSchema } = require("../validators/event.validator");

const router = express.Router();

router.get("/hub/:code", getEventByCode);
router.get("/hub/:code/listings", getEventListings);
router.use(authMiddleware);
router.post("/", validate(eventSchema), createEvent);
router.get("/my-events", myEvents);

module.exports = router;
