# 🚀 Quick Start - Authentication System

## Install & Run (5 minutes)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Seed Test Users
```bash
npm run seed-users
```

You'll see:
```
✓ User seeding completed successfully!

📌 Login Credentials for Testing:
Admin Account:
  Email: admin@sania.com
  Password: admin123

Customer Account:
  Email: john@example.com
  Password: password123
```

### 3️⃣ Start Server
```bash
npm start
```

Server running at: `http://localhost:3000`

---

## 🧪 Test It Out

### As a Customer:
1. Go to `/login`
2. Enter: `john@example.com` / `password123`
3. You'll see: Profile & Logout options (no Admin Panel)

### As an Admin:
1. Go to `/login`
2. Enter: `admin@sania.com` / `admin123`
3. You'll see: Admin Panel link in navbar!
4. Click it to manage users

### Create New Account:
1. Go to `/register`
2. Fill in details and submit
3. Login with your new account
4. Access: profile, products, shops (all customer features)

---

## 📂 What Was Added

| File | Purpose |
|------|---------|
| `models/User.js` | User schema with password hashing |
| `routes/auth.js` | Login, register, logout, profile |
| `routes/admin.js` | Admin user management |
| `middleware/auth.js` | Protection middleware |
| `views/register.ejs` | Registration page |
| `views/login.ejs` | Login page |
| `views/profile.ejs` | User profile |
| `views/admin-*.ejs` | Admin pages |
| `seed-users.js` | Test data generator |

---

## 🔒 Key Features

✅ **Secure Authentication** - bcryptjs password hashing  
✅ **Session Management** - 24-hour persistent sessions  
✅ **Role-Based Access** - Admin vs Customer  
✅ **Dynamic Navbar** - Different links based on login status  
✅ **Flash Messages** - User feedback on every action  
✅ **Protected Routes** - Can't access admin without permission  

---

## ⚠️ Important

- MongoDB must be running (using MongoDB Atlas in your .env)
- Session Secret is in .env (change in production!)
- Admin routes protected by middleware
- Customers can register and create accounts
- Only admins can access `/admin`

---

## 📖 Full Documentation

See `AUTHENTICATION_SETUP.md` for:
- Detailed feature explanations
- Complete testing guide
- Troubleshooting help
- API reference
- Security features

---

**Ready?** Run `npm start` and test it out! 🎉
