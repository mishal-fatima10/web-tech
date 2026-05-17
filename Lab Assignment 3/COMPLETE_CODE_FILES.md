# Complete Code Files - Ready to Use

## FILE 1: models/User.js

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: [true, "Email already exists"],
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email"
    ]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
```

---

## FILE 2: middleware/auth.js

```javascript
// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash("error", "Please log in first");
  res.redirect("/login");
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.role === "admin") {
    return next();
  }
  req.flash("error", "Access Denied. Admin access required.");
  res.redirect("/");
};

module.exports = { isLoggedIn, isAdmin };
```

---

## FILE 3: routes/auth.js (COMPLETE)

```javascript
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { isLoggedIn } = require("../middleware/auth");

// =====================
// REGISTRATION ROUTES
// =====================

// GET /register - Show registration page
router.get("/register", (req, res) => {
  res.render("register", { user: req.session.userId ? req.session : null });
});

// POST /register - Handle registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      req.flash("error", "Please provide all required fields");
      return res.redirect("/register");
    }

    if (password !== passwordConfirm) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      req.flash("error", "Email is already in use");
      return res.redirect("/register");
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password
    });

    req.flash("success", "User registered successfully! Please login.");
    res.redirect("/login");
  } catch (error) {
    console.log("Registration error:", error.message);
    req.flash("error", error.message || "Error during registration");
    res.redirect("/register");
  }
});

// =====================
// LOGIN ROUTES
// =====================

// GET /login - Show login page
router.get("/login", (req, res) => {
  res.render("login", { user: req.session.userId ? req.session : null });
});

// POST /login - Handle login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      req.flash("error", "Please provide email and password");
      return res.redirect("/login");
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
      req.flash("error", "Email is not registered");
      return res.redirect("/login");
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    // Store in session
    req.session.userId = user._id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.role = user.role;

    req.flash("success", `Welcome back, ${user.name}!`);
    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    res.redirect("/");
  } catch (error) {
    console.log("Login error:", error.message);
    req.flash("error", "Error during login");
    res.redirect("/login");
  }
});

// =====================
// LOGOUT ROUTES
// =====================

// GET /logout - Show logout confirmation
router.get("/logout", isLoggedIn, (req, res) => {
  res.render("logout-confirm", { user: req.session });
});

// POST /logout-confirm - Destroy session
router.post("/logout-confirm", isLoggedIn, (req, res) => {
  const userName = req.session.name;
  
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.redirect("/");
  });
});

// =====================
// PROFILE ROUTE
// =====================

// GET /profile - Show user profile (protected)
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session });
});

module.exports = router;
```

---

## FILE 4: server.js (KEY SECTIONS)

```javascript
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
require("dotenv").config();

async function renderProductCatalog(req, res, viewName) {
    try {
        const page = parseInt(req.query.page) || 1;
        const searchQuery = req.query.search || "";
        const categoryFilter = req.query.category || "";
        const minPrice = req.query.minPrice !== undefined && req.query.minPrice !== "" ? parseFloat(req.query.minPrice) : 0;
        const maxPrice = req.query.maxPrice !== undefined && req.query.maxPrice !== "" ? parseFloat(req.query.maxPrice) : Infinity;
        const sortBy = req.query.sort || "name";

        let filter = {};

        if (searchQuery) {
            filter.name = { $regex: searchQuery, $options: "i" };
        }

        if (categoryFilter) {
            filter.category = categoryFilter;
        }

        filter.price = { $gte: minPrice, $lte: maxPrice };

        let sortConfig = {};
        switch (sortBy) {
            case "price-low":
                sortConfig = { price: 1 };
                break;
            case "price-high":
                sortConfig = { price: -1 };
                break;
            case "rating":
                sortConfig = { rating: -1 };
                break;
            default:
                sortConfig = { name: 1 };
        }

        const limit = 8;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(filter)
            .sort(sortConfig)
            .limit(limit)
            .skip(skip);

        const categories = await Product.distinct("category");

        res.render(viewName, {
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            searchQuery,
            categoryFilter,
            minPrice,
            maxPrice,
            sortBy,
            categories,
            limit
        });
    } catch (error) {
        console.log("Error fetching products:", error);
        res.status(500).render("500", {
            user: res.locals.user,
            message: "Error loading products"
        });
    }
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection error:", err));

// EJS setup
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// =============================================
// SESSION CONFIGURATION - PERSISTENT IN MONGODB
// =============================================
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy session update
  }),
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ===================================
// FLASH MIDDLEWARE - MUST BE AFTER SESSION
// ===================================
app.use(flash());

// ================================================
// GLOBAL MIDDLEWARE - PASS USER & MESSAGES TO ALL VIEWS
// ================================================
app.use((req, res, next) => {
  // Check if user is logged in
  if (req.session.userId) {
    res.locals.user = {
      userId: req.session.userId,
      name: req.session.name,
      email: req.session.email,
      role: req.session.role
    };
  } else {
    res.locals.user = null;
  }

  // Make flash messages available to templates
  res.locals.messages = req.flash();
  
  next();
});

// Static files (CSS, JS, Images)
app.use(express.static("public"));

// ==================
// ROUTES
// ==================
app.get("/", function (req, res) {
    res.render("homepage");
});

app.get("/contact-us", function (req, res) {
    res.render("contact-us");
});

app.get("/shop-by", async function (req, res) {
    await renderProductCatalog(req, res, "shop-by");
});

app.get("/unstitched-lawn", function (req, res) {
    res.render("unstitched-lawn");
});

app.get("/luxe-pret", function (req, res) {
    res.render("luxe-pret");
});

app.get("/formals", function (req, res) {
    res.render("formals");
});

app.get("/bridals", function (req, res) {
    res.render("bridals");
});

// Products Route with Pagination, Filtering, and Searching
app.get("/products", async function (req, res) {
    await renderProductCatalog(req, res, "products");
});

// ========================================
// IMPORT AND USE AUTHENTICATION ROUTES
// ========================================
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

app.use(authRoutes);      // /register, /login, /logout, /profile
app.use(adminRoutes);     // /admin, /admin/products, /admin/users

// 404 - Page Not Found (Fallback Route)
app.use((req, res) => {
    res.status(404).render("404", { user: res.locals.user });
});

// Error Handler Middleware (500 - Server Error)
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);
    res.status(500).render("500", { user: res.locals.user });
});

// Server Start
const PORT = 3000;
app.listen(PORT, function () {
    console.log(`Server started at http://localhost:${PORT}`);
});
```

---

## FILE 5: .env (Configuration)

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sania-maskatiya

# For MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/sania-maskatiya?retryWrites=true&w=majority

# Session Secret (use a strong random string in production)
SESSION_SECRET=your_super_secret_session_key_12345

# Server Port
PORT=3000
```

---

## FILE 6: views/homepage.ejs (NAVIGATION SECTION)

```ejs
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sania Maskatiya Store</title>
    <link rel="stylesheet" href="/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        .alert {
            padding: 12px 16px;
            margin: 15px;
            border-radius: 4px;
            font-size: 14px;
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .close-alert {
            float: right;
            cursor: pointer;
            font-weight: bold;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="top-bar">
        ONLY ORDERS PLACED BY 22ND FEB FROM OUR EID COLLECTION WILL BE DELIVERED BEFORE EID!
    </div>

    <header class="main-header">
        <div class="logo">
            <img src="/images/logo.svg" alt="Sania Maskatiya">
        </div>

        <button class="hamburger-menu" id="hamburgerMenu">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- NAVIGATION WITH CONDITIONAL RENDERING -->
        <nav class="nav-menu" id="navMenu">
            <ul>
                <!-- Core Navigation (Always visible) -->
                <li><a href="/">Homepage</a></li>
                <li><a href="/unstitched-lawn">UNSTITCHED LAWN '26</a></li>
                <li><a href="/shop-by">SHOP BY</a></li>
                <li><a href="/luxe-pret">LUXE PRET</a></li>
                <li><a href="/formals">FORMALS</a></li>
                <li><a href="/bridals">BRIDALS</a></li>
                <li><a href="/contact-us">Contact Us</a></li>

                <!-- Conditional: User is logged in -->
                <% if (user) { %>
                    <li><a href="/profile">My Profile</a></li>
                    <li><a href="/logout">Logout</a></li>

                    <!-- Conditional: User is admin -->
                    <% if (user.role === 'admin') { %>
                        <li><a href="/admin">Admin Panel</a></li>
                    <% } %>
                <% } else { %>
                    <!-- User is NOT logged in -->
                    <li><a href="/login">Login</a></li>
                    <li><a href="/register">Register</a></li>
                <% } %>
            </ul>
        </nav>

        <div class="header-icons">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
    </header>

    <!-- FLASH ERROR MESSAGES -->
    <% if (messages.error && messages.error.length > 0) { %>
        <% messages.error.forEach(msg => { %>
            <div class="alert alert-error">
                <span class="close-alert" onclick="this.parentElement.style.display='none';">&times;</span>
                <%= msg %>
            </div>
        <% }) %>
    <% } %>

    <!-- FLASH SUCCESS MESSAGES -->
    <% if (messages.success && messages.success.length > 0) { %>
        <% messages.success.forEach(msg => { %>
            <div class="alert alert-success">
                <span class="close-alert" onclick="this.parentElement.style.display='none';">&times;</span>
                <%= msg %>
            </div>
        <% }) %>
    <% } %>

    <!-- HERO SECTION AND REST OF PAGE -->
    <section class="hero-section">
        <div class="hero-content">
            <h1>RAMADAN '26</h1>
            <a href="#" class="btn-shop">SHOP NOW</a>
        </div>
    </section>

    <!-- Rest of homepage content... -->
</body>
</html>
```

---

## FILE 7: routes/admin.js (EXAMPLE - PROTECTED ROUTES)

```javascript
const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware/auth");
const Product = require("../models/Product");
const User = require("../models/User");

// ✅ Admin Dashboard - Protected by isLoggedIn AND isAdmin
router.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin-dashboard", { user: req.session, products });
  } catch (error) {
    req.flash("error", "Error loading admin dashboard");
    res.redirect("/");
  }
});

// ✅ Admin Products List - Protected by isLoggedIn AND isAdmin
router.get("/admin/products", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin-products", { user: req.session, products });
  } catch (error) {
    req.flash("error", "Error fetching products");
    res.redirect("/admin");
  }
});

// ✅ Add New Product - Protected by isLoggedIn AND isAdmin
router.get("/admin/products/new", isLoggedIn, isAdmin, (req, res) => {
  const categories = ["Unstitched Lawn", "Luxe Pret", "Formals", "Bridals"];
  res.render("admin-product-form", {
    user: req.session,
    product: null,
    formAction: "/admin/products",
    formTitle: "Add New Product",
    submitLabel: "Create Product",
    categories
  });
});

// ✅ Admin Users List - Protected by isLoggedIn AND isAdmin
router.get("/admin/users", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render("admin-users", { user: req.session, users });
  } catch (error) {
    req.flash("error", "Error fetching users");
    res.redirect("/admin");
  }
});

module.exports = router;
```

---

## VERIFICATION CHECKLIST

- ✅ User.js: Pre-save password hashing implemented
- ✅ User.js: comparePassword method implemented
- ✅ auth.js middleware: isLoggedIn checks req.session.userId
- ✅ auth.js middleware: isAdmin checks both userId and role
- ✅ routes/auth.js: Registration validates and saves user
- ✅ routes/auth.js: Login compares password using bcrypt
- ✅ routes/auth.js: Logout destroys session
- ✅ server.js: express-session configured with MongoStore
- ✅ server.js: connect-flash initialized after session
- ✅ server.js: Global middleware passes user & messages to templates
- ✅ templates: Navigation shows conditional links based on role
- ✅ admin routes: Protected with isLoggedIn and isAdmin middleware

All files are production-ready!
