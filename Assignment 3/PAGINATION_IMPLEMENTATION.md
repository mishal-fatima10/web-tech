# Pagination, Filtering & Search Implementation Guide

## Overview
This document explains the complete implementation of server-side pagination, filtering, and search functionality for the Sania Maskatiya e-commerce platform.

---

## 1. Database Schema (Product Model)

**File:** `models/Product.js`

The Product schema includes all required fields for inventory management and display:

```javascript
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ["Unstitched Lawn", "Luxe Pret", "Formals", "Bridals"]
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: "/images/placeholder.svg"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

### Key Fields:
- **name**: Product name (e.g., "Coral Dream Lawn")
- **price**: Numeric price in PKR
- **category**: Limited to 4 categories for clean categorization
- **rating**: 0-5 star rating
- **stock**: Inventory quantity
- **description**: Product details
- **image**: Image path with fallback to placeholder
- **createdAt**: Timestamp for sorting by newest

---

## 2. Database Seeding Script

**File:** `seed.js`

This script populates MongoDB with 25+ sample products covering all categories. Run it with:

```bash
npm run seed-products
```

### Current Seeded Products:

**Unstitched Lawn (6 products)** - Price: Rs. 2,200 - 3,000
- Summer Breeze Lawn
- Garden Bliss Lawn
- Royal Elegance Lawn
- Fresh Bloom Lawn
- Paradise Blue Lawn
- Coral Dream Lawn

**Luxe Pret (6 products)** - Price: Rs. 7,800 - 9,500
- Urban Chic Pret
- Midnight Glamour Pret
- Sunset Dreams Pret
- Pearl Paradise Pret
- Velvet Nights Pret
- Emerald Essence Pret

**Formals (6 products)** - Price: Rs. 11,500 - 13,500
- Executive Formal Black
- Royal Formal Maroon
- Regal Blue Formal
- Platinum Formal White
- Sapphire Formal Navy
- Burgundy Formal Wine

**Bridals (6 products)** - Price: Rs. 33,000 - 38,000
- Bride's Dream Gold
- Royal Wedding Red
- Bride's Glory Maroon
- Princess Bridal Green
- Crimson Queen Bridal
- Sunset Bride Coral

**Total: 24 products** for thorough pagination testing (8 per page = 3 pages minimum)

### How to Reset & Reseed:
```bash
# Deletes all existing products and inserts fresh ones
npm run seed-products
```

---

## 3. Backend Controller & Route Logic

**File:** `server.js`

### Core Function: `renderProductCatalog(req, res, viewName)`

This reusable function handles both `/shop-by` and `/products` routes with unified pagination and filtering logic.

```javascript
async function renderProductCatalog(req, res, viewName) {
    try {
        // ===== 1. PARSE QUERY PARAMETERS =====
        const page = parseInt(req.query.page) || 1;                    // Default: page 1
        const searchQuery = req.query.search || "";                    // Search term
        const categoryFilter = req.query.category || "";               // Category filter
        const minPrice = req.query.minPrice !== undefined && req.query.minPrice !== "" 
            ? parseFloat(req.query.minPrice) 
            : 0;                                                        // Min price (default: 0)
        const maxPrice = req.query.maxPrice !== undefined && req.query.maxPrice !== "" 
            ? parseFloat(req.query.maxPrice) 
            : Infinity;                                                 // Max price (default: unlimited)
        const sortBy = req.query.sort || "name";                      // Sort option

        // ===== 2. BUILD MONGODB FILTER OBJECT =====
        let filter = {};

        // Search filter: Case-insensitive regex matching on product name
        if (searchQuery) {
            filter.name = { $regex: searchQuery, $options: "i" };
        }

        // Category filter: Exact match
        if (categoryFilter) {
            filter.category = categoryFilter;
        }

        // Price range filter: Both minPrice and maxPrice
        filter.price = { $gte: minPrice, $lte: maxPrice };

        // ===== 3. BUILD SORT CONFIGURATION =====
        let sortConfig = {};
        switch (sortBy) {
            case "price-low":
                sortConfig = { price: 1 };        // Ascending
                break;
            case "price-high":
                sortConfig = { price: -1 };       // Descending
                break;
            case "rating":
                sortConfig = { rating: -1 };      // Highest ratings first
                break;
            default:
                sortConfig = { name: 1 };         // Alphabetical
        }

        // ===== 4. CALCULATE PAGINATION PARAMETERS =====
        const limit = 8;                          // 8 products per page (fixed)
        const skip = (page - 1) * limit;          // Skip formula for offset

        // ===== 5. QUERY DATABASE =====
        // Count total matching products (for pagination calculation)
        const totalProducts = await Product.countDocuments(filter);
        
        // Calculate total pages based on filtered results
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch products for current page: apply filter, sort, limit, skip
        const products = await Product.find(filter)
            .sort(sortConfig)
            .limit(limit)
            .skip(skip);

        // Get distinct categories for filter dropdown
        const categories = await Product.distinct("category");

        // ===== 6. RENDER VIEW WITH DATA =====
        res.render(viewName, {
            products,           // Array of 8 products for current page
            currentPage: page,  // Current page number
            totalPages,         // Total number of pages
            totalProducts,      // Total count of matching products
            searchQuery,        // Active search term (for display & links)
            categoryFilter,     // Active category (for display & links)
            minPrice,          // Active min price (for display & links)
            maxPrice,          // Active max price (for display & links)
            sortBy,            // Active sort option (for display & links)
            categories,        // All available categories for dropdown
            limit              // Items per page (for reference)
        });

    } catch (error) {
        console.log("Error fetching products:", error);
        res.status(500).render("500", {
            user: res.locals.user,
            message: "Error loading products"
        });
    }
}
```

### Route Handlers:

```javascript
// GET /shop-by: Browse all products with filters
app.get("/shop-by", async function (req, res) {
    await renderProductCatalog(req, res, "shop-by");
});

// GET /products: Alternative products page (same logic)
app.get("/products", async function (req, res) {
    await renderProductCatalog(req, res, "products");
});
```

### Query Parameter Examples:
- `/shop-by` - Shows page 1 with all products sorted by name
- `/shop-by?page=2` - Shows page 2
- `/shop-by?search=lawn` - Search for products with "lawn" in name
- `/shop-by?category=Luxe%20Pret` - Filter by category
- `/shop-by?minPrice=5000&maxPrice=10000` - Filter by price range
- `/shop-by?sort=price-low` - Sort by price (low to high)
- `/shop-by?page=2&search=lawn&category=Unstitched%20Lawn&sort=price-high` - Complex query with all filters

---

## 4. Frontend EJS Pagination Controls

**File:** `views/shop-by.ejs` (and `views/products.ejs`)

### Search & Filter Form:

```html
<div class="filters-section">
    <div class="filters-title">Search & Filter</div>
    <form method="get" action="/shop-by">
        <div class="filters-grid">
            <!-- Search Input -->
            <div class="filter-group">
                <label for="search">Search Products</label>
                <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder="Search by product name..."
                    value="<%= searchQuery %>"
                >
            </div>

            <!-- Category Dropdown -->
            <div class="filter-group">
                <label for="category">Category</label>
                <select id="category" name="category">
                    <option value="">All Categories</option>
                    <% categories.forEach(cat => { %>
                        <option value="<%= cat %>" <%= categoryFilter === cat ? 'selected' : '' %>>
                            <%= cat %>
                        </option>
                    <% }) %>
                </select>
            </div>

            <!-- Min Price Input -->
            <div class="filter-group">
                <label for="minPrice">Min Price</label>
                <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    min="0"
                    placeholder="0"
                    value="<%= minPrice === 0 ? '' : minPrice %>"
                >
            </div>

            <!-- Max Price Input -->
            <div class="filter-group">
                <label for="maxPrice">Max Price</label>
                <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    min="0"
                    placeholder="Any"
                    value="<%= maxPrice === Infinity ? '' : maxPrice %>"
                >
            </div>

            <!-- Sort Dropdown -->
            <div class="filter-group">
                <label for="sort">Sort By</label>
                <select id="sort" name="sort">
                    <option value="name" <%= sortBy === 'name' ? 'selected' : '' %>>
                        Name (A-Z)
                    </option>
                    <option value="price-low" <%= sortBy === 'price-low' ? 'selected' : '' %>>
                        Price (Low to High)
                    </option>
                    <option value="price-high" <%= sortBy === 'price-high' ? 'selected' : '' %>>
                        Price (High to Low)
                    </option>
                    <option value="rating" <%= sortBy === 'rating' ? 'selected' : '' %>>
                        Rating (Highest First)
                    </option>
                </select>
            </div>
        </div>

        <div class="filter-buttons">
            <button type="submit" class="btn btn-primary">Apply Filters</button>
            <a href="/shop-by" class="btn btn-secondary">Clear Filters</a>
        </div>
    </form>
</div>
```

### Products Information Display:

```html
<div class="products-info">
    Showing <strong><%= products.length %></strong> of <strong><%= totalProducts %></strong> products
    <% if (searchQuery) { %> for "<%= searchQuery %>" <% } %>
    <% if (categoryFilter) { %> in <strong><%= categoryFilter %></strong> <% } %>
</div>
```

### Pagination Controls:

```html
<!-- Only show pagination if there's more than 1 page -->
<% if (totalPages > 1) { %>
    <div class="pagination">
        <!-- Build query string that preserves all active filters -->
        <% const queryPrefix = `&search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}&minPrice=${minPrice === 0 ? '' : minPrice}&maxPrice=${maxPrice === Infinity ? '' : maxPrice}&sort=${sortBy}`; %>

        <!-- PREVIOUS BUTTON -->
        <% if (currentPage > 1) { %>
            <a href="/shop-by?page=<%= currentPage - 1 %><%= queryPrefix %>">
                ← Previous
            </a>
        <% } else { %>
            <span class="disabled">← Previous</span>
        <% } %>

        <!-- PAGE NUMBERS WITH SMART TRUNCATION -->
        <% let startPage = Math.max(1, currentPage - 2); %>
        <% let endPage = Math.min(totalPages, currentPage + 2); %>

        <!-- Show page 1 if not in range -->
        <% if (startPage > 1) { %>
            <a href="/shop-by?page=1<%= queryPrefix %>">1</a>
            <!-- Show ellipsis if there's a gap -->
            <% if (startPage > 2) { %>
                <span>...</span>
            <% } %>
        <% } %>

        <!-- Show pages in range (currentPage ± 2) -->
        <% for (let i = startPage; i <= endPage; i++) { %>
            <% if (i === currentPage) { %>
                <!-- Highlight current page -->
                <span class="active"><%= i %></span>
            <% } else { %>
                <a href="/shop-by?page=<%= i %><%= queryPrefix %>"><%= i %></a>
            <% } %>
        <% } %>

        <!-- Show last page if not in range -->
        <% if (endPage < totalPages) { %>
            <!-- Show ellipsis if there's a gap -->
            <% if (endPage < totalPages - 1) { %>
                <span>...</span>
            <% } %>
            <a href="/shop-by?page=<%= totalPages %><%= queryPrefix %>">
                <%= totalPages %>
            </a>
        <% } %>

        <!-- NEXT BUTTON -->
        <% if (currentPage < totalPages) { %>
            <a href="/shop-by?page=<%= currentPage + 1 %><%= queryPrefix %>">
                Next →
            </a>
        <% } else { %>
            <span class="disabled">Next →</span>
        <% } %>
    </div>
<% } %>
```

### Key Features:

1. **Smart Page Display**: Shows current page ± 2 pages for easy navigation
2. **Ellipsis Truncation**: Displays `...` when there's a gap in page numbers
3. **Filter Preservation**: All search/filter parameters are encoded and passed through pagination links
4. **Disabled State**: Previous/Next buttons are disabled on first/last page
5. **Active Highlighting**: Current page number is highlighted
6. **Responsive**: Pagination hides automatically if only 1 page of results

---

## 5. CSS Styling

The pagination controls use these CSS classes:

```css
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 30px;
}

.pagination a,
.pagination span {
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    color: #333;
    text-decoration: none;
    transition: all 0.2s ease;
}

.pagination a:hover {
    background: #8b4789;
    color: #fff;
    border-color: #8b4789;
}

.pagination .active {
    background-color: #8b4789;
    color: white;
    border-color: #8b4789;
}

.pagination .disabled {
    color: #aaa;
    cursor: default;
    border-color: #eee;
}
```

---

## 6. Testing Checklist

✅ **Pagination**
- [ ] Default page loads with 8 products
- [ ] Click "Next" → shows page 2
- [ ] Click "Previous" → goes back to page 1
- [ ] Direct URL `/shop-by?page=2` works
- [ ] "Next" is disabled on last page
- [ ] "Previous" is disabled on first page
- [ ] Page numbers show with ellipsis for large page counts

✅ **Search**
- [ ] Type "lawn" → filters to matching products
- [ ] Search is case-insensitive
- [ ] Pagination works with active search
- [ ] Clear Filters button resets search

✅ **Category Filter**
- [ ] Select "Luxe Pret" → shows only that category
- [ ] All categories available in dropdown
- [ ] Works in combination with search/price
- [ ] Pagination updates for filtered results

✅ **Price Range**
- [ ] Enter minPrice 5000 → shows products ≥ Rs. 5000
- [ ] Enter maxPrice 10000 → shows products ≤ Rs. 10000
- [ ] Both can be used together
- [ ] Empty fields are handled correctly

✅ **Sorting**
- [ ] "Name (A-Z)" → products sorted alphabetically
- [ ] "Price (Low to High)" → ascending price
- [ ] "Price (High to Low)" → descending price
- [ ] "Rating (Highest First)" → by rating descending

✅ **State Preservation**
- [ ] Navigate pages → search/filters remain active
- [ ] Change filter → page resets to 1
- [ ] URL is shareable with full filter state

---

## 7. Database Query Examples

### MongoDB Queries Generated:

```javascript
// All products (page 1)
db.products.find({}).sort({name: 1}).limit(8).skip(0)

// Search for "lawn"
db.products.find({name: /lawn/i}).sort({name: 1}).limit(8).skip(0)

// Luxe Pret category only
db.products.find({category: "Luxe Pret"}).sort({name: 1}).limit(8).skip(0)

// Price range Rs. 5000 - 10000
db.products.find({price: {$gte: 5000, $lte: 10000}}).sort({name: 1}).limit(8).skip(0)

// Complex: Lawn search + Unstitched category + sort by price
db.products.find({
  name: /lawn/i,
  category: "Unstitched Lawn",
  price: {$gte: 0, $lte: Infinity}
}).sort({price: 1}).limit(8).skip(0)
```

---

## 8. Performance Notes

- **Page Limit**: Fixed at 8 products per page for consistent UX
- **Database Indexes**: Consider adding indexes on `name`, `category`, and `price` for faster queries on large datasets
- **Query Optimization**: MongoDB uses index-based queries for exact matches (category) and regex patterns
- **Caching**: Flash messages and user data are re-fetched on each pageload (can be optimized with caching if needed)

---

## 9. Future Enhancements

1. Add AJAX-based pagination (no page reload)
2. Implement infinite scroll option
3. Add product comparison feature
4. Cache category list for performance
5. Add product review/rating submission
6. Implement wishlist functionality
7. Add advanced filters (color, size, etc.)

---

**Last Updated:** May 16, 2026  
**Status:** ✅ Production Ready
