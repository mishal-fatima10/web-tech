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

async function renderCategoryCatalog(req, res, options) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;
        const filter = { category: options.category };

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
        const products = await Product.find(filter)
            .sort({ name: 1 })
            .limit(limit)
            .skip(skip);

        res.render(options.viewName, {
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            categoryName: options.category,
            pageTitle: options.pageTitle,
            topBarText: options.topBarText,
            baseUrl: options.baseUrl,
            user: req.session.userId ? req.session : null
        });
    } catch (error) {
        console.log("Error fetching category products:", error);
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

// Session Configuration
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

// Flash Middleware
app.use(flash());

// Make user data available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? req.session : null;
  res.locals.messages = req.flash();
  next();
});

// Static files (CSS, JS, Images) serve karne ke liye
app.use(express.static("public"));

// Routes
app.get("/", function (req, res) {
    res.render("homepage");
});

app.get("/contact-us", function (req, res) {
    Product.find().sort({ createdAt: -1 }).limit(8)
        .then((featuredProducts) => {
            res.render("contact-us", { featuredProducts, user: req.session.userId ? req.session : null });
        })
        .catch((error) => {
            console.log("Error loading contact page products:", error);
            res.render("contact-us", { featuredProducts: [], user: req.session.userId ? req.session : null });
        });
});

app.get("/shop-by", async function (req, res) {
    await renderProductCatalog(req, res, "shop-by");
});

app.get("/unstitched-lawn", async function (req, res) {
    await renderCategoryCatalog(req, res, {
        viewName: "category-products",
        category: "Unstitched Lawn",
        pageTitle: "UNSTITCHED LAWN '26",
        topBarText: "UNSTITCHED LAWN '26",
        baseUrl: "/unstitched-lawn"
    });
});
// On-sale products (server renders all on-sale items; client paginates)
app.get('/onsale-products', async function (req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const filter = { isOnSale: true };

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

        const products = await Product.find(filter)
            .sort({ name: 1 })
            .limit(limit)
            .skip(skip);

        res.render('onsale', {
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            limit,
            user: req.session.userId ? req.session : null
        });
    } catch (error) {
        console.log('Error fetching on-sale products:', error);
        res.status(500).render('500', { user: res.locals.user, message: 'Error loading on-sale products' });
    }
});

app.get("/luxe-pret", async function (req, res) {
    await renderCategoryCatalog(req, res, {
        viewName: "category-products",
        category: "Luxe Pret",
        pageTitle: "LUXE PRET",
        topBarText: "LUXE PRET",
        baseUrl: "/luxe-pret"
    });
});

app.get("/formals", async function (req, res) {
    await renderCategoryCatalog(req, res, {
        viewName: "category-products",
        category: "Formals",
        pageTitle: "FORMALS",
        topBarText: "FORMALS",
        baseUrl: "/formals"
    });
});

app.get("/bridals", async function (req, res) {
    await renderCategoryCatalog(req, res, {
        viewName: "category-products",
        category: "Bridals",
        pageTitle: "BRIDALS",
        topBarText: "BRIDALS",
        baseUrl: "/bridals"
    });
});

// Products Route with Pagination, Filtering, and Searching
app.get("/products", async function (req, res) {
    await renderProductCatalog(req, res, "products");
});

// Cart page (frontend)
// Note: cart page removed — ordering is done via 'Order Now' -> confirm page

// Import Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");

// Use Routes
app.use(authRoutes);
app.use(adminRoutes);
// Mount API routes under /api/v1 to serve JSON for headless clients
app.use("/api/v1", apiRoutes);

// Cart page (client-side cart reads localStorage)
app.get('/cart', (req, res) => {
    res.render('cart', { user: req.session.userId ? req.session : null });
});

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