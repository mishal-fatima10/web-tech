# Lab Assignment 3 - Implementation Verification Checklist

## FINAL VERIFICATION - Ensure Everything is Ready

### ✅ TASK 1: User Model & Registration

**File: `models/User.js`**

- [ ] User schema created with fields:
  - [ ] `name` (String, required, trimmed)
  - [ ] `email` (String, required, unique, lowercase, validated)
  - [ ] `password` (String, required, minlength 6, select: false)
  - [ ] `role` (String, enum: ['customer', 'admin'], default: 'customer')
  - [ ] `createdAt` (Date, default: Date.now)

- [ ] Pre-save middleware implemented:
  - [ ] Checks if password is modified
  - [ ] Uses bcryptjs with 10 salt rounds
  - [ ] Hashes password before saving

- [ ] Instance method implemented:
  - [ ] `comparePassword(enteredPassword)` method exists
  - [ ] Uses bcryptjs.compare() to verify password

**File: `routes/auth.js`**

- [ ] GET /register route:
  - [ ] Renders 'register' template
  - [ ] Passes user data to template

- [ ] POST /register route:
  - [ ] Validates all fields present
  - [ ] Validates password confirmation matches
  - [ ] Validates password is at least 6 characters
  - [ ] Checks if email is unique in database
  - [ ] Creates new user (password auto-hashed)
  - [ ] Sets flash success message
  - [ ] Redirects to /login

---

### ✅ TASK 2: Session Setup & Login Logic

**File: `server.js` - Session Configuration**

- [ ] express-session middleware configured:
  - [ ] Secret stored in environment variable
  - [ ] resave: false
  - [ ] saveUninitialized: false
  - [ ] MongoStore configured with mongoUrl
  - [ ] touchAfter set for lazy session updates
  - [ ] Cookie settings: secure (false for dev, true for HTTPS)
  - [ ] Cookie settings: httpOnly true
  - [ ] Cookie settings: maxAge 24 hours

- [ ] connect-flash middleware:
  - [ ] Initialized AFTER express-session
  - [ ] No errors about "req.flash() requires sessions"

- [ ] Global middleware:
  - [ ] Checks req.session.userId
  - [ ] Sets res.locals.user with session data
  - [ ] Sets res.locals.messages from req.flash()
  - [ ] Makes user and messages available in all templates

**File: `routes/auth.js` - Login Routes**

- [ ] GET /login route:
  - [ ] Renders 'login' template
  - [ ] Passes user data to template

- [ ] POST /login route:
  - [ ] Validates email and password provided
  - [ ] Finds user by email with .select("+password")
  - [ ] Checks if user exists
  - [ ] Compares passwords using user.comparePassword()
  - [ ] Saves user data to session:
    - [ ] req.session.userId = user._id
    - [ ] req.session.name = user.name
    - [ ] req.session.email = user.email
    - [ ] req.session.role = user.role
  - [ ] Sets flash success message
  - [ ] Redirects admin to /admin, others to /

- [ ] GET /logout route:
  - [ ] Protected by isLoggedIn middleware
  - [ ] Renders logout confirmation page
  - [ ] Passes user data to template

- [ ] POST /logout-confirm route:
  - [ ] Protected by isLoggedIn middleware
  - [ ] Calls req.session.destroy()
  - [ ] Redirects to homepage

- [ ] GET /profile route:
  - [ ] Protected by isLoggedIn middleware
  - [ ] Renders profile page
  - [ ] Passes user data to template

---

### ✅ TASK 3: Dynamic Navigation Layout (EJS)

**File: `views/homepage.ejs` (and other template files)**

- [ ] Navigation header exists
- [ ] Conditional rendering for guest users:
  - [ ] Shows "Login" link when user is null/undefined
  - [ ] Shows "Register" link when user is null/undefined
  - [ ] Hides profile/logout links when not logged in

- [ ] Conditional rendering for logged-in users:
  - [ ] Shows "My Profile" link when user exists
  - [ ] Shows "Logout" link when user exists
  - [ ] Hides login/register links when logged in

- [ ] Admin-only conditional rendering:
  - [ ] Shows "Admin Panel" link ONLY if user AND user.role === 'admin'
  - [ ] Hides admin link from non-admin users

- [ ] Flash messages displayed:
  - [ ] Error messages shown if messages.error exists
  - [ ] Success messages shown if messages.success exists
  - [ ] Messages have close button or animation
  - [ ] Error messages have appropriate styling
  - [ ] Success messages have appropriate styling

---

### ✅ TASK 4: Protection Middleware & RBAC

**File: `middleware/auth.js`**

- [ ] isLoggedIn middleware:
  - [ ] Checks if req.session.userId exists
  - [ ] Calls next() if user is logged in
  - [ ] Sets flash error message if not logged in
  - [ ] Redirects to /login if not logged in

- [ ] isAdmin middleware:
  - [ ] Checks if req.session.userId exists
  - [ ] Checks if req.session.role === 'admin'
  - [ ] Calls next() if both conditions true
  - [ ] Sets flash error message if not admin
  - [ ] Redirects to / if not admin

**File: `routes/admin.js` (or wherever admin routes are)**

- [ ] Admin routes protected:
  - [ ] GET /admin has middleware: isLoggedIn, isAdmin
  - [ ] GET /admin/products has middleware: isLoggedIn, isAdmin
  - [ ] POST /admin/products has middleware: isLoggedIn, isAdmin
  - [ ] GET /admin/users has middleware: isLoggedIn, isAdmin
  - [ ] Any other admin routes have both middlewares

- [ ] Middleware application correct:
  - [ ] Middleware applied BEFORE route handler
  - [ ] Order: isLoggedIn first, then isAdmin
  - [ ] Syntax: router.get("/path", isLoggedIn, isAdmin, handler)

**File: `routes/auth.js` (Protected user routes)**

- [ ] User routes protected:
  - [ ] GET /profile has middleware: isLoggedIn
  - [ ] GET /logout has middleware: isLoggedIn
  - [ ] POST /logout-confirm has middleware: isLoggedIn

---

### ✅ DATABASE & CONFIGURATION

**File: `.env`**

- [ ] MONGODB_URI set
  - [ ] Correctly formatted MongoDB connection string
  - [ ] Database name specified

- [ ] SESSION_SECRET set
  - [ ] Strong random string (not "your_secret_key")
  - [ ] Different from production secret

**File: `package.json`**

- [ ] Dependencies installed:
  - [ ] bcryptjs
  - [ ] connect-flash
  - [ ] connect-mongo
  - [ ] express-session
  - [ ] mongoose
  - [ ] ejs
  - [ ] express

---

### ✅ TEMPLATE FILES

**File: `views/register.ejs`**

- [ ] Form with fields: name, email, password, passwordConfirm
- [ ] Form POSTs to /register
- [ ] Flash error messages displayed
- [ ] Flash success messages displayed

**File: `views/login.ejs`**

- [ ] Form with fields: email, password
- [ ] Form POSTs to /login
- [ ] Flash error messages displayed
- [ ] Flash success messages displayed
- [ ] Link to /register page

**File: `views/profile.ejs`**

- [ ] Displays user information:
  - [ ] User name
  - [ ] User email
  - [ ] User role
- [ ] Shows logout button/link
- [ ] Only visible to logged-in users

**File: `views/logout-confirm.ejs`**

- [ ] Shows logout confirmation message
- [ ] Displays user name being logged out
- [ ] Confirm button POSTs to /logout-confirm
- [ ] Cancel button goes back
- [ ] Only visible to logged-in users

**File: `views/admin-dashboard.ejs`**

- [ ] Shows admin panel content
- [ ] Only visible to admin users
- [ ] Links to product management
- [ ] Links to user management

---

### ✅ TESTING CHECKLIST

**Registration Testing**

- [ ] Test successful registration with valid data
- [ ] Test registration with missing fields
- [ ] Test registration with password < 6 characters
- [ ] Test registration with non-matching passwords
- [ ] Test registration with duplicate email
- [ ] Verify user created in MongoDB with hashed password
- [ ] Verify redirect to login with success message

**Login Testing**

- [ ] Test login with non-existent email
- [ ] Test login with correct email, wrong password
- [ ] Test login with correct email and password
- [ ] Verify session created in MongoDB
- [ ] Verify redirect for customer (to /)
- [ ] Verify redirect for admin (to /admin)
- [ ] Verify session persists after refresh

**Protected Routes Testing**

- [ ] Verify /profile not accessible without login
- [ ] Verify /profile accessible when logged in
- [ ] Verify /admin not accessible for customers
- [ ] Verify /admin accessible for admin users
- [ ] Verify error flash message when accessing protected route

**Navigation Testing**

- [ ] Verify guest sees "Login" and "Register" links
- [ ] Verify logged-in user sees "My Profile" and "Logout"
- [ ] Verify admin sees "Admin Panel" link
- [ ] Verify customer does NOT see "Admin Panel" link

**Logout Testing**

- [ ] Verify logout confirmation page shown
- [ ] Verify session destroyed after logout
- [ ] Verify user cannot access profile after logout
- [ ] Verify user can log in again after logout

**Flash Messages Testing**

- [ ] Error messages appear on registration errors
- [ ] Success messages appear on registration success
- [ ] Error messages appear on login failure
- [ ] Success messages appear on login success
- [ ] Messages disappear after page refresh (used once)

---

### ✅ SECURITY VERIFICATION

- [ ] Passwords are hashed with bcryptjs (not stored in plaintext)
- [ ] Session secrets stored in .env (not hardcoded)
- [ ] Session cookies have httpOnly: true (prevents XSS)
- [ ] Password field has select: false (not returned by default)
- [ ] Email is unique and validated
- [ ] Password minimum 6 characters enforced
- [ ] Role-based middleware prevents unauthorized access
- [ ] Sessions expire after 24 hours
- [ ] MongoDB automatically deletes expired sessions

---

### ✅ ERROR HANDLING

- [ ] All registration errors handled with try/catch
- [ ] All login errors handled with try/catch
- [ ] All admin route errors handled with try/catch
- [ ] Meaningful error messages displayed to users
- [ ] Errors logged to console for debugging
- [ ] Invalid email format rejected
- [ ] Duplicate email prevented

---

### ✅ FILE STRUCTURE

```
✓ Lab Assignment 3/
  ✓ models/
    ✓ User.js                (User schema with bcrypt)
    ✓ Product.js
  ✓ routes/
    ✓ auth.js                (Register/Login/Logout/Profile)
    ✓ admin.js               (Admin routes with RBAC)
  ✓ middleware/
    ✓ auth.js                (isLoggedIn, isAdmin)
  ✓ views/
    ✓ homepage.ejs           (Dynamic navigation)
    ✓ register.ejs           (Registration form)
    ✓ login.ejs              (Login form)
    ✓ profile.ejs            (User profile - protected)
    ✓ logout-confirm.ejs     (Logout confirmation)
    ✓ admin-dashboard.ejs    (Admin panel)
    ✓ admin-products.ejs     (Admin products - protected)
    ✓ admin-users.ejs        (Admin users - protected)
  ✓ server.js                (Express app with session config)
  ✓ package.json             (Dependencies)
  ✓ .env                     (Environment variables)
  ✓ public/
    ✓ css/
    ✓ js/
    ✓ uploads/
```

---

### ✅ DOCUMENTATION FILES CREATED

- [ ] AUTHENTICATION_IMPLEMENTATION_GUIDE.md (Complete guide)
- [ ] AUTHENTICATION_QUICK_REFERENCE.md (Quick lookup)
- [ ] COMPLETE_CODE_FILES.md (All code files)
- [ ] ARCHITECTURE_AND_FLOW_DIAGRAMS.md (Visual diagrams)
- [ ] IMPLEMENTATION_VERIFICATION_CHECKLIST.md (This file)

---

## TROUBLESHOOTING DURING TESTING

### Issue: "req.flash() requires sessions"
**Solution**: Verify flash() middleware comes AFTER session() in server.js
```javascript
app.use(session({...}));  // First
app.use(flash());         // Second
```

### Issue: Password always fails on login
**Solution**: Ensure .select("+password") is used when finding user
```javascript
const user = await User.findOne({ email }).select("+password");
```

### Issue: Session not persisting
**Solution**: Check MongoDB connection and MongoStore config
- Verify MONGODB_URI in .env
- Verify MongoStore has correct mongoUrl
- Check MongoDB is running

### Issue: Admin link always showing
**Solution**: Verify role comparison is lowercase 'admin'
```javascript
<% if (user && user.role === 'admin') { %>
```

### Issue: Flash messages not appearing
**Solution**: Verify flash middleware is initialized correctly
- Check order of middleware in server.js
- Verify res.locals.messages is set in global middleware
- Verify template displays messages

### Issue: User data not available in templates
**Solution**: Verify global middleware sets res.locals.user
```javascript
res.locals.user = req.session.userId ? {...} : null;
res.locals.messages = req.flash();
```

### Issue: Protected routes not redirecting
**Solution**: Verify middleware is applied correctly
```javascript
router.get("/admin", isLoggedIn, isAdmin, handler);
```

---

## QUICK START VERIFICATION

1. **Ensure all files exist:**
   ```bash
   ls models/User.js
   ls routes/auth.js
   ls middleware/auth.js
   ls .env
   ```

2. **Verify dependencies installed:**
   ```bash
   npm ls bcryptjs connect-flash connect-mongo express-session
   ```

3. **Test MongoDB connection:**
   ```bash
   # Verify MONGODB_URI in .env
   # Test with: mongosh mongodb://localhost:27017/sania-maskatiya
   ```

4. **Start server:**
   ```bash
   npm start
   ```

5. **Test registration:**
   - Visit http://localhost:3000/register
   - Submit form with valid data
   - Check MongoDB for new user

6. **Test login:**
   - Visit http://localhost:3000/login
   - Submit form with registered email/password
   - Verify session created in MongoDB

7. **Test protected routes:**
   - Try accessing /profile without login
   - Should redirect to /login

---

## FINAL CHECKLIST - System Ready When ALL Checked

- [ ] All code files created/updated
- [ ] All dependencies installed
- [ ] .env file configured
- [ ] MongoDB connection working
- [ ] Registration working
- [ ] Login working
- [ ] Session persistence working
- [ ] Flash messages displaying
- [ ] Navigation showing correct links
- [ ] Protected routes blocking unauthorized access
- [ ] Admin routes checking role
- [ ] Logout destroying session
- [ ] All error handling working
- [ ] All tests passing
- [ ] Security requirements met

---

**When all boxes are checked, your Lab Assignment 3 is complete and ready for submission!**

Good luck! 🎉
