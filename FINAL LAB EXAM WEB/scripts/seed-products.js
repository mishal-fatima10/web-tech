require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const imagePool = [
  '/images/NewArrivals1.jpg',
  '/images/NewArrivals2.jpg',
  '/images/NewArrivals3.jpg',
  '/images/NewArrivals4.jpg',
  '/images/NewArrivals5.jpg',
  '/images/NewArrivals6.jpg',
  '/images/seasonalfavs1.jpg',
  '/images/seasonalfavs2.jpg',
  '/images/seasonalfavs3.jpg',
  '/images/seasonalfavs4.jpg',
  '/images/seasonalfavs5.jpg',
  '/images/wearing1.jpg',
  '/images/wearing2.jpg',
  '/images/wearing3.jpg',
  '/images/wearing4.jpg',
  '/images/wearing5.jpg',
  '/images/wearing6.jpg',
  '/images/LuxePret.jpg',
  '/images/Formal.jpg',
  '/images/bridals.jpg',
  '/images/banner2.jpg'
];

const categories = [
  { name: 'Unstitched Lawn', label: 'Lawn', basePrice: 5900 },
  { name: 'Luxe Pret', label: 'Pret', basePrice: 12500 },
  { name: 'Formals', label: 'Formal', basePrice: 18900 },
  { name: 'Bridals', label: 'Bridal', basePrice: 45000 }
];

function buildDescription(label, index) {
  return `${label} design ${index} with signature embroidery and seasonal palette.`;
}

async function seedCategory(category, targetCount, targetOnSale) {
  const existing = await Product.find({ category: category.name }).select('name isOnSale');
  const existingCount = existing.length;
  const existingOnSale = existing.filter((item) => item.isOnSale).length;

  if (existingCount >= targetCount) {
    console.log(`Skipping ${category.name}: already has ${existingCount} products.`);
    return;
  }

  const onSaleRemaining = Math.max(0, targetOnSale - existingOnSale);
  const toCreate = [];
  let onSaleLeft = onSaleRemaining;

  for (let i = existingCount + 1; i <= targetCount; i += 1) {
    const isOnSale = onSaleLeft > 0;
    if (onSaleLeft > 0) onSaleLeft -= 1;

    const price = category.basePrice + (i * 350);
    const rating = Math.min(5, 3.6 + (i % 5) * 0.3);
    const stock = 8 + (i % 7) * 2;
    const image = imagePool[(i - 1) % imagePool.length];

    toCreate.push({
      name: `${category.label} Look ${String(i).padStart(2, '0')}`,
      price,
      category: category.name,
      rating,
      stock,
      description: buildDescription(category.label, i),
      image,
      isOnSale
    });
  }

  if (toCreate.length > 0) {
    await Product.insertMany(toCreate);
    console.log(`Inserted ${toCreate.length} products for ${category.name}.`);
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    for (const category of categories) {
      await seedCategory(category, 16, 5);
    }

    const totalOnSale = await Product.countDocuments({ isOnSale: true });
    console.log(`Total on-sale products: ${totalOnSale}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
