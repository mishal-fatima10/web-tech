const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection error:", err));

const testUsers = [
  {
    name: "Admin User",
    email: "admin@sania.com",
    password: "admin123",
    role: "admin"
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "customer"
  },
  {
    name: "Sarah Khan",
    email: "sarah@example.com",
    password: "password123",
    role: "customer"
  },
  {
    name: "Admin Manager",
    email: "manager@sania.com",
    password: "manager123",
    role: "admin"
  },
  {
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    password: "password123",
    role: "customer"
  },
  {
    name: "Fatima Hassan",
    email: "fatima@example.com",
    password: "password123",
    role: "customer"
  }
];

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Insert new users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`Successfully created ${createdUsers.length} test users`);

    // Display created users
    console.log("\n✓ Test Users Created:");
    console.log("============================");
    createdUsers.forEach((user) => {
      console.log(`\nName: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password: See testUsers array above`);
    });

    console.log("\n============================");
    console.log("✓ User seeding completed successfully!");
    console.log("\n📌 Login Credentials for Testing:");
    console.log("Admin Account:");
    console.log("  Email: admin@sania.com");
    console.log("  Password: admin123");
    console.log("\nCustomer Account:");
    console.log("  Email: john@example.com");
    console.log("  Password: password123");

    process.exit(0);
  } catch (error) {
    console.log("Error seeding users:", error.message);
    process.exit(1);
  }
};

seedUsers();
