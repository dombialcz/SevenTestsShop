# Playwright E2E Testing Setup

This directory contains the Playwright E2E test configuration and tests for the Demo Shop application.

## 📁 Directory Structure

```
playwright/
├── src/
│   ├── fixtures/           # Test fixtures for dependency injection
│   │   ├── mock-fixtures.ts
│   │   └── page-fixtures.ts
│   ├── page-objects/       # Page Object Model classes
│   │   ├── elements/       # Reusable UI elements (future)
│   │   └── pages/          # Page objects
│   │       ├── base-page.po.ts
│   │       ├── shop-page.po.ts
│   │       └── cart-page.po.ts
│   ├── utils/              # Utilities and helpers
│   │   └── mocker.ts       # Mock server client
│   ├── data/               # Test data and constants
│   │   └── shop.data.ts
│   ├── specs/              # Test files
│   │   ├── shop.spec.ts
│   │   ├── cart.spec.ts
│   │   └── template.spec.ts
│   └── fixtures.ts         # Main fixtures export
└── playwright.config.ts    # Playwright configuration
```

## 🚀 Getting Started

### Prerequisites

The following should already be installed (from previous setup):
- Node.js and npm
- @playwright/test
- @ng-apimock/base-client
- Mock server configured and running

### Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with Playwright UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run specific test categories
npm run test:ui      # Only UI tests
npm run test:mock    # Only mock integration tests
npm run test:error   # Only error handling tests
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test shop.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should add product"

# Run tests in a specific project (browser)
npx playwright test --project=chromium
```

## 🎭 Test Organization

Tests are organized using tags in the describe blocks:

- `@ui` - UI element verification tests
- `@act` - User action/interaction tests
- `@nav` - Navigation tests
- `@mock` - Mock server integration tests
- `@error` - Error handling tests
- `@preset` - Preset testing

**Example:**
```typescript
test.describe('@ui - UI Element Verification', () => {
  test('should display all page elements', async ({ shopPage }) => {
    // Test implementation
  });
});
```

## 🧪 Mock Server Integration

The tests use ng-apimock for controlling API responses. The `mocker` fixture is automatically available in all tests.

### Using the Mocker

```typescript
test('should handle empty products', async ({ mocker, shopPage }) => {
  // Switch to empty scenario
  await mocker.selectScenario('getProducts', 'empty');
  await mocker.reloadPages('networkidle');
  
  await shopPage.navigate();
  
  // Assert empty state
  await expect(shopPage.productCards).toHaveCount(0);
});
```

### Available Scenarios

Each mock endpoint has multiple scenarios configured in `/mock-server/mocks/`:

**Products Endpoints:**
- `getProducts`: success, empty, slow, unauthorized, serverError
- `getProductById`: success, notFound, invalidId, serverError
- `getCategories`: success, empty, serverError
- `updateProduct`: success, notFound, validationError, unauthorized, serverError

**Orders Endpoints:**
- `createOrder`: success, slow, validationError, emptyCart, outOfStock, paymentFailed, serverError

**Presets:**
- `happy-path`: All success scenarios
- `error-scenarios`: All error scenarios
- `slow-network`: All slow scenarios
- `empty-store`: All empty scenarios
- `validation-errors`: All validation error scenarios

### Using Presets

```typescript
test('should handle all errors', async ({ mocker, page }) => {
  // Apply error-scenarios preset
  await mocker.selectPreset('error-scenarios');
  await mocker.reloadPages('networkidle');
  
  // All endpoints now return errors
});
```

## 📄 Page Objects

Page objects encapsulate page structure and provide reusable methods.

### Example Usage

```typescript
test('should add product to cart', async ({ shopPage }) => {
  await shopPage.navigate();
  await shopPage.addFirstProductToCart();
  
  await expect(shopPage.notification).toContainText('Added to cart');
});
```

### Creating New Page Objects

1. Create a new file in `src/page-objects/pages/`
2. Extend `BasePage`
3. Define locators in the constructor
4. Add methods for user actions
5. Register in `src/fixtures/page-fixtures.ts`

**Example:**
```typescript
import { BasePage } from './base-page.po';
import { Locator, Page } from '@playwright/test';

export class AdminPage extends BasePage {
  readonly pageHeader: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    super(page, '/admin');
    
    this.pageHeader = this.$('h1');
    this.createButton = this.$('.create-button');
  }

  async createProduct(): Promise<void> {
    await this.createButton.click();
  }
}
```

## 📊 Test Data

Test data is centralized in `src/data/` files to avoid hardcoding values in tests.

```typescript
import { SHOP_PAGE, ERROR_SCENARIOS } from '../data/shop.data';

test('should display title', async ({ shopPage }) => {
  await expect(shopPage.pageHeader).toHaveText(SHOP_PAGE.title);
});
```

## 🔧 Configuration

### Playwright Config

Key configuration in `playwright.config.ts`:

- **Dual Server Setup**: Automatically starts React app (port 3000) and mock server (port 9999)
- **Timeouts**: 60s test timeout, 5s assertion timeout
- **Retries**: 2 retries in CI, 0 locally
- **Workers**: 3 in CI, 8 locally
- **Artifacts**: Screenshots and videos on failure

### CI/CD Integration

The configuration is optimized for CI environments:
- Runs headlessly in CI
- Parallel execution with 3 workers
- Automatic server startup
- Failure artifacts (screenshots, videos, traces)

## 🐛 Debugging

### Using Playwright UI Mode

```bash
npm run test:e2e:ui
```

UI mode provides:
- Visual test runner
- Step-by-step execution
- Time travel debugging
- DOM snapshots
- Network inspection

### Using Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for:
- Breakpoint debugging
- Console access
- Locator picker
- Step execution

### Using VSCode Extension

Install the Playwright Test for VSCode extension for:
- Run tests from editor
- Inline test results
- Debug support
- Test generation

## 📝 Writing New Tests

Use `template.spec.ts` as a starting point:

1. Copy template to new file
2. Update describe block name
3. Update page objects and fixtures
4. Fill in test steps
5. Update test data imports

**Best Practices:**
- Use `test.step()` for clarity
- One concept per test
- Use soft assertions for non-critical checks
- Always configure mocks in dedicated steps
- Use descriptive test names
- Tag tests appropriately

## 🔍 Common Patterns

### Testing with Mocks

```typescript
test('should handle server error', async ({ mocker, shopPage }) => {
  await test.step('Configure mock', async () => {
    await mocker.selectScenario('getProducts', 'serverError');
    await mocker.reloadPages('networkidle');
  });

  await test.step('Verify error display', async () => {
    await shopPage.navigate();
    // Assert error state
  });
});
```

### Testing User Workflows

```typescript
test('complete purchase flow', async ({ shopPage, cartPage, mocker }) => {
  await mocker.selectScenario('createOrder', 'success');
  
  await test.step('Add product to cart', async () => {
    await shopPage.navigate();
    await shopPage.addFirstProductToCart();
  });
  
  await test.step('Go to cart', async () => {
    await shopPage.goToCart();
  });
  
  await test.step('Complete checkout', async () => {
    await cartPage.checkout();
    await expect(cartPage.notification).toContainText('Success');
  });
});
```

### Error Loop Pattern

```typescript
const errors = [
  { scenario: 'unauthorized', message: 'Unauthorized' },
  { scenario: 'serverError', message: 'Server Error' },
];

for (const error of errors) {
  test(`should handle ${error.scenario}`, async ({ mocker, page }) => {
    await mocker.selectScenario('getProducts', error.scenario);
    await mocker.reloadPages();
    // Assert error display
  });
}
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [ng-apimock Documentation](https://ngapimock.org/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## 🎯 Next Steps

1. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

2. **Verify setup**:
   ```bash
   npm run test:e2e:ui
   ```

3. **Run your first test**:
   ```bash
   npx playwright test shop.spec.ts
   ```

4. **Adjust selectors**: Update page objects to match your actual DOM structure

5. **Add more tests**: Use template.spec.ts to create new test files

---

**Note**: Tests are currently configured with placeholder selectors and assertions. Update them based on your actual React components and UI implementation.
