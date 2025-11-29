# Demo Shop - Full Stack E-commerce Application

A modern e-commerce demo shop built with React, Node.js, Express, and MongoDB featuring a custom coffee builder.

## Features

- 🛍️ **Product Catalog**: 4 categories (Electronics, Clothing, Books, Coffee) with 6 items each
- 🛒 **Shopping Cart**: Local storage-based cart management
- 🎉 **Toast Notifications**: Visual feedback for cart actions and order placement
- 📦 **Order Summary**: Detailed checkout flow with order confirmation
- ⚙️ **Admin Panel**: Manage product prices and inventory status
- ☕ **Custom Coffee Builder**: Create your perfect coffee with customizable options:
  - Sugar levels (0-5 teaspoons)
  - Milk type (None, Regular, Oat)
  - Coffee shots (1-4)
  - Chocolate pumps (0-5)
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🗄️ **NoSQL Database**: MongoDB for data persistence

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- dotenv for environment variables

### Frontend
- React 18
- React Router for navigation
- Context API for state management
- Local Storage for cart persistence
- Modern CSS with responsive design

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (running locally or connection string to remote instance)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   cd SevenTestsShop
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

1. **Backend Environment Variables**
   
   The backend `.env` file is already created with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/demoshop
   ```
   
   Update `MONGODB_URI` if you're using a different MongoDB connection string.

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system:

**macOS (using Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
```bash
mongod
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2. Seed the Database

Populate the database with initial product data:

```bash
cd backend
npm run seed
```

You should see:
```
Connected to MongoDB
Cleared existing products
Successfully seeded database with 24 products
4 categories: Electronics, Clothing, Books, Coffee
6 items per category
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Project Structure

```
SevenTestsShop/
├── backend/
│   ├── models/
│   │   ├── Product.js          # Product schema
│   │   └── Order.js            # Order schema
│   ├── routes/
│   │   ├── products.js         # Product API routes
│   │   └── orders.js           # Order API routes
│   ├── .env                    # Environment variables
│   ├── server.js               # Express server
│   ├── seed.js                 # Database seeder
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── context/
│   │   │   └── CartContext.js  # Cart state management
│   │   ├── pages/
│   │   │   ├── Home.js         # Homepage
│   │   │   ├── Shop.js         # Product listing
│   │   │   ├── Cart.js         # Shopping cart
│   │   │   └── CoffeeBuilder.js # Custom coffee builder
│   │   ├── App.js              # Main app component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products?category=Electronics` - Get products by category
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/all` - Get all categories

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order

### Health Check

- `GET /api/health` - Server health check

## Usage

### Shopping Flow

1. **Browse Products**: Navigate to the Shop page to view all products
2. **Filter by Category**: Click category buttons to filter products
3. **Add to Cart**: Click "Add to Cart" on any product (shows success toast)
4. **Custom Coffee**: Use the Coffee Builder to create a custom coffee with your preferences
5. **View Cart**: Check your cart to see all items and order summary
6. **Update Quantities**: Adjust quantities with +/- buttons
7. **Remove Items**: Remove unwanted items from cart
8. **Checkout**: Click "Proceed to Checkout" to review order
9. **Place Order**: Confirm and place order (saves to database with success toast)

### Admin Panel

Access the Admin Panel at `/admin` to manage your inventory:

- **Edit Prices**: Click "Edit" on any product to modify its price
- **Toggle Stock Status**: Use the toggle switch to mark items as in/out of stock
- **Real-time Updates**: Changes are saved immediately to the database
- **Visual Feedback**: Success toast confirms when products are updated

Products marked as "Out of Stock" will show a disabled "Out of Stock" button in the shop.

### Coffee Builder

The custom coffee builder allows you to:
- Adjust sugar (0-5 teaspoons, +$0.25 each)
- Choose milk type (None, Regular +$0.50, Oat +$0.75)
- Select coffee shots (1-4, +$0.75 per extra shot)
- Add chocolate pumps (0-5, +$0.50 each)

Base price: $3.50

## Development Scripts

### Backend

```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
npm run seed   # Seed database with sample data
```

### Frontend

```bash
npm start      # Start development server
npm run build  # Create production build
npm test       # Run tests
```

## Features in Detail

### Local Storage Cart

The shopping cart uses browser local storage to persist items between sessions. Cart data is automatically saved and loaded when you revisit the site.

### Custom Coffee Builder

Build your perfect coffee with real-time price calculation. Each customization option updates the total price instantly. Custom coffees are saved to your cart with all your selections.

### Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Troubleshooting

### MongoDB Connection Issues

If you see "MongoDB connection error":
1. Ensure MongoDB is running
2. Check the `MONGODB_URI` in `.env`
3. Verify MongoDB is accessible on the specified port

### Port Already in Use

If port 5000 or 3000 is already in use:
- Backend: Change `PORT` in `.env`
- Frontend: React will prompt you to use a different port

### Dependencies Issues

If you encounter dependency issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- User authentication and profiles
- Order history tracking
- Payment integration
- Product reviews and ratings
- Search functionality
- Admin dashboard
- Image uploads for products
- Email notifications

## License

This is a demo project for educational purposes.

## Author

Demo Shop - 2025
