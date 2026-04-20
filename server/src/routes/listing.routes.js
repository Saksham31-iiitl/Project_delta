const express = require("express");
const {
  createListing,
  getListing,
  updateListing,
  myListings,
  listingSearch,
  updateListingStatus,
  uploadListingPhotos,
} = require("../controllers/listing.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");
const { listingSchema } = require("../validators/listing.validator");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/search", listingSearch);
router.get("/detail/:id", getListing);
router.use(authMiddleware);
router.post("/upload-photos", upload.array("photos", 10), uploadListingPhotos);
router.post("/", validate(listingSchema), createListing);
router.get("/my-listings", myListings);
router.put("/:id", updateListing);
router.put("/:id/status", updateListingStatus);

module.exports = router;
