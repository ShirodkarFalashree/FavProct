import express from "express";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";

const router = express.Router();

// 📁 GET /api/org/ -> List all organizations
router.get("/", async (req, res) => {
  try {
    const orgs = await Organization.find({}).sort({ createdAt: -1 });
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ POST /api/org/ -> Create organization AND provision admin
router.post("/", async (req, res) => {
  try {
    let { name, plan, organizationCode, adminName, adminEmail } = req.body;

    if (!name || !organizationCode || !adminName || !adminEmail) {
      return res.status(400).json({
        message: "Organization Name, Code, Admin Name, and Admin Email are all required"
      });
    }

    organizationCode = organizationCode.trim().toUpperCase();
    const normalizedAdminEmail = adminEmail.trim().toLowerCase();

    // 🔍 check duplicate org code
    const existingCode = await Organization.findOne({ organizationCode });
    if (existingCode) {
      return res.status(400).json({
        message: `Organization code "${organizationCode}" already exists`
      });
    }

    // 🔍 check duplicate name
    const existingName = await Organization.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        message: `Organization name "${name}" already exists`
      });
    }

    // 🔍 check duplicate admin email
    const existingAdmin = await User.findOne({ email: normalizedAdminEmail });
    if (existingAdmin) {
      return res.status(400).json({
        message: `A user with email "${adminEmail}" already exists`
      });
    }

    // 1. Create Organization
    const org = await Organization.create({
      name,
      plan: plan || "free",
      organizationCode
    });

    // 2. Generate Admin Password
    const tempPassword = `${organizationCode}@2026`;

    // 3. Create Admin User
    await User.create({
      name: adminName,
      email: normalizedAdminEmail,
      password: tempPassword,
      role: "admin",
      organizationId: org._id
    });

    // 4. Send Admin Invitation Email
    const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;
    const subject = `Welcome to FAVPROCT - Admin Console Setup`;
    const text = `
Dear ${adminName},

Your institution "${name}" has been successfully configured on FAVPROCT.
An Administrator account has been provisioned for you.

Please use the following credentials to log in:
- Portal Link: ${loginUrl}
- Email: ${normalizedAdminEmail}
- Password: ${tempPassword}
- Organization Code: ${organizationCode}

Best regards,
The FAVPROCT Team
`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">Welcome to FAVPROCT!</h2>
        <p>Dear ${adminName},</p>
        <p>Your institution <strong>${name}</strong> has been successfully configured on FAVPROCT.</p>
        <p>An Administrator account has been provisioned for you. Use the details below to log in and configure your portal:</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <p style="margin: 4px 0;"><strong>Portal Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${normalizedAdminEmail}</p>
          <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${tempPassword}</code></p>
          <p style="margin: 4px 0;"><strong>Organization Code:</strong> <strong style="color: #6366f1;">${organizationCode}</strong></p>
        </div>

        <p style="font-size: 12px; color: #64748b;">For security, please change your temporary password in your Profile Settings page immediately after logging in.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated system email. Please do not reply directly.</p>
      </div>
    `;

    // Send email
    try {
      await sendEmail({ to: normalizedAdminEmail, subject, text, html });
    } catch (emailErr) {
      console.error("❌ Failed to send admin setup email:", emailErr.message);
    }

    res.status(201).json({
      message: "Organization and Admin account created successfully",
      org
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;