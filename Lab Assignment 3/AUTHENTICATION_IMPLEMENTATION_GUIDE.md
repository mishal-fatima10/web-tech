# Lab Assignment 3: Complete Authentication & RBAC Implementation Guide

## Overview
This guide documents your complete Node.js/Express e-commerce platform authentication system with MongoDB session persistence and role-based access control (RBAC).

---

## Task 1: User Model & Registration Setup

### 1.1 User Model Implementation

**File: `models/User.js`**

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
    select: false // Don't return password by default in queries
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

// ✅ Pre-save middleware: Hash password before saving
userSchema.pre("save", async function(next) {
  // Only hash if password is modified/new
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

// ✅ Instance method: Compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
```

**Key Features:**
- **Email validation**: Unique index, lowercase, and regex pattern matching
- **Password hashing**: Automatic bcryptjs hashing with 10-salt rounds
- **Role enum**: Only 'customer' or 'admin' allowed
- **Password select: false**: Prevents password from being returned by default queries

---

### 1.2 Registration Routes Implementation

**File: `routes/auth.js` (Registration Section)**

```javascript
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { isLoggedIn } = require("../middleware/auth");

// ✅ GET /register - Render registration page
router.get("/register", (req, res) => {
  res.render("register", { user: req.session.userId ? req.session : null });
});

// ✅ POST /register - Handle user registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validation: Check all fields provided
    if (!name || !email || !password || !passwordConfirm) {
      req.flash("error", "Please provide all required fields");
      return res.redirect("/register");
    }

    // Validation: Passwords must match
    if (password !== passwordConfirm) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    // Validation: Password length minimum 6 characters
    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }

    // Validation: Check if email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      req.flash("error", "Email is already in use");
      return res.redirect("/register");
    }

    // Create new user (pre-save hook will hash password automatically)
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

module.exports = router;
```

**Registration Flow:**
1. User fills out name, email, password, and confirm password
2. Server validates all fields are provided
3. Server checks password confirmation match
4. Server validates password length (minimum 6 characters)
5. Server checks if email is unique in database
6. User model saves with automatic bcryptjs hashing
7. Success flash message displayed, redirect to login

---

## Task 2: Session Setup & Login Logic

### 2.1 Server.js Configuration

**File: `server.js` (Session & Middleware Section)**

```javascript
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
require("dotenv").config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection error:", err));

// EJS view engine
app.set("view engine", "ejs");

// ===============================
// MIDDLEWARE SETUP
// ===============================

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ✅ Session Configuration - Sessions stored in MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,                    // Don't save session if unmodified
  saveUninitialized: false,        // Don't save uninitialized sessions
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600           // Lazy session update (24 hours)
  }),
  cookie: {
    secure: false,                  // Set to true if using HTTPS
    httpOnly: true,                 // Prevents client-side JS access
    maxAge: 24 * 60 * 60 * 1000     // 24-hour session expiration
  }
}));

// ✅ Flash Middleware - MUST be after session middleware
// This initializes req.flash() for flash messages
app.use(flash());

// ✅ Global Middleware - Make user data available in all EJS templates
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

  // Make flash messages available in templates
  res.locals.messages = req.flash();
  
  next();
});

// Static files
app.use(express.static("public"));

// ===============================
// ROUTES
// ===============================

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

app.use(authRoutes);
app.use(adminRoutes);

// 404 & 500 Error handlers
app.use((req, res) => {
  res.status(404).render("404", { user: res.locals.user });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).render("500", { user: res.locals.user });
});

// Start server
const PORT = 3000;
app.listen(PORT, function () {
  console.log(`Server started at http://localhost:${PORT}`);
});
```

**Critical Configuration Points:**
- **Session secret**: Store in `.env` file for production
- **MongoStore**: Persists sessions in MongoDB instead of memory
- **Cookie settings**: `httpOnly: true` prevents XSS attacks on session cookie
- **Flash middleware order**: Must come AFTER session middleware
- **Global middleware**: Passes `user` and `messages` to all templates

### 2.2 Login Routes Implementation

**File: `routes/auth.js` (Login Section)**

```javascript
// ✅ GET /login - Render login page
router.get("/login", (req, res) => {
  res.render("login", { user: req.session.userId ? req.session : null });
});

// ✅ POST /login - Handle user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: Ensure email and password provided
    if (!email || !password) {
      req.flash("error", "Please provide email and password");
      return res.redirect("/login");
    }

    // Find user by email and EXPLICITLY SELECT password field
    // (password field has select: false, so we must explicitly request it)
    const user = await User.findOne({ email: email }).select("+password");

    // Check if user exists
    if (!user) {
      req.flash("error", "Email is not registered");
      return res.redirect("/login");
    }

    // Compare entered password with hashed password using bcryptjs
    const isPasswordCorrect = await user.comparePassword(password);

    // Check if password is correct
    if (!isPasswordCorrect) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    // ✅ Store user info in session
    req.session.userId = user._id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.role = user.role;

    req.flash("success", `Welcome back, ${user.name}!`);

    // Redirect admin users to admin dashboard, others to homepage
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
```

**Login Flow:**
1. User enters email and password
2. User found in database by email
3. Password compared using bcryptjs.compare()
4. If valid, user info stored in session (req.session.userId, etc.)
5. Session automatically persisted to MongoDB
6. User redirected based on role (admin to admin panel, customer to homepage)

### 2.3 Logout Routes Implementation

**File: `routes/auth.js` (Logout Section)**

```javascript
// ✅ GET /logout - Show logout confirmation page
router.get("/logout", isLoggedIn, (req, res) => {
  res.render("logout-confirm", { user: req.session });
});

// ✅ POST /logout-confirm - Handle session destruction
router.post("/logout-confirm", isLoggedIn, (req, res) => {
  // Destroy session data
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    // Session cookie automatically cleared
    res.redirect("/");
  });
});

// ✅ GET /profile - Show user profile (protected route)
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session });
});

module.exports = router;
```

**Logout Flow:**
1. User clicks logout
2. Confirmation page shown (optional security step)
3. User confirms logout
4. Session.destroy() called - removes session from MongoDB
5. Session cookie automatically cleared
6. User redirected to homepage

---

## Task 3: Dynamic Navigation Layout (EJS)

### 3.1 Navigation Bar with Conditional Rendering

**File: `views/homepage.ejs` (Navigation Section)**

The navigation header uses EJS conditionals to show different links based on login status and role:

```html
<header class="main-header">
    <div class="logo">
        <img src="/images/logo.svg" alt="Sania Maskatiya">
    </div>

    <nav class="nav-menu" id="navMenu">
        <ul>
            <!-- Core navigation links (always visible) -->
            <li><a href="/">Homepage</a></li>
            <li><a href="/unstitched-lawn">UNSTITCHED LAWN '26</a></li>
            <li><a href="/shop-by">SHOP BY</a></li>
            <li><a href="/luxe-pret">LUXE PRET</a></li>
            <li><a href="/formals">FORMALS</a></li>
            <li><a href="/bridals">BRIDALS</a></li>
            <li><a href="/contact-us">Contact Us</a></li>

            <!-- ✅ Conditional Authentication Links -->
            <% if (user) { %>
                <!-- User is logged in -->
                <li><a href="/profile">My Profile</a></li>
                <li><a href="/logout">Logout</a></li>

                <!-- ✅ Admin-only links -->
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

    <!-- Icons -->
    <div class="header-icons">
        <svg><!-- Search icon --></svg>
        <svg><!-- User icon --></svg>
        <svg><!-- Heart icon --></svg>
        <svg><!-- Cart icon --></svg>
    </div>
</header>

<!-- ✅ Flash Messages Display -->
<% if (messages.error && messages.error.length > 0) { %>
    <% messages.error.forEach(msg => { %>
        <div class="alert alert-error">
            <span class="close-alert" onclick="this.parentElement.style.display='none';">&times;</span>
            <%= msg %>
        </div>
    <% }) %>
<% } %>

<% if (messages.success && messages.success.length > 0) { %>
    <% messages.success.forEach(msg => { %>
        <div class="alert alert-success">
            <span class="close-alert" onclick="this.parentElement.style.display='none';">&times;</span>
            <%= msg %>
        </div>
    <% }) %>
<% } %>
```

**Navigation Logic:**
- **Guest (no session user)**:
  - Shows "Login" and "Register" links
  - No admin panel access
  
- **Logged-in customer** (role === 'customer'):
  - Shows "My Profile" and "Logout" links
  - No admin panel link
  
- **Logged-in admin** (role === 'admin'):
  - Shows "My Profile", "Logout", AND "Admin Panel" links

---

## Task 4: Protection Middleware & Role-Based Access Control

### 4.1 Authentication Middleware

**File: `middleware/auth.js`**

```javascript
// ✅ Middleware: Check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    // User is authenticated, proceed to next middleware/route
    return next();
  }

  // User not authenticated
  req.flash("error", "Please log in first");
  res.redirect("/login");
};

// ✅ Middleware: Check if user is logged in AND has admin role
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.role === "admin") {
    // User is authenticated and is admin, proceed
    return next();
  }

  // User is not admin or not logged in
  req.flash("error", "Access Denied. Admin access required.");
  res.redirect("/");
};

module.exports = { isLoggedIn, isAdmin };
```

**Middleware Behavior:**

**isLoggedIn:**
- ✅ Checks if `req.session.userId` exists
- ✅ If logged in: passes to next middleware/route
- ❌ If not logged in: shows error and redirects to `/login`

**isAdmin:**
- ✅ Checks if `req.session.userId` AND `req.session.role === 'admin'`
- ✅ If both true: passes to next middleware/route
- ❌ If either false: shows error and redirects to homepage `/`

### 4.2 Applying Middleware to Protected Routes

**File: `routes/admin.js` (Example Usage)**

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
router.post("/admin/products", isLoggedIn, isAdmin, async (req, res) => {
  // Route handler code
});

// ✅ Manage Users - Protected by isLoggedIn AND isAdmin
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

**Route Protection Pattern:**
```
router.get("/admin/products", isLoggedIn, isAdmin, (req, res) => {
  // Only reaches here if isLoggedIn AND isAdmin pass
});
```

### 4.3 Profile Route Protection

**File: `routes/auth.js` (Profile Section)**

```javascript
// ✅ Profile Page - Protected by isLoggedIn
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session });
});

// ✅ Logout - Protected by isLoggedIn
router.get("/logout", isLoggedIn, (req, res) => {
  res.render("logout-confirm", { user: req.session });
});
```

---

## Complete Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION FLOW                 │
└─────────────────────────────────────────────────────────────┘

REGISTRATION:
  User → /register (GET) → Show form
       → /register (POST) → Validate → Hash password → Save to DB
       → Redirect to /login with success message

LOGIN:
  User → /login (GET) → Show form
       → /login (POST) → Find user → Compare password → Save session
       → Session stored in MongoDB
       → Redirect based on role (admin → /admin, customer → /)

PROTECTED ROUTES:
  User → /profile, /admin, etc. → isLoggedIn middleware
       → Checks req.session.userId
       → If exists: proceed → render page
       → If not: redirect to /login

ADMIN ROUTES:
  User → /admin/* → isLoggedIn middleware ✓
       → isAdmin middleware → Checks req.session.role === 'admin'
       → If admin: proceed → render admin page
       → If not admin: redirect to homepage with error

LOGOUT:
  User → /logout (GET) → Show confirmation page
       → /logout-confirm (POST) → Destroy session
       → Session removed from MongoDB
       → Cookie cleared
       → Redirect to homepage

NAVIGATION:
  Every template receives res.locals.user
  → if (user) ? show profile/logout/admin : show login/register
```

---

## Environment Variables (.env)

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sania-maskatiya
# or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sania-maskatiya

# Session Secret
SESSION_SECRET=your_super_secret_session_key_change_this_in_production

# Server Port
PORT=3000
```

---

## Testing the Authentication System

### Test Case 1: User Registration
```
1. Navigate to http://localhost:3000/register
2. Enter name, email, password (min 6 chars)
3. Click Register
4. Should see success message and redirect to login
5. Check MongoDB: User.db should have new document with hashed password
```

### Test Case 2: User Login
```
1. Navigate to http://localhost:3000/login
2. Enter registered email and password
3. Click Login
4. Should see welcome message and redirect to homepage
5. Navigation should show "My Profile" and "Logout"
6. Check MongoDB: sessions collection should have new session
```

### Test Case 3: Admin Access
```
1. Create admin user:
   db.users.insertOne({
     name: "Admin User",
     email: "admin@test.com",
     password: bcrypt_hash,
     role: "admin"
   })
2. Login with admin credentials
3. Should see "Admin Panel" link in navigation
4. Access /admin should work
5. Regular customer accessing /admin should redirect with error
```

### Test Case 4: Protected Routes
```
1. Logout from account
2. Try accessing http://localhost:3000/profile directly
3. Should redirect to login with error message
4. Login and try again - should work
```

---

## Security Checklist

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ Sessions stored in MongoDB (not memory)
- ✅ Session cookies have `httpOnly: true` (prevents XSS)
- ✅ Email unique and validated with regex
- ✅ Password minimum 6 characters
- ✅ Role-based middleware for admin routes
- ✅ Flash messages for security feedback
- ✅ Sessions auto-expire after 24 hours

---

## Troubleshooting

### Issue: "req.flash() requires sessions"
**Solution**: Ensure `connect-flash` is initialized AFTER session middleware in `server.js`

### Issue: Password comparison always fails
**Solution**: Ensure User.findOne() uses `.select("+password")` since password field has `select: false`

### Issue: Session not persisting
**Solution**: Check MongoDB connection and verify `MongoStore` configuration

### Issue: Admin links not showing
**Solution**: Verify user role is set to "admin" (not "Admin") and check role comparison in template

---

## Dependencies Used

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",           // Password hashing
    "connect-flash": "^0.1.1",      // Flash messages
    "connect-mongo": "^5.1.0",      // MongoDB session store
    "express": "^4.22.2",           // Web framework
    "express-session": "^1.17.3",   // Session management
    "mongoose": "^7.8.9",           // MongoDB ORM
    "ejs": "^3.1.9"                 // Template engine
  }
}
```

---

## File Structure Summary

```
Lab Assignment 3/
├── models/
│   ├── Product.js          (Product schema)
│   └── User.js             (User schema with bcrypt)
├── routes/
│   ├── auth.js             (Register/Login/Logout routes)
│   └── admin.js            (Admin panel routes)
├── middleware/
│   └── auth.js             (isLoggedIn, isAdmin middleware)
├── views/
│   ├── homepage.ejs        (Dynamic navigation)
│   ├── login.ejs           (Login form)
│   ├── register.ejs        (Registration form)
│   ├── profile.ejs         (Protected user profile)
│   ├── logout-confirm.ejs  (Logout confirmation)
│   └── admin-*.ejs         (Admin pages)
├── server.js               (Main app, session config)
├── package.json            (Dependencies)
├── .env                    (Environment variables)
└── public/
    ├── css/
    ├── js/
    └── uploads/
```

---

This complete implementation provides:
- ✅ Secure user registration with password hashing
- ✅ Session management with MongoDB persistence
- ✅ Role-based access control (RBAC)
- ✅ Protected routes with middleware
- ✅ Flash messages for user feedback
- ✅ Dynamic navigation based on login status and role
