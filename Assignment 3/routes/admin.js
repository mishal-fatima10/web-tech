const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware/auth");
const User = require("../models/User");

// Admin Dashboard
router.get("/admin", isLoggedIn, isAdmin, (req, res) => {
  res.render("admin-dashboard", { user: req.session });
});

// Admin - Manage Users Page
router.get("/admin/users", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin-users", { users, user: req.session });
  } catch (error) {
    req.flash("error", "Error fetching users");
    res.redirect("/admin");
  }
});

// Admin - Update User Role
router.post("/admin/users/:id/role", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "admin"].includes(role)) {
      req.flash("error", "Invalid role");
      return res.redirect("/admin/users");
    }

    await User.findByIdAndUpdate(req.params.id, { role });
    req.flash("success", "User role updated successfully");
    res.redirect("/admin/users");
  } catch (error) {
    req.flash("error", "Error updating user role");
    res.redirect("/admin/users");
  }
});

// Admin - Delete User
router.post("/admin/users/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "User deleted successfully");
    res.redirect("/admin/users");
  } catch (error) {
    req.flash("error", "Error deleting user");
    res.redirect("/admin/users");
  }
});

module.exports = router;
