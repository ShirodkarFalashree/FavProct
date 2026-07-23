import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";

export const signup = async (req, res) => {
  try {
    let { name, email, password, organizationCode, role } = req.body;

    // normalize org code
    organizationCode = organizationCode;

    // normalize email
    const normalizedEmail = (email || "").toString().trim().toLowerCase();

    // find organization
    const org = await Organization.findOne({ organizationCode });
    if (!org) {
      return res.status(404).json({
        message: "Organization not found"
      });
    }

    // check existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // default role if not provided
    if (!role) {
      role = "student";
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      organizationId: org._id,
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 find user
    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    // 🔐 compare password
    let isMatch = await bcrypt.compare(password, user.password);
    
    // Gracefully handle copy-paste leading/trailing whitespaces in password
    if (!isMatch && password && (password.trim() !== password)) {
      isMatch = await bcrypt.compare(password.trim(), user.password);
    }

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    // 🎟️ create token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        organizationId: user.organizationId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};