# Lab Assignment 3: User Authentication & Role-Based Access Control

## 📋 Project Overview

This is a complete implementation of secure user authentication and role-based access control (RBAC) for a Node.js/Express e-commerce platform (Sania Maskatiya Store). The system handles user registration, login, session management with MongoDB persistence, and admin access control.

---

## 🎯 What's Implemented

### ✅ Task 1: User Model & Registration
- **User Model** (`models/User.js`): MongoDB schema with bcryptjs password hashing
- **Registration Routes** (`routes/auth.js`): GET/POST handlers for user registration with validation
- **Pre-save Middleware**: Automatic password hashing before database storage
- **Validation**: Email uniqueness, password strength, field requirements

### ✅ Task 2: Session Setup & Login Logic
- **Session Management** (`server.js`): Express-session with MongoDB persistence
- **Login Routes** (`routes/auth.js`): Secure login with bcryptjs password comparison
- **Session Persistence**: All sessions stored in MongoDB with 24-hour expiration
- **Flash Messages**: User feedback on registration, login, and error scenarios
- **Global Middleware**: User data available to all EJS templates

### ✅ Task 3: Dynamic Navigation
- **Conditional Navigation** (`views/homepage.ejs`): Different links based on login status
- **Guest Navigation**: Shows "Login" and "Register" for unauthenticated users
- **User Navigation**: Shows "My Profile" and "Logout" for authenticated users
- **Admin Navigation**: Shows "Admin Panel" link only for admin users
- **Flash Message Display**: Error and success messages in navigation header

### ✅ Task 4: Protection Middleware & RBAC
- **Authentication Middleware** (`middleware/auth.js`): `isLoggedIn` function protects user routes
- **Authorization Middleware**: `isAdmin` function protects admin routes
- **Route Protection**: `/profile`, `/logout` protected for customers; `/admin/*` protected for admins
- **Access Control**: Non-admin users redirected from admin routes with error message

---

## 📁 Project Structure

```
Lab Assignment 3/
├── models/
│   ├── User.js                    ← User schema with bcrypt hashing
│   └── Product.js                 ← Existing product schema
├── routes/
│   ├── auth.js                    ← Registration, login, logout, profile routes
│   └── admin.js                   ← Admin panel routes (protected)
├── middleware/
│   └── auth.js                    ← isLoggedIn & isAdmin middleware
├── views/
│   ├── homepage.ejs               ← Dynamic navigation with conditionals
│   ├── register.ejs               ← Registration form
│   ├── login.ejs                  ← Login form
│   ├── profile.ejs                ← User profile (protected)
│   ├── logout-confirm.ejs         ← Logout confirmation
│   ├── admin-dashboard.ejs        ← Admin panel (protected)
│   ├── admin-products.ejs         ← Product management (protected)
│   └── admin-users.ejs            ← User management (protected)
├── public/
│   ├── css/                       ← Stylesheets
│   ├── js/                        ← Client-side scripts
│   └── uploads/                   ← Product image uploads
├── server.js                      ← Main app with session & middleware config
├── package.json                   ← Dependencies
├── .env                           ← Environment variables (IMPORTANT!)
└── [DOCUMENTATION FILES]
    ├── AUTHENTICATION_IMPLEMENTATION_GUIDE.md
    ├── AUTHENTICATION_QUICK_REFERENCE.md
    ├── COMPLETE_CODE_FILES.md
    ├── ARCHITECTURE_AND_FLOW_DIAGRAMS.md
    ├── IMPLEMENTATION_VERIFICATION_CHECKLIST.md
    └── README.md (this file)
```

---

## 🚀 Quick Start

### 1. **Ensure Dependencies Are Installed**

```bash
npm install bcryptjs connect-flash connect-mongo express-session mongoose ejs express dotenv
```

### 2. **Configure Environment Variables**

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/sania-maskatiya
SESSION_SECRET=your_super_secret_session_key_here_change_in_production
PORT=3000
```

### 3. **Verify MongoDB is Running**

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Just update MONGODB_URI in .env
```

### 4. **Start the Server**

```bash
npm start
# Server runs at http://localhost:3000
```

### 5. **Test the System**

1. **Register**: Go to http://localhost:3000/register
2. **Login**: Go to http://localhost:3000/login
3. **Profile**: Go to http://localhost:3000/profile (should redirect if not logged in)
4. **Admin Panel**: Go to http://localhost:3000/admin (only works for admin users)

---

## 🔐 Security Features

✅ **Passwords**: Hashed with bcryptjs (10 salt rounds), never stored in plaintext  
✅ **Sessions**: Stored in MongoDB, not in memory (survives server restarts)  
✅ **Cookies**: HttpOnly flag prevents XSS attacks on session data  
✅ **Email**: Unique constraint with regex validation  
✅ **Password Requirements**: Minimum 6 characters enforced  
✅ **Role-Based Access**: Admin routes require both authentication AND admin role  
✅ **Session Expiry**: Auto-expires after 24 hours  
✅ **Flash Messages**: Secure user feedback without URL parameters  

---

## 📚 Documentation Files

### 1. **AUTHENTICATION_IMPLEMENTATION_GUIDE.md**
Complete guide covering all 4 tasks with:
- Detailed code explanations
- Authentication flow
- Session management concepts
- Environment variable setup
- Testing instructions
- Security checklist

**Use this when**: You need to understand the "why" behind the implementation

### 2. **AUTHENTICATION_QUICK_REFERENCE.md**
Quick lookup guide with:
- Code snippets for common patterns
- Session management quick reference
- Flash message examples
- Database query patterns
- HTTP status codes

**Use this when**: You need a quick code example or reminder

### 3. **COMPLETE_CODE_FILES.md**
All production-ready code files:
- `models/User.js` - Complete user schema
- `middleware/auth.js` - Protection middleware
- `routes/auth.js` - All auth routes
- `server.js` - Session & middleware config
- `.env` - Environment variables template
- Template examples

**Use this when**: You want to copy-paste working code

### 4. **ARCHITECTURE_AND_FLOW_DIAGRAMS.md**
Visual flowcharts showing:
- Registration flow
- Login flow
- Session lifecycle
- Route protection flow
- Data flow through system
- Middleware execution order

**Use this when**: You want to understand the system visually

### 5. **IMPLEMENTATION_VERIFICATION_CHECKLIST.md**
Comprehensive checklist covering:
- All implementation requirements
- Testing checklist
- Security verification
- Troubleshooting guide
- Final system readiness check

**Use this when**: You need to verify everything is implemented correctly

---

## 🔄 Key User Flows

### Registration Flow
```
User → /register (GET)  → See form
     → /register (POST) → Validate
                       → Hash password
                       → Save to DB
                       → Flash success
                       → Redirect to /login
```

### Login Flow
```
User → /login (GET)  → See form
     → /login (POST) → Find user
                    → Compare password
                    → Create session
                    → Save to MongoDB
                    → Redirect (admin → /admin, others → /)
```

### Protected Route Flow
```
User → GET /profile → isLoggedIn middleware
                    → Check req.session.userId
                    → If yes: render profile
                    → If no: redirect to /login
```

### Admin Route Flow
```
User → GET /admin → isLoggedIn middleware ✓
                 → isAdmin middleware
                 → Check role === 'admin'
                 → If yes: render admin dashboard
                 → If no: redirect to / with error
```

---

## 🧪 Testing

### Test Scenarios

**✅ Registration**
- Valid registration → User created, redirects to login
- Missing fields → Error message, stays on form
- Weak password → Error message, stays on form
- Duplicate email → Error message, stays on form

**✅ Login**
- Correct email + password → Session created, redirects
- Wrong email → Error message, stays on form
- Wrong password → Error message, stays on form
- Admin user → Redirects to /admin
- Regular user → Redirects to /

**✅ Protected Routes**
- Not logged in → Redirects to /login
- Logged in customer → Can access /profile
- Logged in customer → Cannot access /admin
- Logged in admin → Can access /admin

**✅ Navigation**
- Not logged in → Shows Login/Register
- Logged in → Shows Profile/Logout
- Admin logged in → Shows Admin Panel
- Customer logged in → No Admin Panel

---

## 🛠️ Common Tasks

### Create an Admin User

```javascript
// In MongoDB or using mongo shell:
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: bcryptjs_hashed_password,
  role: "admin",
  createdAt: new Date()
})
```

### Check Sessions in MongoDB

```javascript
// In MongoDB shell:
db.sessions.find().pretty()
// Shows all active sessions
```

### Reset a User's Password (via Registration)

1. User goes to /register
2. Register with same email (will error - email exists)
3. User must create new account or reset through a reset-password feature (not implemented)

### Add Logout Functionality

Already implemented! Users click "Logout" in navigation → Session destroyed → Redirected to homepage

---

## ⚠️ Troubleshooting

### "req.flash() requires sessions"
**Solution**: Ensure flash middleware comes AFTER session middleware in server.js

### Password comparison always fails
**Solution**: Use `.select("+password")` when finding user in login route

### Session not persisting
**Solution**: Check MongoDB connection and MongoStore configuration

### Admin links not showing
**Solution**: Verify `role === 'admin'` (lowercase) in EJS template

### Flash messages not displaying
**Solution**: Verify `res.locals.messages` is set in global middleware

---

## 📝 Key Code Patterns

### Protect a Route
```javascript
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session });
});
```

### Protect Admin Route
```javascript
router.get("/admin", isLoggedIn, isAdmin, (req, res) => {
  res.render("admin-dashboard", { user: req.session });
});
```

### Set Flash Message
```javascript
req.flash("success", "User registered successfully!");
res.redirect("/login");
```

### Check User in Template
```ejs
<% if (user) { %>
  <p>Hello, <%= user.name %>!</p>
<% } %>
```

### Check Admin in Template
```ejs
<% if (user && user.role === 'admin') { %>
  <li><a href="/admin">Admin Panel</a></li>
<% } %>
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ('customer' or 'admin'),
  createdAt: Date
}
```

### Sessions Collection
```javascript
{
  _id: String (sessionId),
  session: {
    userId: ObjectId,
    name: String,
    email: String,
    role: String
  },
  expires: Date (TTL index)
}
```

---

## 🚨 Security Reminders

1. **Never commit `.env` to git** - Store in `.gitignore`
2. **Use strong SESSION_SECRET** - Generate random string in production
3. **Set `secure: true` for HTTPS** - Only in production with SSL/TLS
4. **Validate all user input** - Never trust client-side data
5. **Use HTTPS in production** - Protect credentials in transit
6. **Monitor MongoDB access** - Set up proper authentication
7. **Implement rate limiting** - Prevent brute force attacks (not included)
8. **Log security events** - Track failed logins, unauthorized access

---

## 📞 Support

If you encounter issues:

1. **Check IMPLEMENTATION_VERIFICATION_CHECKLIST.md** for troubleshooting
2. **Review ARCHITECTURE_AND_FLOW_DIAGRAMS.md** for visual understanding
3. **Consult AUTHENTICATION_QUICK_REFERENCE.md** for code patterns
4. **Read error messages carefully** - They usually indicate the problem

---

## ✨ Features Implemented

- ✅ User registration with validation
- ✅ Secure login with bcryptjs password comparison
- ✅ Session management with MongoDB persistence
- ✅ Flash messages for user feedback
- ✅ Role-based access control (RBAC)
- ✅ Protected routes (customer & admin)
- ✅ Dynamic navigation based on role
- ✅ Logout with session destruction
- ✅ User profile page (protected)
- ✅ Admin dashboard (admin only)
- ✅ Error handling
- ✅ Security best practices

---

## 🎓 Learning Outcomes

After implementing this system, you'll understand:

- ✅ How to hash passwords securely
- ✅ How to manage user sessions
- ✅ How to store sessions in databases
- ✅ How to implement authentication
- ✅ How to implement authorization
- ✅ How to use middleware for access control
- ✅ How to render templates conditionally
- ✅ How to use flash messages
- ✅ Security best practices in web development

---

## 📄 License

This is an educational project for Lab Assignment 3.

---

## 🎉 Ready to Submit!

When you've completed the implementation verification checklist, your Lab Assignment 3 is complete and ready for submission!

Good luck! 🚀
