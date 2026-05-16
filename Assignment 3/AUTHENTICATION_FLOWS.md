# 🔐 Authentication Flow Diagrams

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐         │
│  │ Register │  │  Login   │  │ Profile  │  │ Admin Panel  │         │
│  │ Page     │  │  Page    │  │ Page     │  │  (if admin)  │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘         │
│        ↓             ↓             ↓               ↓                 │
│        └─────────────┴─────────────┴───────────────┘                 │
│                        ↓                                              │
│                   Express Server                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │       Middleware Pipeline              │
         │  ┌──────────────────────────────────┐  │
         │  │ 1. Parse Request Body            │  │
         │  ├──────────────────────────────────┤  │
         │  │ 2. Load/Create Session           │  │
         │  ├──────────────────────────────────┤  │
         │  │ 3. Initialize Flash Messages     │  │
         │  ├──────────────────────────────────┤  │
         │  │ 4. Set res.locals (user, msgs)   │  │
         │  └──────────────────────────────────┘  │
         │              ↓                          │
         │  ┌──────────────────────────────────┐  │
         │  │   Route Handler / Middleware     │  │
         │  │  - isLoggedIn (optional)         │  │
         │  │  - isAdmin (optional)            │  │
         │  └──────────────────────────────────┘  │
         └────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │      Routes & Logic                    │
         │  ┌──────────────────────────────────┐  │
         │  │ POST /register → Create User     │  │
         │  ├──────────────────────────────────┤  │
         │  │ POST /login → Verify & Session   │  │
         │  ├──────────────────────────────────┤  │
         │  │ GET /profile → Show Profile      │  │
         │  ├──────────────────────────────────┤  │
         │  │ GET /logout → Destroy Session    │  │
         │  ├──────────────────────────────────┤  │
         │  │ GET/POST /admin/* → Admin Panel  │  │
         │  └──────────────────────────────────┘  │
         └────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │      Database (MongoDB)                │
         │  ┌──────────────────────────────────┐  │
         │  │ Users Collection                 │  │
         │  │ - name, email, password (hash)   │  │
         │  │ - role (customer/admin)          │  │
         │  ├──────────────────────────────────┤  │
         │  │ Sessions Collection (connect-mongo)
         │  │ - sessionId, userId, expires     │  │
         │  └──────────────────────────────────┘  │
         └────────────────────────────────────────┘
```

---

## Registration Flow

```
┌─────────────┐
│  User Visits│
│  /register  │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────────────────┐
│  View: register.ejs                                  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Form Fields:                                   │  │
│  │ - Full Name (text input)                       │  │
│  │ - Email (email input)                          │  │
│  │ - Password (password input, min 6 chars)       │  │
│  │ - Confirm Password (password input)            │  │
│  │ - Submit Button                                │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────┬─────────────────────────────────┘
                   │
                   ↓ (User fills form + submits)
                   │
            ┌──────────────────┐
            │ POST /register   │
            └────────┬─────────┘
                     │
       ┌─────────────┴──────────────────┐
       │                                │
       ↓ (Validation)                   │
┌──────────────────────────────────────────────────────┐
│ Validations:                                         │
│ ✓ All fields provided?                              │
│ ✓ Passwords match?                                  │
│ ✓ Password >= 6 chars?                              │
│ ✓ Email doesn't already exist?                      │
└────────────────┬─────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ↓ (Error)                 ↓ (Success)
┌──────────────────────┐   ┌──────────────────────────────┐
│ Flash Error Message  │   │ Hash Password with bcryptjs  │
│ Redirect to /register│   │ Create User in Database      │
└──────────────────────┘   └──────────────────┬───────────┘
                                              │
                                              ↓
                                   ┌──────────────────────────────┐
                                   │ Flash Success Message        │
                                   │ "User registered successfully│
                                   │  Please login."              │
                                   │ Redirect to /login           │
                                   └──────────────────────────────┘
```

---

## Login Flow

```
┌─────────────┐
│  User Visits│
│   /login    │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────┐
│  View: login.ejs             │
│  ┌──────────────────────────┐│
│  │ Form:                    ││
│  │ - Email (email input)    ││
│  │ - Password (pwd input)   ││
│  │ - Submit Button          ││
│  └──────────────────────────┘│
└──────────────┬───────────────┘
               │
               ↓ (User submits)
        ┌──────────────┐
        │ POST /login  │
        └────────┬─────┘
                 │
      ┌──────────┴────────────────┐
      │                           │
      ↓ (Verification)            │
┌──────────────────────────────────────────────┐
│ Step 1: Find user by email                   │
│ ├─ User not found?                           │
│ │  → Flash error: "Email not registered"     │
│ │  → Redirect to /login                      │
│ └─ User found? Continue...                   │
│                                              │
│ Step 2: Compare password with hash           │
│ ├─ Passwords match?                          │
│ │  → Flash error: "Invalid password"         │
│ │  → Redirect to /login                      │
│ └─ Match? Continue...                        │
│                                              │
│ Step 3: Create session & store user data     │
│ ├─ req.session.userId = user._id             │
│ ├─ req.session.name = user.name              │
│ ├─ req.session.email = user.email            │
│ └─ req.session.role = user.role              │
└────────┬──────────────────────────────────────┘
         │
         ↓ (All steps pass)
    ┌────────────────────────────────────────┐
    │ Flash Success Message                  │
    │ "Welcome back, [Name]!"                │
    │ Save Session to MongoDB                │
    │ Set Session Cookie (24h expiry)        │
    │ Redirect to /                          │
    └────────────────────────────────────────┘
         │
         ↓
    ┌──────────────────────────┐
    │ User back on homepage    │
    │ Navbar shows:            │
    │ ✓ My Profile             │
    │ ✓ Logout                 │
    │ ✓ Admin Panel (if admin) │
    └──────────────────────────┘
```

---

## Protected Route Access

```
┌────────────────────────────────────────────────────┐
│ User Tries to Access Protected Route               │
│ (e.g., /profile, /admin, /logout)                  │
└─────────────────────┬────────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ↓                     ↓
    ┌──────────────┐      ┌──────────────┐
    │ Middleware   │      │ Middleware   │
    │ isLoggedIn   │      │ isAdmin      │
    └──────┬───────┘      └──────┬───────┘
           │                     │
    ┌──────┴──────┐         ┌────┴────┐
    │             │         │         │
    ↓             ↓         ↓         ↓
┌───────┐   ┌──────────┐ ┌────┐  ┌────────┐
│Logged │   │Not logged│ │ Is │  │Not admin
│ in?  │   │   in?    │ │Admin
│      │   │          │ │?    │  │
└───┬───┘   └────┬─────┘ └─┬──┘  └────┬───┘
    │ YES        │ NO     YES    │ NO
    │            │              │
    ↓            ↓              ↓
 Continue    Flash Error:   Flash Error:
 to Route    "Please log    "Access
             in first"      Denied.
             Redirect to    Admin
             /login         access
                           required"
                           Redirect
                           to /
```

---

## Admin Panel Access Control

```
┌──────────────────────────────────────┐
│ Different Users Access /admin        │
└──────────────┬───────────────────────┘
               │
     ┌─────────┴────────────┬───────────┐
     │                      │           │
     ↓ (Not logged in)      ↓ (Customer)↓ (Admin)
┌──────────┐      ┌──────────────┐   ┌────────────┐
│ Redirect │      │ Flash Error: │   │ Dashboard  │
│ to       │      │ "Access      │   │ displays   │
│ /login   │      │ Denied"      │   │ with:      │
│ Flash:   │      │ Redirect to /│   │ - Users    │
│ "Please  │      │              │   │ - Products │
│ log in"  │      │              │   │ - Analytics
└──────────┘      └──────────────┘   │ - Settings │
                                      └────────────┘
```

---

## Session & Cookie Flow

```
┌─────────────────────┐
│ User Logs In        │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│ 1. Create Session Object                │
│    ├─ sessionId (unique)                │
│    ├─ userId                            │
│    ├─ name, email, role                 │
│    └─ createdAt, lastActivity           │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 2. Save to MongoDB (connect-mongo)      │
│    ├─ Collection: sessions              │
│    └─ Data: [session object above]      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 3. Set Session Cookie in Response       │
│    ├─ Name: connect.sid                 │
│    ├─ Value: sessionId (encrypted)      │
│    ├─ HttpOnly: true (JS can't access)  │
│    ├─ Path: /                           │
│    ├─ SameSite: Lax                     │
│    └─ Max-Age: 24 * 3600 seconds        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ Browser Stores Cookie                   │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┴────────────────────────┐
     │                                  │
     ↓ (Next Request)                   ↓ (After 24h)
┌──────────────────┐           ┌──────────────────┐
│ Browser sends    │           │ Cookie expires   │
│ cookie with      │           │ Session deleted  │
│ each request     │           │ from MongoDB     │
│                  │           │                  │
│ Server retrieves │           │ User must login  │
│ session from DB  │           │ again            │
│ User stays logged│           │                  │
└──────────────────┘           └──────────────────┘
```

---

## Data Model

### User Schema
```
User {
  _id: ObjectId (auto-generated)
  name: String (required)
  email: String (required, unique)
  password: String (bcrypt hashed, required)
  role: String (enum: ["customer", "admin"], default: "customer")
  createdAt: Date (default: now)
}
```

### Session Object (in req.session)
```
Session {
  userId: ObjectId
  name: String
  email: String
  role: String ("customer" | "admin")
  cookie: {
    originalMaxAge: 86400000 (24 hours in ms)
    expires: Date
    httpOnly: true
    path: "/"
  }
}
```

---

## Error Handling Flow

```
┌─────────────────────────────────┐
│ Error Occurs                    │
│ (validation, DB, etc.)          │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ 1. Log Error to Console                     │
│    console.log("Error:", error.message)     │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ 2. Set Flash Message                        │
│    req.flash("error", errorMessage)         │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ 3. Redirect to Previous Page                │
│    res.redirect("/register" or "/login")    │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ 4. Page Reloads                             │
│    Flash messages available in res.locals   │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ 5. EJS Template Displays Alert              │
│    <%= messages.error %>                    │
└─────────────────────────────────────────────┘
```

---

## Middleware Execution Order

```
Request arrives at Express
        ↓
1. Parse Body Middleware
   app.use(express.urlencoded())
        ↓
2. Session Middleware
   app.use(session({ ... }))
   └─ Loads session from MongoDB
   └─ Sets req.session
   └─ Sets session cookie
        ↓
3. Flash Middleware
   app.use(flash())
   └─ Initializes flash messages
        ↓
4. Custom Middleware (res.locals)
   app.use((req, res, next) => {
     res.locals.user = req.session.userId ? req.session : null
     res.locals.messages = req.flash()
   })
        ↓
5. Static Files Middleware
   app.use(express.static("public"))
        ↓
6. Route Handler / Protection Middleware
   └─ isLoggedIn (if applied)
   └─ isAdmin (if applied)
        ↓
7. Route Logic (Controller)
        ↓
8. Response Sent
```

---

## Complete User Journey

```
New User
   ↓
   ├─ Visit /register
   ├─ Fill form
   ├─ POST /register
   ├─ Password hashed ✓
   ├─ User saved to DB ✓
   ├─ Flash success message
   ├─ Redirect to /login
   │
   ├─ Visit /login
   ├─ Fill form
   ├─ POST /login
   ├─ Verify email ✓
   ├─ Compare password ✓
   ├─ Create session ✓
   ├─ Save session to DB ✓
   ├─ Set cookie ✓
   ├─ Flash "Welcome back"
   ├─ Redirect to /
   │
   ├─ Homepage loads
   ├─ Navbar shows: Profile, Logout
   ├─ Can access /profile ✓
   ├─ Can access /products ✓
   ├─ Cannot access /admin ✗ (not admin)
   │
   ├─ Click /logout
   ├─ POST /logout
   ├─ Destroy session
   ├─ Delete from DB
   ├─ Clear cookie
   ├─ Flash "Successfully logged out"
   ├─ Redirect to /
   │
   └─ Back to not logged in state

Admin User (Same flow + Admin Access)
   ├─ After login...
   ├─ Navbar shows: Profile, Logout, Admin Panel
   ├─ Can access /admin ✓
   ├─ Can access /admin/users ✓
   ├─ Can manage users (change role, delete)
   └─ All admin routes protected
```

---

These diagrams show how all the authentication components work together to create a secure, user-friendly authentication system! 🔐
