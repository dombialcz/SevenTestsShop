require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Helper function to create SVG data URI
const createSVG = (text, bgColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="${bgColor}"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

const products = [
  // Electronics - 6 items
  {
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 79.99,
    description: 'Premium wireless headphones with noise cancellation',
    image: createSVG('🎧 Headphones', '#0066ff'),
    inStock: true
  },
  {
    name: 'Smart Watch',
    category: 'Electronics',
    price: 249.99,
    description: 'Feature-rich smartwatch with fitness tracking',
    image: createSVG('⌚ Smart Watch', '#0066ff'),
    inStock: true
  },
  {
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    price: 49.99,
    description: 'Portable Bluetooth speaker with amazing sound',
    image: createSVG('🔊 Speaker', '#0066ff'),
    inStock: true
  },
  {
    name: 'USB-C Hub',
    category: 'Electronics',
    price: 39.99,
    description: 'Multi-port USB-C hub for all your devices',
    image: createSVG('🔌 USB Hub', '#0066ff'),
    inStock: true
  },
  {
    name: 'Wireless Mouse',
    category: 'Electronics',
    price: 29.99,
    description: 'Ergonomic wireless mouse with precision tracking',
    image: createSVG('🖱️ Mouse', '#0066ff'),
    inStock: true
  },
  {
    name: 'Phone Case',
    category: 'Electronics',
    price: 19.99,
    description: 'Protective phone case with sleek design',
    image: createSVG('📱 Phone Case', '#0066ff'),
    inStock: true
  },

  // Clothing - 6 items
  {
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    price: 24.99,
    description: 'Comfortable 100% cotton t-shirt',
    image: createSVG('👕 T-Shirt', '#ff4444'),
    inStock: true
  },
  {
    name: 'Denim Jeans',
    category: 'Clothing',
    price: 59.99,
    description: 'Classic fit denim jeans',
    image: createSVG('👖 Jeans', '#ff4444'),
    inStock: true
  },
  {
    name: 'Hoodie',
    category: 'Clothing',
    price: 44.99,
    description: 'Warm and cozy pullover hoodie',
    image: createSVG('🧥 Hoodie', '#ff4444'),
    inStock: true
  },
  {
    name: 'Running Shoes',
    category: 'Clothing',
    price: 89.99,
    description: 'Lightweight running shoes with great support',
    image: createSVG('👟 Shoes', '#ff4444'),
    inStock: true
  },
  {
    name: 'Baseball Cap',
    category: 'Clothing',
    price: 19.99,
    description: 'Adjustable baseball cap with embroidered logo',
    image: createSVG('🧢 Cap', '#ff4444'),
    inStock: true
  },
  {
    name: 'Winter Jacket',
    category: 'Clothing',
    price: 129.99,
    description: 'Insulated winter jacket for cold weather',
    image: createSVG('🧥 Jacket', '#ff4444'),
    inStock: true
  },

  // Books - 6 items
  {
    name: 'JavaScript Guide',
    category: 'Books',
    price: 34.99,
    description: 'Complete guide to modern JavaScript',
    image: createSVG('📘 JS Book', '#44aa44'),
    inStock: true
  },
  {
    name: 'React Mastery',
    category: 'Books',
    price: 39.99,
    description: 'Master React with this comprehensive book',
    image: createSVG('📗 React Book', '#44aa44'),
    inStock: true
  },
  {
    name: 'Node.js Cookbook',
    category: 'Books',
    price: 29.99,
    description: 'Practical recipes for Node.js development',
    image: createSVG('📕 Node Book', '#44aa44'),
    inStock: true
  },
  {
    name: 'Clean Code',
    category: 'Books',
    price: 44.99,
    description: 'A handbook of agile software craftsmanship',
    image: createSVG('📙 Clean Code', '#44aa44'),
    inStock: true
  },
  {
    name: 'Design Patterns',
    category: 'Books',
    price: 49.99,
    description: 'Elements of reusable object-oriented software',
    image: createSVG('📚 Patterns', '#44aa44'),
    inStock: true
  },
  {
    name: 'Database Systems',
    category: 'Books',
    price: 54.99,
    description: 'Introduction to database management systems',
    image: createSVG('📖 Database', '#44aa44'),
    inStock: true
  },

  // Coffee - 6 items
  {
    name: 'Espresso Blend',
    category: 'Coffee',
    price: 14.99,
    description: 'Rich and bold espresso coffee beans',
    image: createSVG('☕ Espresso', '#8B4513'),
    inStock: true
  },
  {
    name: 'Colombian Coffee',
    category: 'Coffee',
    price: 12.99,
    description: 'Smooth Colombian arabica coffee',
    image: createSVG('☕ Colombian', '#8B4513'),
    inStock: true
  },
  {
    name: 'French Roast',
    category: 'Coffee',
    price: 13.99,
    description: 'Dark roasted French coffee beans',
    image: createSVG('☕ French', '#8B4513'),
    inStock: true
  },
  {
    name: 'Decaf Blend',
    category: 'Coffee',
    price: 11.99,
    description: 'Decaffeinated coffee without compromise',
    image: createSVG('☕ Decaf', '#8B4513'),
    inStock: true
  },
  {
    name: 'Vanilla Latte',
    category: 'Coffee',
    price: 4.99,
    description: 'Creamy vanilla flavored latte',
    image: createSVG('☕ Latte', '#8B4513'),
    inStock: true
  },
  {
    name: 'Cappuccino',
    category: 'Coffee',
    price: 4.49,
    description: 'Classic cappuccino with foam',
    image: createSVG('☕ Cappuccino', '#8B4513'),
    inStock: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Successfully seeded database with 24 products');
    console.log('4 categories: Electronics, Clothing, Books, Coffee');
    console.log('6 items per category');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
