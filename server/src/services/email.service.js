const nodemailer = require("nodemailer");
const { env } = require("../config/env");

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_APP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendOtpEmail(email, otp) {
  if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD) {
    if (env.NODE_ENV === "production") {
      throw new Error("Email service not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD env vars.");
    }
    console.log(`\n[DEV OTP] Email: ${email}  →  OTP: ${otp}\n`);
    return { mocked: true };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"HostTheGuest" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Your HostTheGuest login OTP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e7e5e4;border-radius:16px">
        <h2 style="margin:0 0 8px;font-size:20px;color:#1c1917">Your login OTP</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#78716c">
          Use the code below to log in to HostTheGuest. It expires in <strong>5 minutes</strong>.
        </p>
        <div style="background:#f5f5f4;border-radius:12px;padding:20px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;color:#1c1917">
          ${otp}
        </div>
        <p style="margin:24px 0 0;font-size:12px;color:#a8a29e">
          If you didn't request this, you can safely ignore this email. Do not share this OTP with anyone.
        </p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e7e5e4" />
        <p style="margin:0;font-size:12px;color:#a8a29e">HostTheGuest · Wherever the occasion is, stay close.</p>
      </div>
    `,
  });

  return { mocked: false };
}

module.exports = { sendOtpEmail };
