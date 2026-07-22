import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_LOGS_DIR = path.resolve("uploads");
const EMAIL_LOGS_FILE = path.join(EMAIL_LOGS_DIR, "email_logs.txt");

// Ensure uploads directory exists
if (!fs.existsSync(EMAIL_LOGS_DIR)) {
  fs.mkdirSync(EMAIL_LOGS_DIR, { recursive: true });
}

export const sendEmail = async ({ to, subject, text, html }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const isSmtpConfigured = smtpHost && smtpUser && smtpPass;

  const logContent = `
========================================
DATE: ${new Date().toISOString()}
TO: ${to}
SUBJECT: ${subject}
BODY:
${text || html}
========================================
\n`;

  // Always log to local debug file
  try {
    fs.appendFileSync(EMAIL_LOGS_FILE, logContent);
  } catch (err) {
    console.error("Failed to write to local email logs:", err.message);
  }

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465, // true for 465, false for others
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: `"Assessment System" <${smtpUser}>`,
        to,
        subject,
        text,
        html: html || text
      });

      console.log(`[Email Service] Real email sent to ${to}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Email Service] SMTP Error sending to ${to}:`, error.message);
      console.log(`[Email Service] Falling back to local console logging for ${to}.`);
    }
  }

  // Fallback console log
  console.log("----------------------------------------");
  console.log(`[SMTP FALLBACK] Sent Email Simulation:`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${text}`);
  console.log(`[Details saved in: Backend/uploads/email_logs.txt]`);
  console.log("----------------------------------------");

  return { success: true, simulated: true };
};
