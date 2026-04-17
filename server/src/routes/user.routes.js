const express = require("express");
const { getMe, updateMe, updateBankDetails } = require("../controllers/user.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/me/bank-details", updateBankDetails);

module.exports = router;
