const express = require("express");
const {
  pendingListings,
  approveListing,
  rejectListing,
  pendingKyc,
  analytics,
} = require("../controllers/admin.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");

const router = express.Router();
router.use(authMiddleware, roleGuard("admin"));
router.get("/listings/pending", pendingListings);
router.put("/listings/:id/approve", approveListing);
router.put("/listings/:id/reject", rejectListing);
router.get("/kyc/pending", pendingKyc);
router.get("/analytics", analytics);

module.exports = router;
