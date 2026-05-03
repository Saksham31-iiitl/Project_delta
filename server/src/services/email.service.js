const { Resend } = require("resend");
const { env } = require("../config/env");

async function sendOtpEmail(email, otp) {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === "production") {
      throw new Error("Email service not configured. Set RESEND_API_KEY env var.");
    }
    console.log(`\n[DEV OTP] Email: ${email}  →  OTP: ${otp}\n`);
    return { mocked: true };
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "HostTheGuest <onboarding@resend.dev>",
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

  if (error) throw new Error(`Resend error: ${error.message}`);

  return { mocked: false };
}

module.exports = { sendOtpEmail };
