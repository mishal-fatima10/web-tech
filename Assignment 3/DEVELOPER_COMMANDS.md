# 🛠️ Developer Commands & Reference

## Installation & Setup Commands

### Fresh Start
```bash
# Install all dependencies
npm install

# Seed test users
npm run seed-users

# Start development server
npm start
```

### Just Start (After First Setup)
```bash
npm start
```

### Reseed Users (Clear & Recreate Test Data)
```bash
npm run seed-users
```

### Seed Products (If Needed)
```bash
npm run seed-products
```

---

## URL Shortcuts

### Public Routes
```
http://localhost:3000/              Homepage
http://localhost:3000/register      Registration form
http://localhost:3000/login         Login form
http://localhost:3000/products      Product catalog
http://localhost:3000/shop-by       Shop by category
http://localhost:3000/contact-us    Contact page
```

### Protected Routes (Auth Required)
```
http://localhost:3000/profile       User profile (logged-in users)
http://localhost:3000/logout        Logout (logged-in users)
```

### Admin Routes (Admin Only)
```
http://localhost:3000/admin         Admin dashboard
http://localhost:3000/admin/users   Manage users
```

---

## Test Credentials

### Admin Accounts
```
Email: admin@sania.com
Password: admin123
Role: admin
```

```
Email: manager@sania.com
Password: manager123
Role: admin
```

### Customer Accounts
```
Email: john@example.com
Password: password123
Role: customer
```

```
Email: sarah@example.com
Password: password123
Role: customer
```

```
Email: ahmed@example.com
Password: password123
Role: customer
```

```
Email: fatima@example.com
Password: password123
Role: customer
```

---

## Environment Variables

### .env File
```
# MongoDB Connection
MONGODB_URI=mongodb+srv://mishfati10_db_user:...

# Server Port
PORT=3000

# Session Secret (CHANGE IN PRODUCTION!)
SESSION_SECRET=your_super_secret_key_change_this_in_production_12345
```

---

## File Locations Reference

```
PROJECT_ROOT/
├── models/
│   └── User.js                    ← User schema & bcrypt
├── routes/
│   ├── auth.js                    ← Auth endpoints
│   └── admin.js                   ← Admin endpoints
├── middleware/
│   └── auth.js                    ← isLoggedIn, isAdmin
├── views/
│   ├── register.ejs               ← Registration page
│   ├── login.ejs                  ← Login page
│   ├── profile.ejs                ← User profile
│   ├── admin-dashboard.ejs        ← Admin dashboard
│   └── admin-users.ejs            ← User management
├── seed-users.js                  ← Test data
├── server.js                      ← Main server (UPDATED)
├── package.json                   ← Dependencies (UPDATED)
├── .env                           ← Config (UPDATED)
├── QUICK_START.md                 ← Quick guide
├── AUTHENTICATION_SETUP.md        ← Full documentation
├── AUTHENTICATION_FLOWS.md        ← Flow diagrams
├── IMPLEMENTATION_SUMMARY.md      ← Implementation details
└── DEVELOPER_COMMANDS.md          ← This file
```

---

## Routes Reference

### Authentication Routes

```javascript
// All in routes/auth.js

GET  /register          → Show registration form
POST /register          → Process registration
  Required fields: name, email, password, passwordConfirm
  Returns: Flash message + redirect

GET  /login             → Show login form
POST /login             → Process login
  Required fields: email, password
  Returns: Session + redirect to /

GET  /logout            → Logout (requires isLoggedIn)
  Returns: Destroy session + redirect

GET  /profile           → Show profile (requires isLoggedIn)
  Returns: User info page
```

### Admin Routes

```javascript
// All in routes/admin.js

GET  /admin             → Dashboard (requires isLoggedIn + isAdmin)
  Returns: Admin dashboard page

GET  /admin/users       → Manage users (requires isLoggedIn + isAdmin)
  Returns: Users table with actions

POST /admin/users/:id/role   → Update user role (requires isLoggedIn + isAdmin)
  Required fields: role (customer | admin)
  Returns: Flash message + redirect

POST /admin/users/:id/delete → Delete user (requires isLoggedIn + isAdmin)
  Returns: Flash message + redirect
```

---

## Middleware Reference

### isLoggedIn Middleware
```javascript
Location: middleware/auth.js

Used in: /profile, /logout, and all /admin routes
Checks: req.session.userId exists
Redirects: /login with error flash message
```

### isAdmin Middleware
```javascript
Location: middleware/auth.js

Used in: All /admin routes
Checks: req.session.userId && req.session.role === "admin"
Redirects: / with error flash message
Note: Requires isLoggedIn to work (apply both)
```

---

## Common Code Snippets

### Using Middleware on Routes
```javascript
// Single middleware
router.get("/profile", isLoggedIn, (req, res) => {
  // Only logged-in users can access
});

// Multiple middleware
router.get("/admin", isLoggedIn, isAdmin, (req, res) => {
  // Only logged-in AND admin users can access
});
```

### Accessing User Data in Routes
```javascript
req.session.userId    // User's MongoDB ID
req.session.name      // User's name
req.session.email     // User's email
req.session.role      // User's role ("customer" or "admin")
```

### Using Flash Messages
```javascript
// Set message
req.flash("success", "Login successful!");
req.flash("error", "Invalid email");

// Access in template
<% if (messages.error) { %>
  <% messages.error.forEach(msg => { %>
    <%= msg %>
  <% }) %>
<% } %>
```

### Accessing User in Views
```html
<!-- Check if logged in -->
<% if (user) { %>
  <p>Welcome, <%= user.name %>!</p>
<% } else { %>
  <p><a href="/login">Login</a></p>
<% } %>

<!-- Check if admin -->
<% if (user && user.role === 'admin') { %>
  <a href="/admin">Admin Panel</a>
<% } %>
```

---

## Database Queries

### Find User by Email
```javascript
const user = await User.findOne({ email: email });
```

### Find User and Get Password
```javascript
const user = await User.findOne({ email: email }).select("+password");
```

### Update User Role
```javascript
await User.findByIdAndUpdate(userId, { role: "admin" });
```

### Delete User
```javascript
await User.findByIdAndDelete(userId);
```

### Get All Users
```javascript
const users = await User.find();
```

---

## Debugging Tips

### Check Session Exists
```javascript
console.log(req.session);           // Full session object
console.log(req.session.userId);    // User ID
console.log(req.session.role);      // User role
```

### Check User Data in View
```ejs
<!-- In any EJS file -->
<pre><%= JSON.stringify(user, null, 2) %></pre>
```

### Check Flash Messages
```javascript
console.log(req.flash());           // All messages
console.log(req.flash("success"));  // Success only
console.log(req.flash("error"));    // Errors only
```

### Test MongoDB Connection
```javascript
// In server.js
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✓ Connected"))
  .catch(err => console.log("✗ Error:", err));
```

---

## Common Issues & Solutions

### Issue: "Cannot GET /register"
**Solution**: Make sure routes are imported in server.js
```javascript
const authRoutes = require("./routes/auth");
app.use(authRoutes);
```

### Issue: Session not persisting
**Solution**: Check MongoDB connection and connect-mongo
```bash
npm list connect-mongo
# Should show connect-mongo version
```

### Issue: Password hashing not working
**Solution**: Verify bcryptjs is imported
```javascript
const bcrypt = require("bcryptjs");
```

### Issue: Admin panel shows "Access Denied"
**Solution**: Verify user role in database
```javascript
db.users.findOne({ email: "admin@sania.com" })
// Should show: role: "admin"
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "seed-products": "node seed.js",
    "seed-users": "node seed-users.js"
  }
}
```

### Run Custom Script
```bash
# Any of these can be run:
npm start              # Start server
npm run seed-users     # Seed users only
npm run seed-products  # Seed products only
```

---

## Key Files to Modify

### Add New Route
1. Open `routes/auth.js` or create new route file
2. Add route handler
3. Import and use in `server.js`: `app.use(require("./routes/newroute"))`

### Add New View
1. Create `.ejs` file in `views/` folder
2. Include navbar template (copy from existing views)
3. Add flash message display if needed
4. Reference in route: `res.render("viewname")`

### Modify Middleware
1. Edit `middleware/auth.js`
2. Export new middleware
3. Import in route files: `const { middleware } = require("../middleware/auth")`
4. Use in routes: `router.get("/path", middleware, handler)`

---

## Security Checklist

- [ ] SESSION_SECRET is strong and changed from default
- [ ] MONGODB_URI is valid and secure
- [ ] Passwords are 6+ characters
- [ ] Email validation is working
- [ ] Admin routes require both isLoggedIn and isAdmin
- [ ] User data not exposed in URLs
- [ ] Sensitive data not logged to console (in production)
- [ ] Cookies set to httpOnly: true
- [ ] Passwords never stored plain-text

---

## Performance Tips

1. **Sessions**: Sessions are lazy-updated (touch after 24h)
2. **Database**: Use indexes on email field (already done)
3. **Passwords**: bcryptjs uses 10 salt rounds (balanced)
4. **Memory**: Sessions stored in MongoDB (not RAM)

---

## Next Development Steps

1. Add email verification on registration
2. Implement password reset flow
3. Add two-factor authentication
4. Create user edit profile page
5. Add audit logging for admin actions
6. Implement rate limiting on login
7. Add OAuth (Google, Facebook login)
8. Create user dashboard with order history

---

## References

- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [express-session Documentation](https://www.npmjs.com/package/express-session)
- [connect-mongo Documentation](https://www.npmjs.com/package/connect-mongo)
- [connect-flash Documentation](https://www.npmjs.com/package/connect-flash)
- [Mongoose Documentation](https://mongoosejs.com/)

---

**Last Updated**: May 16, 2026
**Author**: Lab Assignment 3 Implementation
**Status**: ✅ Complete
