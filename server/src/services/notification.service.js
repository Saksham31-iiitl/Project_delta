const Notification = require("../models/Notification");

async function createNotification({ userId, type, title, body, data = {}, channels = ["push"] }) {
  return Notification.create({ userId, type, title, body, data, channels });
}

module.exports = { createNotification };
