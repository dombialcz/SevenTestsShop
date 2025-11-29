# Playwright E2E Test Setup Guide

This guide provides a complete template for setting up Playwright E2E tests with accessibility checks, mock server integration, and structured page object patterns.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Playwright Configuration](#playwright-configuration)
3. [Fixtures System](#fixtures-system)
4. [Page Object Pattern](#page-object-pattern)
5. [Test Structure](#test-structure)
6. [Custom Assertions](#custom-assertions)
7. [Complete Example](#complete-example)

---

## Project Structure

```
apps/
└── your-app-e2e/
    ├── playwright.config.ts          # Main Playwright configuration
    ├── storage-state.json             # Auth state (auto-generated)
    └── src/
        ├── fixtures.ts                # Main fixture exports
        ├── fixtures/
        │   ├── page-fixtures.ts       # Page object fixtures
        │   ├── mock-fixtures.ts       # Mock server fixtures
        │   └── api-fixtures.ts        # API client fixtures (optional)
        ├── page-objects/
        │   ├── elements/              # Reusable UI elements
        │   │   ├── text-input.el.ts
        │   │   ├── dropdown.el.ts
        │   │   └── search-box.el.ts
        │   └── pages/                 # Page objects
        │       ├── base-page.po.ts
        │       └── [feature]/
        │           ├── feature-list.po.ts
        │           └── feature-form.po.ts
        ├── utils/
        │   ├── mocker.ts              # Mock server client
        │   └── accessibility-scanner.ts
        ├── data/                      # Test data and constants
        │   └── feature.data.ts
        └── specs/                     # Test files
            ├── template.spec.ts       # Test template
            └── [feature]/
                └── feature.spec.ts
```

---

## Playwright Configuration

**File**: `apps/your-app-e2e/playwright.config.ts`

This configuration includes:
- Dual web server setup (app + mock server)
- Accessibility testing extensions
- Custom matchers for common assertions
- CI/CD optimizations

```typescript
import { devices, expect, Locator, Page, PlaywrightTestConfig, TestInfo } from '@playwright/test';
import { AccessibilityScanner } from './src/utils/accessibility-scanner';

const config: PlaywrightTestConfig = {
  // Test execution settings
  expect: {
    timeout: 4 * 1000,
  },
  timeout: 60 * 1000,
  maxFailures: process.env.CI ? 5 : 0,
  forbidOnly: !!process.env.CI,
  testDir: './src/specs',
  grepInvert: /@visual/,  // Exclude visual tests by default
  retries: process.env.CI ? 1 : 0,
  outputDir: '../../.tmp/pw-test-results',
  workers: process.env.CI ? 3 : 8,
  fullyParallel: true,
  
  // Reporting
  reporter: [
    [process.env.CI ? 'dot' : 'line'],
    ['html', { 
      outputFolder: process.env.CI ? 'html-report' : '../../.tmp/pw-report', 
      open: 'never' 
    }],
  ],

  // Start both application and mock server before tests
  webServer: [
    {
      // Your application server
      command: 'npm start',  // Adjust to your start command
      url: 'http://localhost:3000',
      timeout: 180 * 1000,
      reuseExistingServer: !process.env.CI,
      stderr: 'pipe',
      stdout: 'pipe',
    },
    {
      // Mock API server
      command: 'npm run mock-server',
      url: 'http://localhost:9999/dev-interface/#/mocks',
      timeout: 30 * 1000,
      reuseExistingServer: !process.env.CI,
      stderr: 'pipe',
      stdout: 'pipe',
    },
  ],

  // Browser configuration
  use: {
    trace: { mode: 'retain-on-failure', sources: true },
    ignoreHTTPSErrors: true,
    screenshot: { mode: 'only-on-failure', fullPage: true },
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  // Test projects (browsers)
  projects: [
    {
      name: 'Chrome',
      use: {
        serviceWorkers: 'block',
        actionTimeout: 15000,
        baseURL: process.env.URL || 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        storageState: 'apps/your-app-e2e/storage-state.json',  // Auth state
        launchOptions: {
          chromiumSandbox: false,
          args: ['--disable-infobars', '--no-sandbox', '--incognito', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
};

export default config;

// ============================================
// CUSTOM MATCHERS
// ============================================

expect.extend({
  /**
   * Ensures the page is accessible according to WCAG standards.
   * Attaches detailed violation report to test results.
   *
   * @example
   * await expect(page).toBeAccessible(testInfo);
   * await expect(page).toBeAccessible(testInfo, '.main-content');
   * await expect(page).toBeAccessible(testInfo, page.locator('.modal'));
   */
  async toBeAccessible(
    page: Page, 
    testInfo: TestInfo, 
    include: Locator | string = '.main-content'
  ) {
    const a11yScanner = new AccessibilityScanner(page);
    await a11yScanner.scanPage(include);

    if (a11yScanner.scanResults.violations.length === 0) {
      return {
        message: () => 'pass',
        pass: true,
      };
    } else {
      await a11yScanner.highlightViolations();

      await testInfo.attach('accessibility-scan-results', {
        body: JSON.stringify(a11yScanner.generateViolationsReport(), null, 2),
        contentType: 'application/json',
      });
      
      return {
        message: () => a11yScanner.generateShortReport(),
        pass: false,
      };
    }
  },

  /**
   * Combines toBeVisible() and toHaveText() into a single assertion.
   * Useful for reducing boilerplate in tests.
   *
   * @example
   * await expect(locator).toBeVisibleAndToHaveText('Welcome');
   * await expect(locator).toBeVisibleAndToHaveText(/Welcome, .*/);
   */
  async toBeVisibleAndToHaveText(
    locator: Locator, 
    expected: string | RegExp | Array<string | RegExp>
  ) {
    if (Array.isArray(expected)) {
      for (let i = 0; i < expected.length; i++) {
        await expect(locator.nth(i)).toBeVisible();
      }
    } else {
      await expect(locator).toBeVisible();
    }

    await expect(locator).toHaveText(expected);

    return {
      message: () => 'pass',
      pass: true,
    };
  },
});
```

---

## Fixtures System

Fixtures provide dependency injection for tests, making page objects and utilities available automatically.

### Main Fixtures File

**File**: `apps/your-app-e2e/src/fixtures.ts`

```typescript
import { mergeExpects, test as baseTest } from '@playwright/test';
import { PageFixtures, pageFixtures } from './fixtures/page-fixtures';
import { MockFixtures, mockFixtures } from './fixtures/mock-fixtures';
import { ApiClientsFixtures, apiFixtures } from './fixtures/api-fixtures';

// Type for async fixture functions
export type UseFunction = (...args: any[]) => Promise<void>;

// Define test options (can be customized per test)
export interface TestOptions {
  navigationStrategy: 'local' | 'staging' | 'production';
}

// Extend base test with all fixtures
export const test = baseTest.extend<TestOptions & ApiClientsFixtures & MockFixtures & PageFixtures>({
  navigationStrategy: ['local', { option: true }],
  ...apiFixtures,
  ...mockFixtures,
  ...pageFixtures,
});

// Export merged expect with custom matchers
export const expect = test.expect;
```

### Page Fixtures

**File**: `apps/your-app-e2e/src/fixtures/page-fixtures.ts`

```typescript
import { PlaywrightTestArgs } from '@playwright/test';
import { UseFunction } from '../fixtures';
import { 
  LoginPage,
  DashboardPage,
  UserListPage,
  UserFormPage,
  // ... import your page objects
} from '../page-objects/pages';

export interface PageFixtures {
  // Page objects
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  userListPage: UserListPage;
  userFormPage: UserFormPage;
  // ... add your page objects here
}

export const pageFixtures = {
  // Each page object is a fixture
  loginPage: async ({ page }: PlaywrightTestArgs, use: UseFunction) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }: PlaywrightTestArgs, use: UseFunction) => {
    await use(new DashboardPage(page));
  },

  userListPage: async ({ page }: PlaywrightTestArgs, use: UseFunction) => {
    await use(new UserListPage(page));
  },

  userFormPage: async ({ page }: PlaywrightTestArgs, use: UseFunction) => {
    await use(new UserFormPage(page));
  },

  // ... add fixture definitions for all page objects
};
```

### Mock Fixtures

**File**: `apps/your-app-e2e/src/fixtures/mock-fixtures.ts`

```typescript
import { Mocker } from '../utils/mocker';
import { PlaywrightTestArgs } from '@playwright/test';
import { UseFunction } from '../fixtures';

export interface MockFixtures {
  mocker: Mocker;
}

export const mockFixtures = {
  mocker: async ({ context }: PlaywrightTestArgs, use: UseFunction) => {
    await use(new Mocker(context));
  },
};
```

### API Fixtures (Optional)

**File**: `apps/your-app-e2e/src/fixtures/api-fixtures.ts`

```typescript
import { PlaywrightTestArgs } from '@playwright/test';
import { UseFunction } from '../fixtures';

export interface ApiClientsFixtures {
  apiClient: ApiClient;
  // Add other API clients as needed
}

export const apiFixtures = {
  apiClient: async ({ request }: PlaywrightTestArgs, use: UseFunction) => {
    const client = new ApiClient(request);
    await use(client);
  },
};

// Simple API client example
class ApiClient {
  constructor(private request: any) {}

  async getUsers() {
    return await this.request.get('/api/users');
  }

  async createUser(data: any) {
    return await this.request.post('/api/users', { data });
  }
}
```

---

## Page Object Pattern

### Base Page

All page objects extend from BasePage, which provides common functionality.

**File**: `apps/your-app-e2e/src/page-objects/pages/base-page.po.ts`

```typescript
import { Locator, Page } from '@playwright/test';

export class BasePage {
  readonly notification: Locator;
  readonly modalWindow: Locator;
  readonly loadingIndicator: Locator;

  constructor(
    readonly page: Page,
    readonly url = '',
  ) {
    this.modalWindow = this.page.locator('.modal-content');
    this.notification = this.page.locator('.notification');
    this.loadingIndicator = this.page.locator('[data-role="loading-indicator"]');
  }

  /**
   * Shorthand for page.locator()
   */
  $(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get element by data-role attribute
   */
  dr(dataRole: string): Locator {
    return this.page.locator(`[data-role="${dataRole}"]`);
  }

  /**
   * Get element within modal
   */
  m(selector: string): Locator {
    return this.modalWindow.locator(selector);
  }

  /**
   * Navigate to page URL
   */
  async navigate() {
    await this.page.goto(this.url, { waitUntil: 'load' });
  }

  /**
   * Click button in modal by text
   */
  async clickButtonInModal(buttonName: string): Promise<void> {
    await this.modalWindow.getByRole('button', { name: buttonName }).click();
  }
}
```

### Reusable Elements

**File**: `apps/your-app-e2e/src/page-objects/elements/text-input.el.ts`

```typescript
import { Locator } from '@playwright/test';

export class TextInput {
  readonly root: Locator;
  readonly input: Locator;
  readonly label: Locator;
  readonly error: Locator;
  readonly charCounter: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.input = root.locator('input');
    this.label = root.locator('label');
    this.error = root.locator('.error-message');
    this.charCounter = root.locator('.char-counter');
  }

  async fill(value: string): Promise<void> {
    await this.input.fill(value);
  }

  async getValue(): Promise<string> {
    return await this.input.inputValue();
  }

  async getPlaceholder(): Promise<string> {
    return await this.input.getAttribute('placeholder') || '';
  }
}
```

**File**: `apps/your-app-e2e/src/page-objects/elements/dropdown.el.ts`

```typescript
import { Locator } from '@playwright/test';

export class DropDown {
  readonly root: Locator;
  readonly label: Locator;
  readonly select: Locator;
  readonly options: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.label = root.locator('label');
    this.select = root.locator('select');
    this.options = this.select.locator('option:not(:disabled)');
  }

  async selectOption(value: string): Promise<void> {
    await this.select.selectOption({ label: value });
  }

  async getValue(): Promise<string> {
    const valueIndex = await this.select.inputValue();
    const selectedValue = await this.select.locator(`option[value='${valueIndex}']`).innerText();
    return selectedValue.trim();
  }
}
```

**File**: `apps/your-app-e2e/src/page-objects/elements/search-box.el.ts`

```typescript
import { Locator, Page } from '@playwright/test';

export class SearchBox {
  readonly root: Locator;
  readonly input: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('[data-role="search-box"]');
    this.input = this.root.locator('input');
    this.searchButton = this.root.locator('button[type="submit"]');
    this.clearButton = this.root.locator('button[aria-label="Clear"]');
  }

  async for(searchTerm: string): Promise<void> {
    await this.input.fill(searchTerm);
    await this.searchButton.click();
  }

  async clear(): Promise<void> {
    await this.clearButton.click();
  }

  async getPlaceholder(): Promise<string> {
    return await this.input.getAttribute('placeholder') || '';
  }
}
```

### Page Object Examples

**File**: `apps/your-app-e2e/src/page-objects/pages/user/user-list.po.ts`

```typescript
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base-page.po';
import { SearchBox } from '../../elements/search-box.el';

export class UserListPage extends BasePage {
  readonly container: Locator;
  readonly search: SearchBox;
  readonly createButton: Locator;
  readonly tableHeaders: Locator;
  readonly userRows: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    super(page, '/users');
    
    this.container = this.$('.user-list-container');
    this.search = new SearchBox(page);
    this.createButton = this.dr('create-user-button');
    this.tableHeaders = this.$('th');
    this.userRows = this.$('[data-role="user-row"]');
    this.pagination = this.$('.pagination');
  }

  /**
   * Get specific user row by index or identifier
   */
  userRow(identifier: number | string): UserRowElement {
    const row = typeof identifier === 'number' 
      ? this.userRows.nth(identifier)
      : this.userRows.filter({ hasText: identifier });
    
    return new UserRowElement(row);
  }

  /**
   * Wait for table to finish loading
   */
  async waitForTableToLoad(): Promise<void> {
    await this.loadingIndicator.waitFor({ state: 'hidden' });
    await this.userRows.first().waitFor({ state: 'visible' });
  }
}

/**
 * Represents a single user row
 */
class UserRowElement {
  readonly name: Locator;
  readonly email: Locator;
  readonly role: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;

  constructor(private root: Locator) {
    this.name = root.locator('[data-role="user-name"]');
    this.email = root.locator('[data-role="user-email"]');
    this.role = root.locator('[data-role="user-role"]');
    this.editButton = root.locator('[data-role="edit-button"]');
    this.deleteButton = root.locator('[data-role="delete-button"]');
  }

  async getData() {
    return {
      name: await this.name.innerText(),
      email: await this.email.innerText(),
      role: await this.role.innerText(),
    };
  }
}
```

**File**: `apps/your-app-e2e/src/page-objects/pages/user/user-form.po.ts`

```typescript
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base-page.po';
import { TextInput, DropDown } from '../../elements';

export class UserFormPage extends BasePage {
  readonly container: Locator;
  readonly pageHeader: Locator;
  readonly nameInput: TextInput;
  readonly emailInput: TextInput;
  readonly roleDropdown: DropDown;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page, '/users/new');
    
    this.container = this.$('.user-form-container');
    this.pageHeader = this.$('h1');
    this.nameInput = new TextInput(this.dr('name-input'));
    this.emailInput = new TextInput(this.dr('email-input'));
    this.roleDropdown = new DropDown(this.dr('role-dropdown'));
    this.saveButton = this.dr('save-button');
    this.cancelButton = this.dr('cancel-button');
  }

  /**
   * Fill the entire form
   */
  async fillForm(data: { name: string; email: string; role: string }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.roleDropdown.selectOption(data.role);
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.saveButton.click();
  }
}
```

---

## Test Structure

Tests are organized by feature with consistent patterns using tags.

### Test Template

**File**: `apps/your-app-e2e/src/specs/template.spec.ts`

```typescript
import { expect, test } from '../fixtures';

// NOTE: This is a template file. Tests will be implemented and refined later.
// Fill in the test steps based on actual feature requirements.

test.describe('Feature Name', () => {
  test.beforeEach(async ({ featurePage }) => {
    await featurePage.navigate();
  });

  test.describe('@ui - UI Element Verification', () => {
    test('should display all page elements', async ({ featurePage }) => {
      await test.step('Page header', async () => {
        await expect(featurePage.pageHeader).toBeVisibleAndToHaveText('Expected Title');
      });

      await test.step('Action buttons', async () => {
        await expect(featurePage.createButton).toBeVisible();
        await expect(featurePage.saveButton).toBeVisible();
      });

      await test.step('Form fields', async () => {
        await expect(featurePage.nameInput.label).toHaveText('Name');
        await expect(featurePage.emailInput.label).toHaveText('Email');
      });
    });
  });

  test.describe('@act - User Actions', () => {
    test('should perform action successfully', async ({ featurePage }) => {
      await test.step('Fill form', async () => {
        await featurePage.nameInput.fill('Test User');
        await featurePage.emailInput.fill('test@example.com');
      });

      await test.step('Submit and verify', async () => {
        await featurePage.saveButton.click();
        await expect(featurePage.notification).toHaveText('Success');
      });
    });
  });

  test.describe('@nav - Navigation', () => {
    test('should navigate to details page', async ({ page, featurePage }) => {
      await featurePage.itemRows.first().click();
      await expect(page).toHaveURL(/\/details/);
    });
  });

  test.describe('@a11y - Accessibility', () => {
    test('should be accessible', async ({ page }, testInfo) => {
      await test.step('Main page', async () => {
        await expect.soft(page).toBeAccessible(testInfo);
      });

      await test.step('Modal window', async () => {
        // Open modal
        await expect.soft(page).toBeAccessible(testInfo, '.modal');
      });
    });
  });

  test.describe('@error - Error Handling', () => {
    test('should display API errors', async ({ mocker, featurePage }) => {
      const errors = [
        { scenario: 'unauthorized', expectedMessage: 'Unauthorized' },
        { scenario: 'forbidden', expectedMessage: 'Forbidden' },
        { scenario: 'serverError', expectedMessage: 'Server Error' },
      ];

      for (const error of errors) {
        await test.step(`Scenario: ${error.scenario}`, async () => {
          await mocker.selectScenario('getFeatureData', error.scenario);
          await mocker.reloadPages();
          
          await expect(featurePage.errorMessage).toHaveText(error.expectedMessage);
        });
      }
    });
  });
});
```

### Complete Example Test

**File**: `apps/your-app-e2e/src/specs/users/user-management.spec.ts`

```typescript
import { expect, test } from '../../fixtures';

test.describe('User Management', () => {
  test.beforeEach(async ({ userListPage }) => {
    await userListPage.navigate();
  });

  test.describe('@ui', () => {
    test('should display list page elements', async ({ userListPage }) => {
      await test.step('Table headers', async () => {
        await expect(userListPage.tableHeaders).toHaveText([
          'Name',
          'Email',
          'Role',
          'Actions',
        ]);
      });

      await test.step('User rows', async () => {
        await expect(userListPage.userRows).toHaveCount(10);
      });

      await test.step('First user data', async () => {
        const userData = await userListPage.userRow(0).getData();
        expect(userData).toEqual({
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
        });
      });
    });

    test('should display create form elements', async ({ userFormPage }) => {
      await userFormPage.navigate();

      await test.step('Form header', async () => {
        await expect(userFormPage.pageHeader).toHaveText('Create User');
      });

      await test.step('Input fields', async () => {
        await expect(userFormPage.nameInput.label).toHaveText('Name');
        await expect(userFormPage.emailInput.label).toHaveText('Email Address');
        await expect(userFormPage.roleDropdown.label).toHaveText('Role');
      });

      await test.step('Action buttons', async () => {
        await expect(userFormPage.saveButton).toBeVisible();
        await expect(userFormPage.cancelButton).toBeVisible();
      });
    });
  });

  test.describe('@act', () => {
    test('should search for users', async ({ mocker, userListPage }) => {
      await test.step('Configure mocks', async () => {
        await mocker.selectScenario('searchUsers', 'foundResults');
      });

      await test.step('Perform search', async () => {
        await userListPage.search.for('John');
      });

      await test.step('Verify results', async () => {
        await expect(userListPage.userRows).toHaveCount(2);
        await expect(userListPage.userRow(0).name).toContainText('John');
      });
    });

    test('should create new user', async ({ userFormPage, mocker }) => {
      await userFormPage.navigate();

      await test.step('Configure mocks', async () => {
        await mocker.selectScenario('createUser', 'success');
      });

      await test.step('Fill form', async () => {
        await userFormPage.fillForm({
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'User',
        });
      });

      await test.step('Submit and verify', async () => {
        await userFormPage.submit();
        await expect(userFormPage.notification).toHaveText('User created successfully');
      });
    });

    test('should display validation errors', async ({ userFormPage }) => {
      await userFormPage.navigate();

      await test.step('Submit empty form', async () => {
        await userFormPage.saveButton.click();
      });

      await test.step('Verify validation errors', async () => {
        await expect(userFormPage.nameInput.error).toHaveText('Name is required');
        await expect(userFormPage.emailInput.error).toHaveText('Email is required');
      });
    });
  });

  test.describe('@nav', () => {
    test('should navigate to user details', async ({ page, userListPage }) => {
      await userListPage.userRow(0).name.click();
      await expect(page).toHaveURL(/\/users\/\d+/);
    });

    test('should navigate to create form', async ({ page, userListPage }) => {
      await userListPage.createButton.click();
      await expect(page).toHaveURL('/users/new');
    });
  });

  test.describe('@a11y', () => {
    test('user list page', async ({ page, userListPage }, testInfo) => {
      await test.step('Initial page load', async () => {
        await expect.soft(page).toBeAccessible(testInfo);
      });

      await test.step('With search results', async () => {
        await userListPage.search.for('test');
        await expect.soft(page).toBeAccessible(testInfo);
      });
    });

    test('user create form', async ({ page, userFormPage }, testInfo) => {
      await userFormPage.navigate();

      await test.step('Empty form', async () => {
        await expect.soft(page).toBeAccessible(testInfo);
      });

      await test.step('Form with validation errors', async () => {
        await userFormPage.saveButton.click();
        await expect.soft(page).toBeAccessible(testInfo);
      });
    });
  });

  test.describe('@error', () => {
    test('should handle API errors on list page', async ({ mocker, userListPage }) => {
      const errors = [
        { scenario: 'unauthorized', message: 'Please log in' },
        { scenario: 'forbidden', message: 'Access denied' },
        { scenario: 'serverError', message: 'Server error occurred' },
      ];

      for (const error of errors) {
        await test.step(`Scenario: ${error.scenario}`, async () => {
          await mocker.selectScenario('getUsers', error.scenario);
          await mocker.reloadPages();
          
          await userListPage.navigate();
          // Error display assertions will be added based on actual UI
        });
      }
    });
  });
});
```

---

## Test Data

**File**: `apps/your-app-e2e/src/data/users.data.ts`

```typescript
export const USER_LIST_PAGE = {
  title: 'Users',
  tableHeaders: ['Name', 'Email', 'Role', 'Actions'],
  emptyStateMessage: 'No users found',
};

export const USER_FORM = {
  createTitle: 'Create User',
  editTitle: 'Edit User',
  nameLabel: 'Name',
  emailLabel: 'Email Address',
  roleLabel: 'Role',
  saveButton: 'Save',
  cancelButton: 'Cancel',
};

export const TEST_USER = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin',
};

export const ERRORS = [
  { scenario: 'unauthorized', message: 'Unauthorized access' },
  { scenario: 'forbidden', message: 'Access forbidden' },
  { scenario: 'notFound', message: 'Not found' },
  { scenario: 'serverError', message: 'Server error' },
];
```

---

## Running Tests

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:ui": "playwright test --grep @ui",
    "test:a11y": "playwright test --grep @a11y",
    "test:visual": "playwright test --grep @visual"
  }
}
```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run only UI tests
npm run test:ui

# Run accessibility tests
npm run test:a11y

# Run specific test file
npx playwright test user-management.spec.ts

# Run in debug mode
npm run test:e2e:debug
```

---

## Tag System

Tests use tags to organize and filter:

- `@ui` - UI element verification tests
- `@act` - User action/interaction tests
- `@nav` - Navigation tests
- `@a11y` - Accessibility tests
- `@error` - Error handling tests
- `@visual` - Visual regression tests
- `@smoke` - Critical path tests

**Run specific tags:**
```bash
playwright test --grep @ui
playwright test --grep-invert @visual  # Exclude visual tests
playwright test --grep "@ui|@act"      # Multiple tags
```

---

## Best Practices

### 1. Page Objects
- ✅ Use descriptive names for locators
- ✅ Group related elements together
- ✅ Create reusable element classes
- ✅ Keep page logic in page objects, not tests

### 2. Tests
- ✅ Use `test.step()` for clarity
- ✅ One assertion per step when possible
- ✅ Use soft assertions for non-critical checks
- ✅ Always clean up test data

### 3. Mocks
- ✅ Configure mocks in dedicated test steps
- ✅ Use descriptive scenario names
- ✅ Always reload after mock changes
- ✅ Reset to default scenarios in beforeEach

### 4. Accessibility
- ✅ Test main page states
- ✅ Test interactive elements (modals, dropdowns)
- ✅ Test error states
- ✅ Attach detailed reports on failure

---

## Notes for AI Agents

**Important:**
1. This is a **stub/template** structure
2. Tests will be **filled and refined later** based on actual requirements
3. Mock scenarios should match actual API endpoints
4. Page object selectors need to match actual DOM structure
5. Test data should reflect real application data

**When implementing:**
- Start with `@ui` tests to verify page structure
- Add `@act` tests for user workflows
- Implement `@nav` tests for routing
- Add `@a11y` tests for accessibility
- Implement `@error` tests for edge cases

**Placeholder sections marked with:**
- `// TODO: Implement`
- `// Will be filled later`
- `// Adjust based on actual UI`

---

## Summary

This setup provides:
- ✅ Playwright configuration with dual server startup
- ✅ Custom accessibility matchers
- ✅ Fixture-based dependency injection
- ✅ Page Object Model pattern
- ✅ Reusable UI elements
- ✅ Structured test organization
- ✅ Mock server integration
- ✅ Comprehensive test templates

Use this as a foundation and adapt to your specific application requirements.
