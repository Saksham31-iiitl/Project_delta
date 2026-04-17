const User = require("../models/User");

async function getMe(req, res) {
  const user = await User.findById(req.user.sub);
  res.json(user);
}

async function updateMe(req, res) {
  const user = await User.findByIdAndUpdate(req.user.sub, req.body, { new: true });
  res.json(user);
}

async function updateBankDetails(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user.sub,
    { $set: { bankDetails: req.body } },
    { new: true }
  );
  res.json(user);
}

module.exports = { getMe, updateMe, updateBankDetails };
