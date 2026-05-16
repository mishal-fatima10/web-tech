# Assignment 3: User Authentication & Role-Based Access Control - Setup Guide

## ✅ Implementation Complete!

This guide covers all authentication features implemented for your Sania Maskatiya e-commerce platform.

---

## 📋 Features Implemented

### 1. ✓ User Model & Registration
- **User Schema** with fields:
  - `name` - Full name (required)
  - `email` - Email (required, unique, validated)
  - `password` - Password (required, minimum 6 characters, hashed with bcryptjs)
  - `role` - User role (customer or admin, default: customer)
  - `createdAt` - Account creation timestamp

- **Password Hashing**: All passwords are hashed using bcryptjs before storage
- **Validation**: Email uniqueness and password length enforced at schema level

### 2. ✓ Login & Session Management
- **Login Logic**: 
  - Email verification
  - Secure password comparison using bcryptjs
  - Session creation upon successful login

- **Session Management**:
  - express-session with MongoDB store (connect-mongo)
  - 24-hour session timeout
  - Persistent session storage

- **Dynamic UI**:
  - Guests see: "Login" | "Register" links
  - Logged-in users see: "My Profile" | "Logout" links
  - Admins see: "Admin Panel" link (in addition to other user links)

### 3. ✓ Authorization Middleware
- **`isLoggedIn` Middleware**:
  - Protects routes requiring authentication
  - Redirects unauthenticated users to login page
  - Flash message: "Please log in first"

- **`isAdmin` Middleware**:
  - Checks if user role is "admin"
  - Requires isLoggedIn to be satisfied first
  - Redirects non-admin users with "Access Denied" message

- **Protected Routes**:
  - `/profile` - Requires isLoggedIn
  - `/logout` - Requires isLoggedIn
  - `/admin` - Requires isLoggedIn + isAdmin
  - `/admin/users` - Requires isLoggedIn + isAdmin

### 4. ✓ Flash Messages
Integration of connect-flash for user feedback:

- **Registration**:
  - Success: "User registered successfully! Please login."
  - Error: "Email is already in use"
  - Error: "Passwords do not match"
  - Error: "Password must be at least 6 characters"

- **Login**:
  - Success: "Welcome back, [Name]!"
  - Error: "Invalid username or password"
  - Error: "Email is not registered"
  - Error: "Please provide email and password"

- **Logout**:
  - Success: "[Name], you have successfully logged out"

- **Admin Panel**:
  - Success: "User role updated successfully"
  - Success: "User deleted successfully"
  - Error: "Access Denied. Admin access required."

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

This installs all required packages including:
- bcryptjs (password hashing)
- express-session (session management)
- connect-mongo (MongoDB session store)
- connect-flash (flash messages)

### Step 2: Configure Environment Variables
The `.env` file is already configured with:
```
MONGODB_URI=mongodb+srv://mishfati10_db_user:...
PORT=3000
SESSION_SECRET=your_super_secret_key_change_this_in_production_12345
```

⚠️ **Security Note**: In production, change the SESSION_SECRET to a strong random string.

### Step 3: Seed Test Users (IMPORTANT!)
```bash
npm run seed-users
```

This creates 6 test users:
- **Admin Account**: admin@sania.com / admin123 (role: admin)
- **Admin Account**: manager@sania.com / manager123 (role: admin)
- **Customer Accounts**:
  - john@example.com / password123
  - sarah@example.com / password123
  - ahmed@example.com / password123
  - fatima@example.com / password123

### Step 4: Start the Application
```bash
npm start
```

Server will run on `http://localhost:3000`

---

## 🧪 Testing Guide

### Test 1: Registration Flow
1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "testpass123"
   - Confirm Password: "testpass123"
3. Click "Register"
4. Expected: Success message, redirect to login page

### Test 2: Login as Customer
1. Go to `http://localhost:3000/login`
2. Enter credentials:
   - Email: john@example.com
   - Password: password123
3. Click "Login"
4. Expected: 
   - Success message: "Welcome back, John Doe!"
   - Redirect to homepage
   - Navbar shows: My Profile, Logout, NO Admin Panel

### Test 3: Login as Admin
1. Go to `http://localhost:3000/login`
2. Enter credentials:
   - Email: admin@sania.com
   - Password: admin123
3. Click "Login"
4. Expected:
   - Success message: "Welcome back, Admin User!"
   - Navbar shows: My Profile, Logout, **Admin Panel** (NEW!)

### Test 4: Access Admin Panel
1. Login as admin (see Test 3)
2. Click "Admin Panel" in navbar OR navigate to `/admin`
3. Expected: Admin dashboard displays with options:
   - 👥 Manage Users
   - 📦 Manage Products
   - 📊 View Analytics
   - ⚙️ Settings

### Test 5: Manage Users
1. From admin dashboard, click "Go to Users"
2. Navigate to `/admin/users`
3. Expected: Table showing all users with columns:
   - Name
   - Email
   - Role (with badge)
   - Actions (role selector + delete button)
4. Try changing a user's role:
   - Select "Make Admin" for john@example.com
   - User's role updates in table
   - Success message displays

### Test 6: Access Control - Protect Routes
1. Try accessing `/admin` while logged out:
   - Expected: Redirect to `/login` with message "Please log in first"

2. Try accessing `/admin` as customer (John):
   - Login as john@example.com
   - Navigate to `/admin`
   - Expected: Redirect to home with message "Access Denied. Admin access required."

### Test 7: Logout
1. Login as any user (admin or customer)
2. Click "Logout" in navbar
3. Expected:
   - Success message: "[Name], you have successfully logged out"
   - Session destroyed
   - Navbar shows: Login, Register (NOT logged in anymore)
   - Cannot access protected routes without logging in again

### Test 8: Profile Page
1. Login as any user
2. Click "My Profile" in navbar
3. Expected: Profile page displays:
   - Name
   - Email
   - Role (with colored badge)
   - Buttons: Back to Home, Logout, (Admin Dashboard if admin)

### Test 9: Form Validation
Test registration validation:
1. Try registering with:
   - Empty fields → "Please provide all required fields"
   - Mismatched passwords → "Passwords do not match"
   - Password < 6 chars → "Password must be at least 6 characters"
   - Duplicate email → "Email is already in use"

### Test 10: Session Persistence
1. Login as any user
2. Refresh the page (F5)
3. Expected: Still logged in, user info persists (24-hour session)
4. Close browser, reopen, navigate to site
5. Expected: Session expires after 24 hours (or browser restart in some cases)

---

## 📁 File Structure

```
mishaallll/
├── models/
│   ├── User.js                 ← NEW: User schema with bcrypt hashing
│   └── Product.js
├── routes/
│   ├── auth.js                 ← NEW: Register, login, logout, profile routes
│   └── admin.js                ← NEW: Admin panel routes
├── middleware/
│   └── auth.js                 ← NEW: isLoggedIn, isAdmin middleware
├── views/
│   ├── register.ejs            ← NEW: Registration form
│   ├── login.ejs               ← NEW: Login form
│   ├── profile.ejs             ← NEW: User profile page
│   ├── admin-dashboard.ejs     ← NEW: Admin dashboard
│   ├── admin-users.ejs         ← NEW: User management page
│   └── homepage.ejs            ← UPDATED: Dynamic navbar + flash messages
├── seed-users.js               ← NEW: Seed test users
├── server.js                   ← UPDATED: Session, flash, routes setup
├── package.json                ← UPDATED: New dependencies + scripts
└── .env                        ← UPDATED: Added SESSION_SECRET
```

---

## 🔐 Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs (10 salt rounds)
2. **Session Management**: Secure sessions with HTTP-only cookies
3. **Email Validation**: Email format validation at model level
4. **Unique Constraints**: MongoDB unique index on email field
5. **Authorization**: Role-based access control (RBAC)
6. **Flash Messages**: User feedback without exposing sensitive info

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'bcryptjs'"
**Solution**: Run `npm install`

### Issue: MongoDB connection error
**Solution**: 
- Verify MONGODB_URI in .env is correct
- Ensure MongoDB cluster is running and accessible
- Check IP whitelist in MongoDB Atlas

### Issue: Sessions not persisting
**Solution**:
- Verify connect-mongo is installed: `npm list connect-mongo`
- Check that MongoDB is running
- Clear browser cookies/cache

### Issue: "Access Denied" when trying to access admin
**Solution**:
- Ensure you're logged in as an admin user
- Verify user's role in database: `db.users.find({email: "admin@sania.com"})`
- Try re-logging in

### Issue: Flash messages not showing
**Solution**:
- Verify connect-flash is installed: `npm list connect-flash`
- Check that flash middleware is applied in server.js
- Ensure views include flash message display code

---

## 📝 Next Steps / Future Enhancements

1. **Email Verification**: Implement email confirmation during registration
2. **Password Recovery**: Add forgot password functionality
3. **Two-Factor Authentication**: Add 2FA for admin accounts
4. **User Roles Enhancement**: Add "moderator", "editor" roles
5. **Account Settings**: Allow users to change password, update profile
6. **Audit Logging**: Log all admin actions for security
7. **Rate Limiting**: Prevent brute-force attacks on login
8. **OAuth Integration**: Google/Facebook login options

---

## 📚 API Reference

### Auth Routes

| Method | Route | Middleware | Description |
|--------|-------|-----------|------------|
| GET | /register | - | Show registration form |
| POST | /register | - | Process registration |
| GET | /login | - | Show login form |
| POST | /login | - | Process login |
| GET | /logout | isLoggedIn | Logout and destroy session |
| GET | /profile | isLoggedIn | Show user profile |

### Admin Routes

| Method | Route | Middleware | Description |
|--------|-------|-----------|------------|
| GET | /admin | isLoggedIn, isAdmin | Admin dashboard |
| GET | /admin/users | isLoggedIn, isAdmin | List all users |
| POST | /admin/users/:id/role | isLoggedIn, isAdmin | Update user role |
| POST | /admin/users/:id/delete | isLoggedIn, isAdmin | Delete user |

---

## ✨ Completed Assignment Requirements

- ✅ **User Model & Registration**: Schema with name, email, password, role
- ✅ **Password Hashing**: Using bcryptjs (never plain-text)
- ✅ **Validation**: Unique emails, 6+ character passwords
- ✅ **Login & Session**: Email verification, password comparison, sessions
- ✅ **Cookies**: Express-session with MongoDB store
- ✅ **Dynamic UI**: Login/Register for guests, Logout/Profile for users
- ✅ **Protected Routes**: isLoggedIn middleware for authentication
- ✅ **RBAC**: isAdmin middleware for authorization
- ✅ **Admin Panel**: Protected /admin routes with access control
- ✅ **Flash Messages**: Success/error feedback throughout app
- ✅ **Test Data**: 6 seeded users with different roles

---

## 🎉 Installation Complete!

Your e-commerce platform now has a robust authentication and authorization system. Users can securely register, log in, and access role-based features!

For questions or issues, refer to the troubleshooting section above.
