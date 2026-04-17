const express = require("express");
const { submitReview, getListingReviews } = require("../controllers/review.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
router.get("/listing/:listingId", getListingReviews);
router.use(authMiddleware);
router.post("/", submitReview);

module.exports = router;
