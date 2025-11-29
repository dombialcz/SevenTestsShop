# Playwright E2E Testing Setup - Quick Start

This project now has Playwright E2E testing configured with ng-apimock integration for comprehensive frontend testing.

## ✅ What's Been Set Up

- ✅ Playwright test framework installed
- ✅ Complete folder structure in `frontend/playwright/`
- ✅ Playwright configuration with dual server setup (React + Mock server)
- ✅ Mock server integration via `mocker` fixture
- ✅ Page Object Model pattern implementation
- ✅ Test fixtures system for dependency injection
- ✅ Example page objects (ShopPage, CartPage)
- ✅ Example test files (shop.spec.ts, cart.spec.ts)
- ✅ Test template for creating new tests
- ✅ NPM scripts for running tests

## 🚀 Quick Start

### 1. Install Playwright Browsers

```bash
cd frontend
npx playwright install
```

This installs the browser binaries needed for testing (Chromium by default).

### 2. Start the Application and Mock Server

In one terminal:
```bash
# From project root
npm run mock-server
```

In another terminal:
```bash
cd frontend
npm start
```

### 3. Run Tests

```bash
# Run all tests in UI mode (recommended for first run)
npm run test:e2e:ui

# Or run all tests headlessly
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed
```

## 📂 Project Structure

```
/Users/dominikb/SevenTestsShop/
├── frontend/
│   ├── playwright/               # Playwright tests
│   │   ├── src/
│   │   │   ├── fixtures/         # Test fixtures
│   │   │   ├── page-objects/     # Page Object Model
│   │   │   ├── utils/            # Utilities (Mocker)
│   │   │   ├── data/             # Test data
│   │   │   └── specs/            # Test files
│   │   └── README.md             # Detailed documentation
│   └── playwright.config.ts      # Playwright configuration
└── mock-server/                  # ng-apimock server
    ├── mock-server.js
    ├── mocks/                    # Mock definitions
    └── README.md
```

## 🧪 Test Examples

### Basic Test with Mock Server

```typescript
import { expect, test } from '../fixtures';

test('should display products', async ({ mocker, shopPage }) => {
  // Configure mock to return success response
  await mocker.selectScenario('getProducts', 'success');
  
  // Navigate to shop page
  await shopPage.navigate();
  
  // Assert products are displayed
  await expect(shopPage.productCards).toHaveCount(10);
});
```

### Testing Error States

```typescript
test('should handle server error', async ({ mocker, shopPage }) => {
  // Configure mock to return 500 error
  await mocker.selectScenario('getProducts', 'serverError');
  await mocker.reloadPages('networkidle');
  
  await shopPage.navigate();
  
  // Assert error state is displayed
  // (Update assertions based on your actual UI)
});
```

## 🎯 Available Test Scripts

```bash
npm run test:e2e          # Run all tests (headless)
npm run test:e2e:ui       # Run with UI mode (recommended)
npm run test:e2e:headed   # Run with visible browser
npm run test:e2e:debug    # Run in debug mode
npm run test:e2e:report   # View HTML report
npm run test:ui           # Run only @ui tagged tests
npm run test:mock         # Run only @mock tagged tests
npm run test:error        # Run only @error tagged tests
```

## 🔧 Configuration

### Dual Server Startup

The Playwright config automatically starts:
1. **React app** on `http://localhost:3000`
2. **Mock server** on `http://localhost:9999`

Both servers start automatically when you run tests. No manual startup needed!

### Mock Server Control

The `mocker` fixture is available in all tests:

```typescript
// Switch scenarios
await mocker.selectScenario('getProducts', 'success');
await mocker.selectScenario('getProducts', 'empty');
await mocker.selectScenario('getProducts', 'serverError');

// Apply presets
await mocker.selectPreset('happy-path');
await mocker.selectPreset('error-scenarios');

// Reload pages to fetch new mock data
await mocker.reloadPages('networkidle');
```

### Available Mock Scenarios

**Products:**
- `success` - Returns 10 products
- `empty` - Returns empty array
- `slow` - Returns with delay
- `unauthorized` - Returns 401 error
- `serverError` - Returns 500 error

**Orders:**
- `success` - Order created successfully
- `validationError` - Invalid order data
- `emptyCart` - Cart is empty
- `outOfStock` - Product out of stock
- `paymentFailed` - Payment processing failed
- `serverError` - Server error

**Presets:**
- `happy-path` - All success scenarios
- `error-scenarios` - All error scenarios
- `slow-network` - All slow scenarios
- `empty-store` - All empty scenarios

## 📄 Page Objects

Tests use the Page Object Model pattern:

```typescript
// ShopPage object
test('should add product', async ({ shopPage }) => {
  await shopPage.navigate();
  await shopPage.addFirstProductToCart();
  await expect(shopPage.notification).toBeVisible();
});

// CartPage object
test('should checkout', async ({ cartPage, mocker }) => {
  await mocker.selectScenario('createOrder', 'success');
  await cartPage.navigate();
  await cartPage.checkout();
});
```

## 📝 Creating New Tests

1. **Use the template:**
   ```bash
   cp frontend/playwright/src/specs/template.spec.ts frontend/playwright/src/specs/my-feature.spec.ts
   ```

2. **Update the test:**
   - Change describe block name
   - Update fixtures
   - Fill in test steps
   - Update assertions

3. **Run your test:**
   ```bash
   npx playwright test my-feature.spec.ts
   ```

## 🔍 Debugging Tests

### UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

Provides:
- Visual test runner
- Step-by-step execution
- Time travel debugging
- DOM snapshots
- Network inspection

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for breakpoint debugging.

### VSCode Extension

Install "Playwright Test for VSCode" extension for:
- Run tests from editor
- Inline results
- Debugging support

## ⚠️ Important Notes

### Current Status

The tests are **templates** and need updates:

1. **Selectors**: Update page objects to match your actual DOM structure
2. **Assertions**: Add actual error message assertions
3. **Test Data**: Verify test data matches your implementation
4. **Mock Scenarios**: Ensure mock scenarios match backend behavior

### Next Steps

1. ✅ Install browsers: `npx playwright install`
2. ✅ Run test in UI mode: `npm run test:e2e:ui`
3. 🔄 Update selectors in page objects to match your React components
4. 🔄 Add actual assertions based on your UI behavior
5. 🔄 Create additional page objects as needed
6. 🔄 Add more test scenarios

## 📚 Documentation

- **Playwright Setup**: `frontend/playwright/README.md` (detailed documentation)
- **Mock Server Guide**: `mock-server/README.md`
- **Playwright Mocker Guide**: `PLAYWRIGHT-MOCKER-GUIDE.md`
- **Test Setup Guide**: `PLAYWRIGHT-TEST-SETUP-GUIDE.md`

## 🎓 Resources

- [Playwright Docs](https://playwright.dev/)
- [ng-apimock Docs](https://ngapimock.org/)
- [Page Object Model](https://playwright.dev/docs/pom)

## 💡 Tips

1. **Start with UI mode** - It's the best way to understand how tests work
2. **One test at a time** - Focus on getting one test passing first
3. **Use page objects** - Keep selectors out of test files
4. **Test with mocks** - Use different scenarios to test all states
5. **Use test.step()** - Makes tests easier to read and debug

---

**Ready to start testing! 🚀**

Run `npm run test:e2e:ui` in the frontend directory to see your first test in action.
