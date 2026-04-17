const axios = require("axios");
const { env } = require("../config/env");

function generateOtp() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

async function sendOtp(phone, otp) {
  if (!env.MSG91_AUTH_KEY || !env.MSG91_TEMPLATE_ID) {
    return { mocked: true };
  }
  await axios.post(
    "https://control.msg91.com/api/v5/otp",
    { mobile: phone, template_id: env.MSG91_TEMPLATE_ID, otp },
    { headers: { authkey: env.MSG91_AUTH_KEY } }
  );
  return { mocked: false };
}

module.exports = { generateOtp, sendOtp };
