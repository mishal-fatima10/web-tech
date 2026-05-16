# Assignment 3: Dynamic Product Catalog Integration - Setup Guide

## Assignment Requirements Implemented ✓

### 1. **Database Integration & Schema** ✓
- Mongoose Product Schema created with all required fields:
  - `name` - Product name (required)
  - `price` - Product price (required, min: 0)
  - `category` - Product category from predefined list (required)
  - `rating` - Product rating (0-5, default: 0)
  - `stock` - Product stock quantity (required, min: 0)
  - Additional fields: `description`, `image`, `createdAt`
- 25+ sample products seeded into database across all categories

### 2. **Server-Side Pagination** ✓
- Limit: 8 products per page
- Query parameter: `?page=n` 
- Pagination controls: Previous, Page Numbers, Next
- Smart pagination display (shows range, ellipsis for large page counts)
- Maintains filters while navigating pages

### 3. **Filtering & Searching** ✓
- **Search Bar**: Filter products by name (case-insensitive regex search)
- **Category Filter**: Dropdown with all available categories
- **Price Range**: Minimum and maximum price filters
- **Sorting**: Sort by Name, Price (Low-High), Price (High-Low), Rating

---

## Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB running locally on `mongodb://localhost:27017`

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `ejs` - Template engine
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables

### Step 2: Ensure MongoDB is Running
```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or start MongoDB manually:
mongod
```

### Step 3: Seed the Database
```bash
node seed.js
```

You should see output like:
```
MongoDB connected successfully
Cleared existing products
✓ Successfully seeded 25 products to the database
✓ Database connection closed
```

### Step 4: Start the Server
```bash
npm start
```

Server will start at: `http://localhost:3000`

---

## Features & Usage

### Accessing the Products Page
Navigate to: `http://localhost:3000/products`

### Using Filters

#### 1. **Search Products**
- Type product name in search box
- Click "Apply Filters"
- Example: Search for "Lawn" to find all lawn products

#### 2. **Filter by Category**
- Select category from dropdown
- Available categories:
  - Unstitched Lawn
  - Luxe Pret
  - Semi-Formals
  - Formals
  - Bridals
  - Menswear

#### 3. **Filter by Price Range**
- Enter minimum price (optional)
- Enter maximum price (optional)
- Click "Apply Filters"

#### 4. **Sort Products**
- Choose from:
  - Name (A-Z)
  - Price (Low to High)
  - Price (High to Low)
  - Rating (Highest First)

#### 5. **Combine Multiple Filters**
- All filters work together
- Example: Search for "Pret" + Category "Luxe Pret" + Max Price 9000

#### 6. **Clear Filters**
- Click "Clear All" button to reset all filters

### Pagination Navigation
- Shows current page and total pages
- Click page numbers to jump directly
- Previous/Next buttons for sequential navigation
- Filters are maintained when navigating pages

---

## Project Structure

```
ASSIGNMENT 4/
├── server.js                 # Main Express server with /products route
├── seed.js                   # Database seeding script
├── package.json              # Dependencies
├── models/
│   └── Product.js           # Mongoose Product schema
├── views/
│   ├── homepage.ejs
│   ├── products.ejs         # NEW: Products page template
│   ├── contact-us.ejs
│   └── [other pages...]
├── public/
│   ├── css/styles.css
│   ├── js/script.js
│   └── images/
```

---

## Database Schema (Product Model)

```javascript
{
  name: String (required),
  price: Number (required, min: 0),
  category: String (enum: ["Unstitched Lawn", "Luxe Pret", "Semi-Formals", "Formals", "Bridals", "Menswear"]),
  rating: Number (0-5, default: 0),
  stock: Number (required, min: 0),
  description: String,
  image: String (default: "/images/placeholder.jpg"),
  createdAt: Date (default: now)
}
```

---

## API Route: GET /products

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `search` | string | "" | Search query (searches product names) |
| `category` | string | "" | Filter by category |
| `minPrice` | number | 0 | Minimum price filter |
| `maxPrice` | number | Infinity | Maximum price filter |
| `sort` | string | "name" | Sort option: name, price-low, price-high, rating |

### Example URLs

- All products: `/products`
- Page 2: `/products?page=2`
- Search lawn: `/products?search=lawn`
- Specific category: `/products?category=Bridals`
- Price range: `/products?minPrice=5000&maxPrice=15000`
- Combined filters: `/products?search=Pret&category=Luxe Pret&minPrice=7000&maxPrice=9500&sort=price-low&page=1`

---

## Features Implemented

### Frontend
- ✓ Responsive product grid (4 columns on desktop, 2 on mobile)
- ✓ Product cards with image, name, price, rating, stock status
- ✓ Filter form with search, category, price range, and sort options
- ✓ Pagination controls with smart page number display
- ✓ Product count display showing filtered results
- ✓ "No products found" message when filters return no results
- ✓ Mobile-responsive design

### Backend
- ✓ MongoDB connection with Mongoose
- ✓ Product model with validation
- ✓ Complex filtering logic (search, category, price range)
- ✓ Sorting functionality
- ✓ Server-side pagination (8 per page)
- ✓ Dynamic category list from database
- ✓ Error handling

---

## Sample Products Seeded

**25 products across 6 categories:**
- 4 Unstitched Lawn (Rs. 2,200 - Rs. 3,000)
- 4 Luxe Pret (Rs. 7,800 - Rs. 9,200)
- 4 Semi-Formals (Rs. 5,500 - Rs. 6,500)
- 4 Formals (Rs. 11,500 - Rs. 13,500)
- 4 Bridals (Rs. 34,000 - Rs. 38,000)
- 5 Menswear (Rs. 3,500 - Rs. 18,000)

---

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection error
```
**Solution**: Ensure MongoDB is running. Start it with `mongod` in a terminal.

### Products Not Appearing
1. Check if seed.js was run successfully
2. Verify MongoDB is running
3. Check server console for errors

### Filters Not Working
- Ensure you clicked "Apply Filters" button
- Check browser console for JavaScript errors
- Verify query parameters in URL are correct

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure CSS file exists at `/public/css/styles.css`
- Check browser console for CSS load errors

---

## Next Steps (Optional Enhancements)

- Add shopping cart functionality
- Implement user authentication
- Add product reviews and ratings
- Create admin panel for managing products
- Add order history
- Implement payment gateway integration
- Add product comparison feature
- Optimize images for faster loading

---

## Files Created/Modified

**Created:**
- ✓ `models/Product.js` - Product schema
- ✓ `views/products.ejs` - Products page template
- ✓ `seed.js` - Database seeding script
- ✓ `SETUP.md` - This documentation

**Modified:**
- ✓ `package.json` - Added mongoose and dotenv
- ✓ `server.js` - Added MongoDB connection and /products route

---

Good luck with your assignment! 🎓
