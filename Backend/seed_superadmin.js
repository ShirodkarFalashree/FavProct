import mongoose from "mongoose";
import User from "./src/models/User.js";
import Organization from "./src/models/Organization.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not defined in .env file!");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB...");

  // Find or create System organization
  let org = await Organization.findOne({ organizationCode: "SYS" });
  if (!org) {
    org = await Organization.create({
      name: "System Operations",
      plan: "pro",
      organizationCode: "SYS"
    });
    console.log("System organization created: System Operations");
  }

  // Find or create Superadmin user
  const email = "superadmin@favproct.com";
  let superadmin = await User.findOne({ email });
  if (!superadmin) {
    superadmin = await User.create({
      name: "Super Administrator",
      email,
      password: "superpassword",
      role: "superadmin",
      organizationId: org._id
    });
    console.log("Superadmin user created successfully!");
  } else {
    superadmin.role = "superadmin";
    superadmin.organizationId = org._id;
    await superadmin.save();
    console.log("Existing superadmin user role updated successfully!");
  }

  console.log("\n========================================");
  console.log("Superadmin credentials seeded successfully:");
  console.log("Email:       superadmin@favproct.com");
  console.log("Password:    superpassword");
  console.log("Org Code:    SYS");
  console.log("========================================\n");

  await mongoose.disconnect();
}

run().catch(console.error);
