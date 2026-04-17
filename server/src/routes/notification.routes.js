const express = require("express");
const { listNotifications, markRead } = require("../controllers/notification.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authMiddleware);
router.get("/", listNotifications);
router.put("/:id/read", markRead);

module.exports = router;
