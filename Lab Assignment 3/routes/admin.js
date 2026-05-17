const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Product = require("../models/Product");
const User = require("../models/User");

const uploadDirectory = path.join(__dirname, "../public/uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const productCategories = ["Unstitched Lawn", "Luxe Pret", "Formals", "Bridals"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  }
});

function normalizeProductPayload(body) {
  return {
    name: (body.name || "").trim(),
    price: Number(body.price),
    category: (body.category || "").trim(),
    stock: Number(body.stock),
    rating: body.rating === undefined || body.rating === "" ? 0 : Number(body.rating),
    description: (body.description || "").trim()
  };
}

function validateProductPayload(payload) {
  const errors = [];

  if (!payload.name) errors.push("Product name is required");
  if (!payload.category) errors.push("Category is required");
  if (!Number.isFinite(payload.price) || payload.price < 0) errors.push("Valid price is required");
  if (!Number.isFinite(payload.stock) || payload.stock < 0) errors.push("Valid stock quantity is required");
  if (!Number.isFinite(payload.rating) || payload.rating < 0 || payload.rating > 5) {
    errors.push("Rating must be between 0 and 5");
  }
  if (!productCategories.includes(payload.category)) {
    errors.push("Selected category is invalid");
  }

  return errors;
}

// Admin Dashboard
router.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin-dashboard", { user: req.session, products });
  } catch (error) {
    req.flash("error", "Error loading admin dashboard");
    res.redirect("/");
  }
});

router.get("/admin/products", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin-products", { user: req.session, products });
  } catch (error) {
    req.flash("error", "Error fetching products");
    res.redirect("/admin");
  }
});

router.get("/admin/products/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("admin-product-form", {
    user: req.session,
    product: null,
    formAction: "/admin/products",
    formTitle: "Add New Product",
    submitLabel: "Create Product",
    categories: productCategories
  });
});

router.post("/admin/products", isLoggedIn, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);
    const errors = validateProductPayload(payload);

    if (errors.length > 0) {
      req.flash("error", errors[0]);
      return res.redirect("/admin/products/new");
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "/images/placeholder.svg";

    await Product.create({
      ...payload,
      image: imagePath
    });

    req.flash("success", "Product created successfully");
    res.redirect("/admin/products");
  } catch (error) {
    req.flash("error", error.message || "Error creating product");
    res.redirect("/admin/products/new");
  }
});

router.get("/admin/products/:id/edit", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/admin/products");
    }

    res.render("admin-product-form", {
      user: req.session,
      product,
      formAction: `/admin/products/${product._id}`,
      formTitle: "Edit Product",
      submitLabel: "Update Product",
      categories: productCategories
    });
  } catch (error) {
    req.flash("error", "Error loading product");
    res.redirect("/admin/products");
  }
});

router.post("/admin/products/:id", isLoggedIn, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/admin/products");
    }

    const payload = normalizeProductPayload(req.body);
    const errors = validateProductPayload(payload);

    if (errors.length > 0) {
      req.flash("error", errors[0]);
      return res.redirect(`/admin/products/${req.params.id}/edit`);
    }

    const updatedFields = {
      ...payload
    };

    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(req.params.id, updatedFields, { runValidators: true });

    req.flash("success", "Product updated successfully");
    res.redirect("/admin/products");
  } catch (error) {
    req.flash("error", error.message || "Error updating product");
    res.redirect(`/admin/products/${req.params.id}/edit`);
  }
});

router.post("/admin/products/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted successfully");
    res.redirect("/admin/products");
  } catch (error) {
    req.flash("error", "Error deleting product");
    res.redirect("/admin/products");
  }
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
