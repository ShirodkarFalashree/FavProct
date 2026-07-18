import express from "express";
import Organization from "../models/Organization.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { name, plan, organizationCode } = req.body;

    organizationCode = organizationCode.toUpperCase();

    // 🔍 check duplicate code
    const existingCode = await Organization.findOne({ organizationCode });
    if (existingCode) {
      return res.status(400).json({
        message: "Organization code already exists"
      });
    }

    // 🔍 check duplicate name
    const existingName = await Organization.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        message: "Organization name already exists"
      });
    }

    const org = await Organization.create({
      name,
      plan,
      organizationCode
    });

    res.status(201).json(org);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;