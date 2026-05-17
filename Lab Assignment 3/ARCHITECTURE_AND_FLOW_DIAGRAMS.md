# Authentication System - Visual Architecture & Flow Diagrams

## 1. Authentication Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                            │
│  - User visits /register, /login, /profile                     │
│  - Fills forms with email/password                             │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│              EXPRESS.JS SERVER (server.js)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Middleware Stack (Order matters!)                       │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  1. Body Parser     (urlencoded, JSON)                  │ │
│  │  2. Session         (express-session)                   │ │
│  │  3. Flash Messages  (connect-flash)                     │ │
│  │  4. Global Middleware (set res.locals)                  │ │
│  │  5. Static Files    (public folder)                     │ │
│  │  6. Routes          (auth, admin, etc.)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Route Protection                                        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  POST /register   → No protection                       │ │
│  │  POST /login      → No protection                       │ │
│  │  GET /logout      → isLoggedIn middleware               │ │
│  │  GET /profile     → isLoggedIn middleware               │ │
│  │  GET /admin       → isLoggedIn + isAdmin middleware     │ │
│  │  POST /admin/*    → isLoggedIn + isAdmin middleware     │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                             │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  users          │         │  sessions        │            │
│  ├──────────────────┤         ├──────────────────┤            │
│  │  _id            │         │  _id             │            │
│  │  name           │         │  sessionData     │            │
│  │  email          │         │  expires (TTL)   │            │
│  │  password       │         │  ...             │            │
│  │  role           │         └──────────────────┘            │
│  │  createdAt      │                                          │
│  └──────────────────┘                                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Registration Flow Diagram

```
START USER REGISTRATION
        ↓
    [User submits form]
    /register (POST)
        ↓
    ┌─────────────────────────────┐
    │ Validate all fields present?│
    └──────────┬──────────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "All fields required"
              → Redirect to /register
              ↓
    [User fills missing fields]
        ↓
    ┌──────────────────────────┐
    │ Passwords match?         │
    └──────────┬───────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Passwords don't match"
              → Redirect to /register
              ↓
    [User corrects password]
        ↓
    ┌──────────────────────────┐
    │ Password >= 6 chars?     │
    └──────────┬───────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Min 6 characters"
              → Redirect to /register
              ↓
    [User makes password longer]
        ↓
    ┌──────────────────────────┐
    │ Email unique in DB?      │
    └──────────┬───────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Email already in use"
              → Redirect to /register
              ↓
    [User uses different email]
        ↓
    ┌──────────────────────────────────────┐
    │ CREATE USER IN DATABASE              │
    │ - Hash password with bcryptjs        │
    │ - Validate email format              │
    │ - Set role = 'customer' (default)    │
    └──────────┬───────────────────────────┘
              ↓
    ✓ User saved successfully
              ↓
    Flash: "User registered! Please login."
              ↓
    Redirect to /login
              ↓
    [User sees registration success]
        ↓
    END USER REGISTRATION
```

---

## 3. Login Flow Diagram

```
START USER LOGIN
        ↓
    [User submits form]
    /login (POST)
        ↓
    ┌─────────────────────────────┐
    │ Email & password provided?  │
    └──────────┬──────────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Email and password required"
              → Redirect to /login
              ↓
    [User fills missing fields]
        ↓
    ┌──────────────────────────────────┐
    │ Find user by email in database?  │
    │ (with .select("+password"))      │
    └──────────┬───────────────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Email not registered"
              → Redirect to /login
              ↓
    [User uses correct email]
        ↓
    ┌──────────────────────────────────┐
    │ Compare password using bcryptjs? │
    │ bcrypt.compare(entered, hashed)  │
    └──────────┬───────────────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Invalid password"
              → Redirect to /login
              ↓
    [User enters correct password]
        ↓
    ┌──────────────────────────────────────┐
    │ SAVE USER INFO TO SESSION            │
    │ req.session.userId = user._id        │
    │ req.session.name = user.name         │
    │ req.session.email = user.email       │
    │ req.session.role = user.role         │
    │                                      │
    │ SESSION STORED IN MONGODB            │
    └──────────┬───────────────────────────┘
              ↓
    ✓ Session saved successfully
              ↓
    Flash: "Welcome back, [name]!"
              ↓
    ┌──────────────────────┐
    │ Check user role      │
    └──────────┬───────────┘
              / \
            /     \
        ADMIN   CUSTOMER
          ↓         ↓
    Redirect    Redirect
    to /admin   to /
        ↓         ↓
    [User sees   [User sees
     admin       homepage]
     dashboard]
        ↓
    END USER LOGIN
```

---

## 4. Route Protection Flow Diagram

```
USER REQUESTS PROTECTED ROUTE
        ↓
    [GET /profile]
        ↓
    MIDDLEWARE CHECK: isLoggedIn
        ↓
    ┌──────────────────────────┐
    │ req.session.userId       │
    │ exists?                  │
    └──────────┬───────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Please log in first"
              ↗ Redirect to /login
              ↓
    [User sees login form]
              ↓
    [User logs in]
              ↓
    [Try again with session]
        ↓
    SESSION EXISTS
        ↓
    → NEXT MIDDLEWARE/ROUTE HANDLER
        ↓
    Render /profile page
        ↓
    ✓ User sees their profile



ADMIN ROUTE PROTECTION (More Strict)
        ↓
    [GET /admin]
        ↓
    MIDDLEWARE CHECK: isLoggedIn
        ↓
    ┌──────────────────────┐
    │ Session exists?      │
    └──────────┬───────────┘
              / \
        YES   NO
          ↓     ↓
        ✓    → Redirect to /login
              ↓
    Continue to next middleware: isAdmin
        ↓
    ┌──────────────────────────────┐
    │ req.session.role             │
    │ === 'admin'?                 │
    └──────────┬────────────────────┘
              / \
            /     \
          YES     NO
          ↓       ↓
        ✓      ✗ Flash: "Access Denied"
              ↗ Redirect to /
              ↓
    [User sees homepage]
        ↓
    NO ADMIN ACCESS
        ↓
    → NEXT ROUTE HANDLER
        ↓
    Render admin dashboard
        ↓
    ✓ Admin sees dashboard
```

---

## 5. Session Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           SESSION LIFECYCLE IN MONGODB                       │
└─────────────────────────────────────────────────────────────┘

USER LOGS IN
    ↓
req.session.destroy() not called yet
    ↓
┌─────────────────────────────────────┐
│ SESSION CREATED IN MONGODB          │
│                                     │
│ {                                   │
│   _id: sessionId,                   │
│   session: {                        │
│     userId: user._id,               │
│     name: "John",                   │
│     email: "john@example.com",      │
│     role: "customer"                │
│   },                                │
│   expires: Date (24h from now)      │
│ }                                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ SESSION COOKIE SENT TO BROWSER      │
│                                     │
│ Set-Cookie: connect.sid = [id]     │
│ Path: /                             │
│ HttpOnly: true (secure)             │
│ Max-Age: 24h                        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ USER MAKES REQUESTS                 │
│                                     │
│ Each request includes:              │
│ Cookie: connect.sid = [id]          │
│                                     │
│ Server checks: Is session valid?    │
│ ✓ Yes → Load session data           │
│ ✗ No → Session expired/invalid      │
└─────────────────────────────────────┘
    ↓
    Every 24 hours (or before):
        ↓
    ┌──────────────────────────────────┐
    │ SESSION EXPIRES IN MONGODB       │
    │ TTL Index: 24 * 3600 seconds     │
    │                                  │
    │ MongoDB automatically deletes    │
    │ expired sessions from DB         │
    └──────────────────────────────────┘
        ↓
USER LOGS OUT (Manual)
    OR
SESSION EXPIRES (Automatic)
    ↓
req.session.destroy((err) => {})
    ↓
┌──────────────────────────────────────┐
│ SESSION DELETED FROM MONGODB         │
│                                      │
│ 1. Session document removed          │
│ 2. Cookie cleared in browser         │
│ 3. User is no longer authenticated   │
└──────────────────────────────────────┘
    ↓
USER NEEDS TO LOGIN AGAIN
```

---

## 6. Data Flow: User Registration to Database

```
USER INPUT
    ↓
┌─────────────────────────────────┐
│ Browser Form Submission         │
│ POST /register                  │
│                                 │
│ {                               │
│   name: "John Doe",             │
│   email: "john@example.com",    │
│   password: "password123",      │
│   passwordConfirm: "password123"│
│ }                               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ SERVER VALIDATION               │
│ routes/auth.js POST /register   │
│                                 │
│ - All fields provided?          │
│ - Passwords match?              │
│ - Password >= 6 chars?          │
│ - Email unique?                 │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ CREATE USER OBJECT              │
│ new User({...})                 │
│                                 │
│ {                               │
│   name: "John Doe",             │
│   email: "john@example.com",    │
│   password: "password123"       │
│ }                               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ PRE-SAVE MIDDLEWARE             │
│ userSchema.pre("save", async)   │
│                                 │
│ 1. Check if password modified   │
│ 2. Generate salt (bcrypt)       │
│ 3. Hash password:               │
│    "password123" → "$2a$10$..." │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ SAVE TO MONGODB                 │
│ user.save()                     │
│                                 │
│ db.users.insertOne({            │
│   name: "John Doe",             │
│   email: "john@example.com",    │
│   password: "$2a$10$...",       │
│   role: "customer",             │
│   createdAt: Date               │
│ })                              │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ SET FLASH MESSAGE               │
│ req.flash("success", "...")     │
│                                 │
│ Message stored in session       │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ REDIRECT                        │
│ res.redirect("/login")          │
│                                 │
│ HTTP 302 redirect               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ BROWSER NAVIGATION              │
│ GET /login                      │
│                                 │
│ Flash message displayed:        │
│ "User registered successfully!" │
└─────────────────────────────────┘
```

---

## 7. Password Hashing & Comparison

```
┌──────────────────────────────────────────────────────────────┐
│                 PASSWORD HASHING PROCESS                      │
└──────────────────────────────────────────────────────────────┘

REGISTRATION:
    User enters: "password123"
            ↓
    bcrypt.genSalt(10)
    ↓
    Creates random salt: "$2a$10$..."
    ↓
    bcrypt.hash("password123", salt)
    ↓
    Hash result: "$2a$10$K.VZKDr0RsOcWEfhH0UFXO..."
    ↓
    Store in DB: password: "$2a$10$K.VZKDr0RsOcWEfhH0UFXO..."
    
    
LOGIN:
    User enters: "password123"
            ↓
    Retrieve from DB: "$2a$10$K.VZKDr0RsOcWEfhH0UFXO..."
            ↓
    bcrypt.compare("password123", "$2a$10$K.VZKDr0RsOcWEfhH0UFXO...")
            ↓
    Internally:
    1. Extract salt from stored hash
    2. Hash entered password with same salt
    3. Compare results
            ↓
    Return: true (password matches)
            ↓
    User logged in successfully


SECURITY BENEFITS:

✓ One-way hashing (cannot reverse hash to get password)
✓ Salt prevents rainbow table attacks
✓ Multiple users can have same password, different hashes
✓ Slow hashing algorithm (10 rounds = resistance to brute force)
```

---

## 8. Template Variable Availability

```
┌─────────────────────────────────────────────────────────────┐
│        GLOBAL MIDDLEWARE → res.locals                         │
└─────────────────────────────────────────────────────────────┘

app.use((req, res, next) => {
  // Check if logged in
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

  // Flash messages
  res.locals.messages = req.flash();
  
  next();
});

        ↓
    
    AVAILABLE IN ALL EJS TEMPLATES:
        ↓
    ┌──────────────────────────────────┐
    │ res.locals.user                  │
    ├──────────────────────────────────┤
    │ null (if not logged in)          │
    │ OR                               │
    │ {                                │
    │   userId: "123...",              │
    │   name: "John Doe",              │
    │   email: "john@example.com",     │
    │   role: "customer"               │
    │ }                                │
    └──────────────────────────────────┘
    
    ┌──────────────────────────────────┐
    │ res.locals.messages              │
    ├──────────────────────────────────┤
    │ {                                │
    │   error: ["Error msg 1", ...],   │
    │   success: ["Success msg", ...]  │
    │ }                                │
    └──────────────────────────────────┘


USAGE IN TEMPLATES:
        ↓
    <% if (user) { %>
      <p>Hello, <%= user.name %>!</p>
    <% } %>
    
    <% if (messages.error) { %>
      <% messages.error.forEach(msg => { %>
        <div><%= msg %></div>
      <% }) %>
    <% } %>
```

---

## 9. Middleware Execution Order

```
┌──────────────────────────────────────────────────────────────┐
│              SERVER REQUEST PROCESSING ORDER                  │
└──────────────────────────────────────────────────────────────┘

USER REQUEST
    ↓
1. Express.urlencoded()
   (Parse form data)
    ↓
2. Express.json()
   (Parse JSON body)
    ↓
3. express-session
   (Load session from MongoDB)
   Session data: req.session.userId, req.session.name, etc.
    ↓
4. connect-flash
   (Initialize req.flash() function)
   MUST BE AFTER SESSION!
    ↓
5. Global Middleware
   (Set res.locals.user and res.locals.messages)
    ↓
6. Express.static()
   (Serve CSS, JS, images from /public)
    ↓
7. Route Handlers
   
   a) If route has NO middleware:
      POST /register → Direct to handler
      
   b) If route has middleware:
      GET /profile (isLoggedIn middleware)
      ↓
      isLoggedIn checks req.session.userId
      ↓
      If valid: → continue to route handler
      If invalid: → redirect to /login
      
   c) If route has MULTIPLE middleware:
      GET /admin (isLoggedIn, then isAdmin)
      ↓
      isLoggedIn checks req.session.userId
      ↓
      If valid: → continue to isAdmin
      If invalid: → redirect to /login
      ↓
      isAdmin checks req.session.role === 'admin'
      ↓
      If admin: → continue to route handler
      If not admin: → redirect to /
    ↓
8. Route Handler Executes
   res.render("template", data)
    ↓
9. EJS Template Rendered
   All res.locals variables available
    ↓
10. Response Sent to Browser
    
    ↓
    
END OF REQUEST CYCLE
```

---

## 10. Error Handling Flow

```
ERROR OCCURS IN ROUTE HANDLER
    ↓
    try {
      // some code throws error
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("/register");
      // User redirected with error message
    }
    ↓
┌──────────────────────────────────────┐
│ REDIRECT WITH FLASH MESSAGE          │
│ res.redirect("/register")            │
│                                      │
│ Flash message stored in session      │
│ HTTP 302 redirect                    │
└──────────────────────────────────────┘
    ↓
USER BROWSER NAVIGATES TO /register
    ↓
req.flash() returns stored message
    ↓
messages.error available in template
    ↓
<% if (messages.error) { %>
  <div class="alert"><%= messages.error %></div>
<% } %>
    ↓
USER SEES ERROR MESSAGE
    ↓
Flash message automatically cleared from session
(Only shown once, then deleted)
```

---

## 11. Complete Authentication State Machine

```
                          ┌─────────────────┐
                          │   UNAUTHENTICATED
                          │   (No session)  │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ↓              ↓              ↓
              Navigate      Navigate        Visit
              /login        /register       protected
                    │              │        route (e.g.
                    │              │        /profile)
                    │              │              │
                    │              ↓              │
                    │         Fill form           │
                    │         Validate            │
                    │         Create user         │
                    │         Hash password       │
                    │         Save to DB          │
                    │              │              ↓
                    ↓              ↓        Redirect
              Fill form    Redirect        to /login
              Validate      /login
              Find user         │
              Check password    │
              Save session      │
                    │           │
                    └─────┬─────┘
                          │
                          ↓
                    ┌─────────────────┐
                    │  AUTHENTICATED  │
                    │ (Session exists)│
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ↓                 ↓                 ↓
    Browse allowed    Visit /admin        Click
    routes freely     (role check)        logout
           │                 │                 │
           │        ┌────────┴────────┐       │
           │        │                 │       │
           │   role =        role !=  │       │
           │   'admin'?      'admin'? │       │
           │   │                 │    │       │
           │   ↓                 ↓    │       │
           │  Render         Redirect │       │
           │  admin          to / with│       │
           │  dashboard      error    │       │
           │   │                      │       │
           │   │                      │       ↓
           │   │                      │  Destroy
           │   │                      │  session
           │   │                      │  Clear
           │   │                      │  cookie
           │   │                      │   │
           └───┴──────────────────────┴───┘
                          ↓
                    ┌─────────────────┐
                    │   UNAUTHENTICATED
                    │   (Session gone)│
                    └─────────────────┘
```

These diagrams provide a visual understanding of how all components work together!
