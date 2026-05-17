# Authentication System - Quick Reference Cheat Sheet

## 1. User Model Quick Reference

```javascript
// Create new user (password auto-hashed by pre-save hook)
const user = await User.create({
  name: "John Doe",
  email: "john@example.com",
  password: "password123"    // Will be automatically hashed
});

// Find user by email and get password field
const user = await User.findOne({ email: "john@example.com" }).select("+password");

// Compare passwords
const isMatch = await user.comparePassword("password123");  // true/false

// Find by ID (password NOT included by default)
const user = await User.findById(userId);
```

---

## 2. Session Quick Reference

```javascript
// SET session data (in login route)
req.session.userId = user._id;
req.session.name = user.name;
req.session.email = user.email;
req.session.role = user.role;

// READ session data (in any middleware/route)
const userId = req.session.userId;
const userRole = req.session.role;

// CHECK session exists (in middleware)
if (req.session.userId) { /* logged in */ }

// DESTROY session (in logout)
req.session.destroy((err) => {
  res.redirect("/");
});
```

---

## 3. Flash Messages Quick Reference

```javascript
// Set error message
req.flash("error", "Email is already in use");
req.flash("error", "Please log in first");

// Set success message
req.flash("success", "User registered successfully!");
req.flash("success", "Welcome back, John!");

// Access in templates
messages.error      // Array of error messages
messages.success    // Array of success messages

// Display in EJS template
<% if (messages.error && messages.error.length > 0) { %>
  <% messages.error.forEach(msg => { %>
    <div class="alert alert-error"><%= msg %></div>
  <% }) %>
<% } %>
```

---

## 4. Route Protection Quick Reference

```javascript
// Protect routes with middleware
app.get("/profile", isLoggedIn, (req, res) => {
  // Only reaches here if user is logged in
});

app.get("/admin", isLoggedIn, isAdmin, (req, res) => {
  // Only reaches here if user is logged in AND admin
});

app.post("/admin/products", isLoggedIn, isAdmin, (req, res) => {
  // Only reaches here if user is logged in AND admin
});
```

---

## 5. Middleware Quick Reference

### isLoggedIn Middleware
```javascript
const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return next();                    // Continue to route
  }
  req.flash("error", "Please log in first");
  res.redirect("/login");            // Redirect if not logged in
};
```

### isAdmin Middleware
```javascript
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.role === "admin") {
    return next();                    // Continue to route
  }
  req.flash("error", "Access Denied. Admin access required.");
  res.redirect("/");                 // Redirect if not admin
};
```

---

## 6. Template Variables Quick Reference

### Available in all templates via res.locals:
```javascript
user         // User object or null
user.userId  // User's MongoDB ID
user.name    // User's name
user.email   // User's email
user.role    // User's role ('customer' or 'admin')

messages     // Flash messages object
messages.error    // Array of error messages
messages.success  // Array of success messages
```

---

## 7. Common Patterns

### Registration Validation
```javascript
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

const existingUser = await User.findOne({ email: email });
if (existingUser) {
  req.flash("error", "Email is already in use");
  return res.redirect("/register");
}
```

### Login Logic
```javascript
const user = await User.findOne({ email: email }).select("+password");
if (!user) {
  req.flash("error", "Email is not registered");
  return res.redirect("/login");
}

const isPasswordCorrect = await user.comparePassword(password);
if (!isPasswordCorrect) {
  req.flash("error", "Invalid username or password");
  return res.redirect("/login");
}

// Success - set session and redirect
req.session.userId = user._id;
req.session.name = user.name;
req.session.email = user.email;
req.session.role = user.role;
res.redirect(user.role === "admin" ? "/admin" : "/");
```

---

## 8. EJS Template Patterns

### Show/Hide Navigation based on Login Status
```ejs
<% if (user) { %>
  <!-- User is logged in -->
  <li><a href="/profile">My Profile</a></li>
  <li><a href="/logout">Logout</a></li>
<% } else { %>
  <!-- User is NOT logged in -->
  <li><a href="/login">Login</a></li>
  <li><a href="/register">Register</a></li>
<% } %>
```

### Show Admin Link Only if Admin
```ejs
<% if (user && user.role === 'admin') { %>
  <li><a href="/admin">Admin Panel</a></li>
<% } %>
```

### Display Flash Messages
```ejs
<% if (messages.error && messages.error.length > 0) { %>
  <% messages.error.forEach(msg => { %>
    <div class="alert alert-error"><%= msg %></div>
  <% }) %>
<% } %>
```

### Display User Info in Profile
```ejs
<p><strong>Name:</strong> <%= user.name %></p>
<p><strong>Email:</strong> <%= user.email %></p>
<p><strong>Role:</strong> <%= user.role %></p>
```

---

## 9. Database Queries

### Create user
```javascript
await User.create({ name, email, password });
```

### Find user by email
```javascript
await User.findOne({ email: email });
await User.findOne({ email: email }).select("+password");
```

### Find user by ID
```javascript
await User.findById(userId);
```

### Find all users
```javascript
await User.find();
```

### Check if email exists
```javascript
const exists = await User.findOne({ email: email });
if (exists) { /* email already in use */ }
```

---

## 10. Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/sania-maskatiya
SESSION_SECRET=your_super_secret_key_here
PORT=3000
```

---

## 11. HTTP Status Codes & Redirects

| Scenario | Status | Redirect |
|----------|--------|----------|
| Successful login (customer) | 302 | / |
| Successful login (admin) | 302 | /admin |
| Successful registration | 302 | /login |
| Validation error | 302 | /register (or /login) |
| Not logged in + accessing protected route | 302 | /login |
| Not admin + accessing admin route | 302 | / |
| Successful logout | 302 | / |

---

## 12. File Locations & Responsibilities

| File | Purpose |
|------|---------|
| `models/User.js` | User schema, bcrypt hashing, password comparison |
| `routes/auth.js` | Registration, login, logout routes |
| `routes/admin.js` | Admin panel routes (protected) |
| `middleware/auth.js` | isLoggedIn, isAdmin middleware |
| `server.js` | Session/flash config, global middleware |
| `views/register.ejs` | Registration form + flash messages |
| `views/login.ejs` | Login form + flash messages |
| `views/profile.ejs` | Protected user profile page |
| `views/logout-confirm.ejs` | Logout confirmation page |
| `views/homepage.ejs` | Dynamic navigation based on role |
| `.env` | Sensitive configuration |

---

## 13. Debugging Checklist

- [ ] Session secret set in `.env`?
- [ ] `connect-flash` after `express-session`?
- [ ] Password field `.select("+password")` in login?
- [ ] Middleware applied to admin routes?
- [ ] res.locals.user available in templates?
- [ ] Role comparison is lowercase: `role === 'admin'`?
- [ ] MongoDB connected?
- [ ] User role set to 'customer' or 'admin' (not other values)?

---

## 14. Common Error Messages & Solutions

```javascript
// Error: "req.flash() requires sessions"
// Solution: Check flash() comes after session() in server.js

// Error: "Cannot read property 'comparePassword' of null"
// Solution: User not found - check email in database

// Error: "BSONError: invalid dbName '$db'"
// Solution: Check MONGODB_URI format in .env

// Error: "Cast to ObjectId failed"
// Solution: Invalid user ID format

// Error: "E11000 duplicate key error"
// Solution: Email already exists - handle with try/catch

// Error: "Middleware isLoggedIn is not a function"
// Solution: Ensure middleware exported correctly and imported
```

---

## 15. Security Reminders

- ✅ Never store passwords in plaintext
- ✅ Always use bcryptjs for hashing
- ✅ Keep SESSION_SECRET secure
- ✅ Use httpOnly cookies to prevent XSS
- ✅ Validate all user inputs
- ✅ Never trust client-side data
- ✅ Always check req.session.userId before accessing protected resources
- ✅ Always use middleware for route protection
