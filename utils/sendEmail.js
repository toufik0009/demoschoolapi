// utils/sendEmail.js
const nodemailer = require("nodemailer");

exports.sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or "hotmail", etc.
    auth: {
      user: process.env.EMAIL_USER, // from .env
      pass: process.env.EMAIL_PASS, // app password or real password (not recommended)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="background-color: #4A90E2; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0;">Super Admin Login OTP</h2>
      </div>
      <div style="padding: 30px; color: #333333;">
        <p>Hello,</p>
        <p>You have requested to log in as a Super Admin. Use the OTP code below to complete your login:</p>
        <div style="font-size: 32px; font-weight: bold; background: #eaf6ff; color: #0077cc; padding: 15px; border-radius: 6px; text-align: center; letter-spacing: 4px;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dddddd;">
        <p style="font-size: 12px; color: #999999;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>

    `,
  };

  return transporter.sendMail(mailOptions);
};
