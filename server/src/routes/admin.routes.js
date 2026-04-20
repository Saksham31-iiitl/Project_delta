const express = require("express");
const {
  pendingListings,
  approveListing,
  rejectListing,
  pendingKyc,
  approveKyc,
  rejectKyc,
  analytics,
  getAllUsers,
  searchUser,
  setUserRoles,
} = require("../controllers/admin.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");

const router = express.Router();
router.use(authMiddleware, roleGuard("admin"));
router.get("/listings/pending", pendingListings);
router.put("/listings/:id/approve", approveListing);
router.put("/listings/:id/reject", rejectListing);
router.get("/kyc/pending", pendingKyc);
router.put("/kyc/:userId/approve", approveKyc);
router.put("/kyc/:userId/reject", rejectKyc);
router.get("/analytics", analytics);
router.get("/users", getAllUsers);
router.get("/users/search", searchUser);
router.put("/users/:id/roles", setUserRoles);

module.exports = router;
