require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create a sample on-sale product
    const sample = new Product({
      name: 'Sample Onsale Dress',
      price: 19999,
      category: 'Luxe Pret',
      rating: 4.5,
      stock: 10,
      description: 'A promotional sample dress for testing on-sale page.',
      image: '/images/placeholder.svg',
      isOnSale: true
    });

    await sample.save();
    console.log('Inserted sample on-sale product:', sample._id);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
