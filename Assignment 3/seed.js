const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/sania-maskatiya";

// MongoDB Connection
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection error:", err));

const sampleProducts = [
  // Unstitched Lawn
  { name: "Summer Breeze Lawn", price: 2500, category: "Unstitched Lawn", rating: 4.5, stock: 15, description: "Light and comfortable unstitched lawn perfect for summer", image: "/images/seasonalfavs1.jpg" },
  { name: "Garden Bliss Lawn", price: 2200, category: "Unstitched Lawn", rating: 4.2, stock: 12, description: "Beautiful floral print unstitched lawn", image: "/images/seasonalfavs2.jpg" },
  { name: "Royal Elegance Lawn", price: 3000, category: "Unstitched Lawn", rating: 4.8, stock: 8, description: "Premium quality unstitched lawn with intricate designs", image: "/images/seasonalfavs3.jpg" },
  { name: "Fresh Bloom Lawn", price: 2400, category: "Unstitched Lawn", rating: 4.3, stock: 20, description: "Fresh and vibrant unstitched lawn collection", image: "/images/seasonalfavs4.jpg" },
  { name: "Paradise Blue Lawn", price: 2600, category: "Unstitched Lawn", rating: 4.4, stock: 18, description: "Serene blue tones in premium unstitched lawn", image: "/images/seasonalfavs5.jpg" },
  { name: "Coral Dream Lawn", price: 2350, category: "Unstitched Lawn", rating: 4.1, stock: 14, description: "Warm coral colors perfect for spring season", image: "/images/carousel1.jpg" },

  // Luxe Pret
  { name: "Urban Chic Pret", price: 8500, category: "Luxe Pret", rating: 4.9, stock: 5, description: "Modern and stylish ready-to-wear collection", image: "/images/NewArrivals1.jpg" },
  { name: "Midnight Glamour Pret", price: 9200, category: "Luxe Pret", rating: 4.7, stock: 7, description: "Elegant evening wear with luxe finishing", image: "/images/NewArrivals2.jpg" },
  { name: "Sunset Dreams Pret", price: 7800, category: "Luxe Pret", rating: 4.6, stock: 6, description: "Beautiful ready-to-wear for special occasions", image: "/images/NewArrivals3.jpg" },
  { name: "Pearl Paradise Pret", price: 8900, category: "Luxe Pret", rating: 4.8, stock: 4, description: "Luxurious pearl-embellished pret wear", image: "/images/NewArrivals4.jpg" },
  { name: "Velvet Nights Pret", price: 8700, category: "Luxe Pret", rating: 4.8, stock: 6, description: "Rich velvet fabric with sophisticated design", image: "/images/NewArrivals5.jpg" },
  { name: "Emerald Essence Pret", price: 9500, category: "Luxe Pret", rating: 4.9, stock: 3, description: "Stunning emerald green pret with embellishments", image: "/images/NewArrivals6.jpg" },



  // Formals
  { name: "Executive Formal Black", price: 12000, category: "Formals", rating: 4.8, stock: 6, description: "Classic black formal wear for corporate events", image: "/images/wearing1.jpg" },
  { name: "Royal Formal Maroon", price: 13500, category: "Formals", rating: 4.9, stock: 4, description: "Rich maroon formal with intricate detailing", image: "/images/wearing2.jpg" },
  { name: "Regal Blue Formal", price: 12500, category: "Formals", rating: 4.7, stock: 5, description: "Deep blue formal perfect for any formal occasion", image: "/images/wearing3.jpg" },
  { name: "Platinum Formal White", price: 11500, category: "Formals", rating: 4.6, stock: 7, description: "Elegant white formal with subtle embellishments", image: "/images/wearing4.jpg" },
  { name: "Sapphire Formal Navy", price: 12800, category: "Formals", rating: 4.8, stock: 6, description: "Navy formal with timeless elegance", image: "/images/wearing5.jpg" },
  { name: "Burgundy Formal Wine", price: 13200, category: "Formals", rating: 4.7, stock: 5, description: "Deep wine formal for sophisticated look", image: "/images/wearing6.jpg" },

  // Bridals
  { name: "Bride's Dream Gold", price: 35000, category: "Bridals", rating: 5.0, stock: 3, description: "Stunning bridal gold with extensive embroidery", image: "/images/carousel1.jpg" },
  { name: "Royal Wedding Red", price: 38000, category: "Bridals", rating: 5.0, stock: 2, description: "Traditional red bridal with luxe finishing", image: "/images/carousel2.jpg" },
  { name: "Bride's Glory Maroon", price: 36500, category: "Bridals", rating: 4.9, stock: 2, description: "Beautiful maroon bridal collection", image: "/images/carousel3.jpg" },
  { name: "Princess Bridal Green", price: 34000, category: "Bridals", rating: 4.9, stock: 3, description: "Elegant green bridal with pearl work", image: "/images/carousel4.jpg" },
  { name: "Crimson Queen Bridal", price: 37500, category: "Bridals", rating: 5.0, stock: 2, description: "Luxurious crimson bridal with full embroidery", image: "/images/carousel5.jpg" },
  { name: "Sunset Bride Coral", price: 33000, category: "Bridals", rating: 4.8, stock: 3, description: "Stunning coral bridal for unique brides", image: "/images/bridals.jpg" },

 
];

// Seed Database
async function seedDatabase() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert sample products
    const result = await Product.insertMany(sampleProducts);
    console.log(`✓ Successfully seeded ${result.length} products to the database`);

    // Display sample data
    const products = await Product.find().limit(5);
    console.log("\nSample products in database:");
    console.log(products);

  } catch (error) {
    console.log("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n✓ Database connection closed");
  }
}

seedDatabase();
