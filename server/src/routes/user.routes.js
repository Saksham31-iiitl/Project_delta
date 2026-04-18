const express = require("express");
const { getMe, updateMe, updateBankDetails, submitKyc } = require("../controllers/user.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/me/bank-details", updateBankDetails);
router.post("/me/kyc", upload.single("aadhaar"), submitKyc);

module.exports = router;
