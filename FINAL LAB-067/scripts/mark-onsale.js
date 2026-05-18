require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Accept comma-separated IDs as CLI argument: node scripts/mark-onsale.js id1,id2
const arg = process.argv[2];
let ids = [];
if (arg && arg.includes(',')) {
  ids = arg.split(',').map(s => s.trim()).filter(Boolean);
} else if (arg) {
  ids = [arg.trim()];
} else {
  // Defaults (previously provided IDs)
  ids = [
    '6a07c017226392978a0e0c0d',
    '6a07c017226392978a0e0c0e'
  ];
}

const unset = process.argv.includes('--unset');

async function mark() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    for (const id of ids) {
      const res = await Product.findByIdAndUpdate(id, { isOnSale: unset ? false : true }, { new: true });
      if (res) console.log(`Updated ${id} -> isOnSale: ${unset ? 'false' : 'true'}`);
      else console.log(`Product ${id} not found`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating products:', err);
    process.exit(1);
  }
}

mark();
