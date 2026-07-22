import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_LOGS_DIR = path.resolve("uploads");
const EMAIL_LOGS_FILE = path.join(EMAIL_LOGS_DIR, "email_logs.txt");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(EMAIL_LOGS_DIR)) {
  fs.mkdirSync(EMAIL_LOGS_DIR, { recursive: true });
}

// Create transporter only once
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  // Log every email locally
  const logContent = `
========================================
DATE: ${new Date().toISOString()}
TO: ${to}
SUBJECT: ${subject}

BODY:
${text || html}

========================================

`;

  try {
    fs.appendFileSync(EMAIL_LOGS_FILE, logContent);
  } catch (err) {
    console.error("❌ Failed to write email log:", err.message);
  }

  try {
    console.log("====================================");
    console.log("📧 Sending Email...");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.EMAIL_USER);
    console.log(
      "Password:",
      process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌"
    );
    console.log("Recipient:", to);
    console.log("====================================");

    const info = await transporter.sendMail({
      from: `"Assessment System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log("✅ Email Sent Successfully!");
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email Sending Failed");
    console.error(error);

    return {
      success: false,
      error: error.message,
    };
  }
};