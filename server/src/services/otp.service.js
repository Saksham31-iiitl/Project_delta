const { sendOtpEmail } = require("./email.service");

function generateOtp() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Send OTP via the appropriate channel.
 * Currently: email only.
 * Future: pass { phone } to add SMS via MSG91 alongside or instead.
 */
async function sendOtp({ email, otp }) {
  await sendOtpEmail(email, otp);
  return otp;
}

module.exports = { generateOtp, sendOtp };
