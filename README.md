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

You can run the application with either the **real MongoDB backend** or the **mock server** for testing.

### Option 1: Real Backend (MongoDB Required)

#### 1. Start MongoDB

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

#### 2. Seed the Database

Populate the database with initial product data:

```bash
# From project root
npm run backend:seed

# Or from backend directory
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

#### 3. Start the Backend Server

```bash
# From project root
npm run backend

# Or from backend directory
cd backend
npm run dev
```

The backend will run on `http://localhost:5001`

#### 4. Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

### Option 2: Mock Server (No MongoDB Required)

For testing and development without MongoDB, use the ng-apimock server:

#### 1. Start the Mock Server

```bash
# From project root
npm run mock-server

# Or manually
cd mock-server
npm install
npm start
```

The mock server will run on `http://localhost:9999`

**Features:**
- Realistic API responses without database
- Multiple response scenarios (success, errors, edge cases)
- 5 presets for different testing scenarios
- Web UI at http://localhost:9999/dev-interface

#### 2. Start the Frontend

```bash
cd frontend
npm start
```

The frontend will automatically connect to the mock server on port 9999.

### Quick Start Commands

```bash
# Real Backend
npm run backend:seed    # Seed database (one-time)
npm run backend         # Start MongoDB backend

# Mock Server
npm run mock-server     # Start mock API server

# Frontend (use with either backend option)
cd frontend && npm start
```

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

### Real Backend (Port 5001)

#### Products

- `GET /api/products` - Get all products
- `GET /api/products?category=Electronics` - Get products by category
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/all` - Get all categories
- `PUT /api/products/:id` - Update product (Admin)

#### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order

#### Health Check

- `GET /api/health` - Server health check

### Mock Server (Port 9999)

The mock server provides the same endpoints with configurable scenarios:

- **Success responses** - Normal operation
- **Error states** - 404, 500, validation errors
- **Edge cases** - Empty results, slow responses
- **Presets** - Predefined scenario combinations

**Dev Interface:** http://localhost:9999/dev-interface

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
npm start                 # Start development server
npm run build             # Create production build
npm test                  # Run unit tests
npm run test:e2e          # Run E2E tests with Playwright
npm run test:e2e:ui       # Run E2E tests in Playwright UI mode
npm run test:e2e:headed   # Run E2E tests in headed mode (see browser)
npm run test:e2e:debug    # Debug E2E tests
npm run test:e2e:report   # Show E2E test report
npm run test:visual       # Run visual regression tests
npm run test:visual:ui    # Run visual tests in UI mode
npm run test:visual:headed # Run visual tests in headed mode
npm run test:visual:update # Update visual test snapshots (baselines)
npm run test:visual:docker # Run visual tests in Docker for consistency
```

## Testing

This project includes comprehensive testing at multiple levels:

### Unit Tests (Jest + React Testing Library)

Located in `frontend/src/**/__tests__/`, unit tests cover individual components and utility functions.

```bash
cd frontend
npm test              # Run in watch mode
npm test -- --coverage # Run with coverage report
```

**Test Coverage:**
- 61 unit tests across 5 test suites
- Components: ProductCard, CartItem, Navbar
- Utils: CoffeeBuilder calculations
- All tests passing ✅

### E2E Tests (Playwright)

Located in `frontend/playwright/`, end-to-end tests verify complete user workflows using the mock server.

```bash
cd frontend
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive UI mode
npm run test:ui           # Run only @ui tagged tests
npm run test:mock         # Run only @mock tagged tests
npm run test:error        # Run only @error tagged tests
```

**Features:**
- Page Object Model architecture
- Mock server integration (ng-apimock)
- Test fixtures for reusable components
- Error scenario testing (404, 500, network failures)
- Shopping cart workflows
- Product filtering and display

### Visual Regression Tests (Playwright)

Visual tests crawl the entire application and capture screenshots for comparison.

```bash
cd frontend
npm run test:visual           # Run visual tests locally
npm run test:visual:docker    # Run in Docker (consistent across platforms)
npm run test:visual:update    # Update baseline screenshots
```

**What's Tested:**
- Homepage, Shop, Cart, Admin, Coffee Builder pages
- Category filtering
- Mobile, tablet, and desktop viewports
- Component states (hover, focus, populated, empty)
- Error states (404, 500)
- All tests use mock server for consistent data

**Docker for Consistency:**
Visual tests in Docker ensure screenshots are identical across macOS, Linux, and Windows:

```bash
# From project root
./docker-run-visual-tests.sh
```

The script automatically:
- Detects Playwright version
- Uses official Playwright Docker image
- Mounts workspace and runs visual tests
- Saves screenshots to `frontend/playwright/src/snapshots/`

### Mock Server (ng-apimock)

Located in `mock-server/`, provides consistent API responses for testing.

```bash
cd mock-server
npm install
npm start    # Starts on http://localhost:9999
```

**Features:**
- 5 API endpoints (products, categories, orders)
- Multiple scenarios per endpoint (success, error, edge cases)
- 5 presets: happy-path, error-scenarios, slow-network, empty-store, validation-errors
- Web UI at http://localhost:9999/mocking to switch scenarios

**Available Endpoints:**
- GET `/api/products` - List all products
- GET `/api/products/:id` - Get product by ID
- GET `/api/categories` - List categories
- PUT `/api/products/:id` - Update product
- POST `/api/orders` - Create order

**Example Usage:**
```bash
# Start mock server
cd mock-server && npm start

# In another terminal, run tests
cd frontend && npm run test:e2e
```

## Visual Regression Testing

Visual tests capture screenshots of the application and compare them against baseline images to detect unintended visual changes.

### How Visual Testing Works

Visual regression testing automatically:
1. Navigates through all pages of the application
2. Captures screenshots in multiple states (empty, populated, different viewports)
3. Compares new screenshots against baseline images
4. Highlights any visual differences for review

**Benefits:**
- Catch unintended CSS changes
- Verify responsive design across viewports
- Detect layout shifts and rendering issues
- Document visual state of the application

### Running Visual Tests

#### Local Testing (macOS)

```bash
cd frontend

# First run - create baseline snapshots
npm run test:visual:update

# Subsequent runs - compare against baselines
npm run test:visual

# Update baselines after intentional changes
npm run test:visual:update

# Interactive UI mode
npm run test:visual:ui

# View test report
npx playwright show-report playwright-report-visual
```

#### Docker Testing (Cross-platform consistency)

For pixel-perfect consistency across macOS, Linux, and Windows, use Docker:

```bash
# From project root
./docker-run-visual-tests.sh
```

**Why Docker?**
- Font rendering differs across operating systems
- Browser engines may render slightly differently
- Docker ensures identical screenshots in CI/CD pipelines
- Baseline snapshots generated in Docker work on any platform

**What Docker does:**
1. Detects your Playwright version automatically
2. Pulls official Playwright Docker image
3. Mounts your workspace
4. Runs visual tests in isolated environment
5. Saves screenshots back to your local filesystem

### What Gets Tested

The visual test suite covers:

**Pages (14 screenshots):**
- Homepage - initial load
- Shop page - all products, with category filter
- Product detail page
- Coffee Builder - initial state, with options selected
- Cart - empty state, with items
- Admin panel - product management
- Mobile viewport - shop page
- Tablet viewport - coffee builder

**Components:**
- Header/navigation - default state
- Product cards - default and hover states

**Test Configuration:**
- Browser: Chromium (headless)
- Default Viewport: 1440x900 (desktop)
- Mobile: 390x844, Tablet: 1024x1366
- Snapshot Location: `frontend/playwright/src/specs/visual-crawl.spec.ts-snapshots/`
- Dynamic elements (timestamps, animations) automatically hidden via CSS

### Updating Baselines

Update baseline snapshots when you make intentional visual changes:

```bash
cd frontend

# Review current failures first
npm run test:visual

# If changes are intentional, update baselines
npm run test:visual:update

# Verify new baselines
npm run test:visual
```

**⚠️ Important:** Always review screenshot diffs before updating baselines. Unexpected changes may indicate bugs.

### Troubleshooting Visual Tests

**Tests fail with small pixel differences:**
- Normal due to font rendering differences between OS
- Use Docker for consistent results
- Adjust threshold in `playwright.visual.config.ts` if needed

**All tests fail on first run:**
- Expected - no baseline snapshots exist yet
- Run `npm run test:visual:update` to create baselines

**Snapshots differ between local and CI:**
- Generate baselines using Docker: `./docker-run-visual-tests.sh --update-snapshots`
- Commit Docker-generated snapshots to version control

**Want to test only specific pages:**
```bash
npx playwright test --config=playwright.visual.config.ts --grep "Shop Page"
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
