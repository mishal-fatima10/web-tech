require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing in the environment");
    }

    await mongoose.connect(mongoUri);

    const adminName = process.env.ADMIN_NAME || "Admin User";
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.name = adminName;
      existingAdmin.password = adminPassword;
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`Updated admin account: ${adminEmail}`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin"
      });
      console.log(`Created admin account: ${adminEmail}`);
    }

    console.log("Admin seed complete.");
    console.log("Login at: http://localhost:3000/login");
    console.log("Admin dashboard after login: http://localhost:3000/admin");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();