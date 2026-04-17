const Notification = require("../models/Notification");

async function listNotifications(req, res) {
  const list = await Notification.find({ userId: req.user.sub }).sort({ createdAt: -1 });
  res.json(list);
}

async function markRead(req, res) {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.sub },
    { read: true },
    { new: true }
  );
  res.json(n);
}

module.exports = { listNotifications, markRead };
