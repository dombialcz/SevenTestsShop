# Playwright Mocker Integration Guide

This guide demonstrates how to use the `mocker` fixture in Playwright tests to control ng-apimock mock server state during E2E testing.

## Overview

The `mocker` fixture provides a Playwright-integrated interface to ng-apimock, allowing you to:
- Switch between different response scenarios for specific API endpoints
- Apply preset configurations for complex test setups
- Dynamically modify preset variables (e.g., permissions)
- Reload pages to apply mock changes
- Enable/disable mocking per test

---

## Mocker Fixture Setup

### Fixture Definition

The mocker is automatically available in all tests via the fixture system:

**File**: `src/fixtures/mock-fixtures.ts`

```typescript
import { Mocker } from '@access-group/utils';
import { PlaywrightTestArgs } from '@playwright/test';

export interface MockFixtures {
  mocker: Mocker;
}

export const mockFixtures = {
  mocker: async ({ context }: PlaywrightTestArgs, use: UseFunction) => {
    await use(new Mocker(context));
  },
};
```

### Mocker Class Implementation

**File**: `src/utils/mocker.ts`

```typescript
import { BaseClient } from '@ng-apimock/base-client';
import { BrowserContext } from '@playwright/test';

export class Mocker extends BaseClient {
  constructor(
    private browserContext: BrowserContext,
    private apiBaseUrl = 'http://localhost:4200/',
    private mockServerBaseUrl = 'http://localhost:9999/',
    private mockServerCookieName = 'apimockid',
  ) {
    super({ baseUrl: mockServerBaseUrl, identifier: mockServerCookieName });
  }

  async enable(context: BrowserContext = this.browserContext) {
    await context.addCookies([
      { name: this.mockServerCookieName, value: this.ngApimockId, url: this.apiBaseUrl }
    ]);
    return this;
  }

  async disable(context: BrowserContext = this.browserContext) {
    await context.clearCookies({ name: this.mockServerCookieName });
    return this;
  }

  async selectScenario(apiName: string, scenario: string): Promise<void> {
    await super.selectScenario(apiName, scenario);
    await this.enable();
  }

  async selectPreset(preset: string): Promise<void> {
    await super.selectPreset(preset);
    await this.enable();
  }

  async reloadPages(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void> {
    for (const page of this.browserContext.pages()) {
      await page.reload();
      if (state) await page.waitForLoadState(state);
    }
  }
}
```

---

## Core Mocker Methods

### 1. `selectScenario(apiName, scenario)`

Switch to a specific response scenario for an API endpoint.

**Parameters:**
- `apiName` (string): The unique name defined in the `.mock.json` file
- `scenario` (string): The scenario name from the `responses` object

**Usage:**

```typescript
test('should handle empty search results', async ({ mocker, page }) => {
  // Switch to 'searchContactsEmpty' scenario for the 'postPayeeContactsFilter' mock
  await mocker.selectScenario('postPayeeContactsFilter', 'searchContactsEmpty');
  
  await page.goto('/payees');
  await page.fill('[name="search"]', 'nonexistent');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.empty-state')).toBeVisible();
});
```

**Common Patterns:**

```typescript
// Success scenario
await mocker.selectScenario('getUsers', 'success');

// Empty list scenario
await mocker.selectScenario('getUsers', 'empty');

// Error scenarios
await mocker.selectScenario('getUsers', 'unauthorized');
await mocker.selectScenario('getUsers', 'forbidden');
await mocker.selectScenario('getUsers', 'serverError');

// Custom scenarios
await mocker.selectScenario('getUsers', 'slowResponse');
await mocker.selectScenario('createUser', 'validationError');
```

### 2. `selectPreset(presetName)`

Apply a preset configuration that sets multiple mocks and variables at once.

**Parameters:**
- `presetName` (string): The preset name defined in `.preset.json` file

**Usage:**

```typescript
test('should restrict actions without permissions', async ({ mocker, page }) => {
  // Apply preset that configures multiple permission-related mocks
  await mocker.selectPreset('configurablePermissions');
  
  await page.goto('/policies');
  
  await expect(page.locator('.create-button')).toBeDisabled();
});
```

**Preset File Example:**

```json
{
  "name": "configurablePermissions",
  "mocks": {
    "getUserPermissionsSummary": {
      "scenario": "configurablePermissions"
    }
  },
  "variables": {
    "approvalsAssignApprovalPoliciesPermissions": {
      "view": true,
      "edit": true,
      "create": true,
      "delete": true
    }
  }
}
```

### 3. `setVariable(variableName, value)`

Dynamically modify preset variables without reloading preset.

**Parameters:**
- `variableName` (string): Variable name from preset
- `value` (any): New value for the variable

**Usage:**

```typescript
test('should disable create button without create permission', async ({ mocker, page }) => {
  // Apply base preset
  await mocker.selectPreset('configurablePermissions');
  
  // Override specific permission variable
  const noCreatePermission = { view: true, create: false, delete: true, edit: true };
  await mocker.setVariable('approvalsManageCustomApprovalPolicyAndLevelPermissions', noCreatePermission);
  
  // Reload page to apply changes
  await mocker.reloadPages();
  
  await page.goto('/policies');
  await expect(page.locator('.create-button')).toBeDisabled();
});
```

### 4. `reloadPages(state?)`

Reload all pages in the browser context and wait for load state.

**Parameters:**
- `state` (optional): `'load'` | `'domcontentloaded'` | `'networkidle'`

**Usage:**

```typescript
test('should apply new mock configuration after reload', async ({ mocker, page }) => {
  await page.goto('/dashboard');
  
  // Change mock scenario
  await mocker.selectScenario('getStats', 'highTraffic');
  
  // Reload page to fetch new mock data
  await mocker.reloadPages('networkidle');
  
  await expect(page.locator('.traffic-indicator')).toContainText('High');
});
```

### 5. `enable()` / `disable()`

Manually control mock server activation (usually automatic).

**Usage:**

```typescript
test('should bypass mocks for specific test', async ({ mocker, page }) => {
  // Disable mocking
  await mocker.disable();
  
  // Test will hit real API or fail if not available
  await page.goto('/users');
  
  // Re-enable mocking
  await mocker.enable();
});
```

---

## Common Test Patterns

### Pattern 1: Basic Scenario Switching

```typescript
test('should display search results', async ({ mocker, page }) => {
  await mocker.selectScenario('postPayeeContactsFilter', 'searchContactsFound');
  
  await page.goto('/contacts');
  await page.fill('[name="search"]', 'John');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.contact-item')).toHaveCount(3);
});
```

### Pattern 2: Error Testing Loop

```typescript
const ERRORS = [
  { scenario: 'unauthorized', errorBody: { title: 'Unauthorized', message: 'Please log in' } },
  { scenario: 'forbidden', errorBody: { title: 'Forbidden', message: 'No access' } },
  { scenario: 'serverError', errorBody: { title: 'Error', message: 'Server error' } },
];

test.describe('API Error Handling', () => {
  for (const error of ERRORS) {
    test(`should display ${error.scenario} error`, async ({ mocker, page }) => {
      await mocker.selectScenario('getUsers', error.scenario);
      await mocker.reloadPages();
      
      await page.goto('/users');
      await expect(page.locator('.error-title')).toContainText(error.errorBody.title);
    });
  }
});
```

### Pattern 3: Permission Testing with Presets

```typescript
test('should disable delete buttons without permission', async ({ mocker, page }) => {
  await test.step('Configure mocks', async () => {
    await mocker.selectPreset('configurablePermissions');
    
    const noDeletePermission = { view: true, create: true, delete: false, edit: true };
    await mocker.setVariable('approvalsManageCustomApprovalPolicyAndLevelPermissions', noDeletePermission);
  });
  
  await page.goto('/policies');
  
  await test.step('All delete buttons should be disabled', async () => {
    const deleteButtons = page.locator('.delete-button');
    const count = await deleteButtons.count();
    
    for (let i = 0; i < count; i++) {
      await expect(deleteButtons.nth(i)).toBeDisabled();
    }
  });
});
```

### Pattern 4: BeforeEach Setup

```typescript
test.describe('User Management', () => {
  test.beforeEach(async ({ mocker, page }) => {
    // Set up common mock configuration for all tests
    await mocker.selectScenario('getUserPermissions', 'adminPermissions');
    await mocker.selectScenario('getUsers', 'success');
    
    await page.goto('/users');
  });

  test('should allow creating users', async ({ page }) => {
    await page.click('.create-user-button');
    await expect(page.locator('.user-form')).toBeVisible();
  });

  test('should allow deleting users', async ({ page }) => {
    await page.click('.delete-user-button:first-child');
    await expect(page.locator('.confirm-dialog')).toBeVisible();
  });
});
```

### Pattern 5: Conditional Mock Setup

```typescript
test('should handle different data states', async ({ mocker, page }) => {
  await test.step('Setup: No existing data', async () => {
    await mocker.selectScenario('getPayeeContacts', 'emptyList');
  });
  
  await page.goto('/payees');
  await expect(page.locator('.empty-state')).toBeVisible();
  
  await test.step('Add data and verify', async () => {
    await mocker.selectScenario('getPayeeContacts', 'withData');
    await mocker.reloadPages();
    
    await expect(page.locator('.payee-item')).toHaveCount(5);
  });
});
```

### Pattern 6: Visual Testing with Mocks

```typescript
test.describe('@visual', () => {
  test('empty state screenshot', async ({ mocker, page }, testInfo) => {
    await mocker.selectScenario('getPolicies', 'No policies');
    
    await page.goto('/policies');
    await expect(page.locator('.container')).toHaveScreenshot(testInfo.title);
  });

  test('loaded state screenshot', async ({ mocker, page }, testInfo) => {
    await mocker.selectScenario('getPolicies', 'success');
    
    await page.goto('/policies');
    await expect(page.locator('.container')).toHaveScreenshot(testInfo.title);
  });
});
```

---

## Advanced Usage

### Multiple Scenario Changes in Sequence

```typescript
test('should handle workflow with multiple API calls', async ({ mocker, page }) => {
  // Initial state
  await mocker.selectScenario('getUsers', 'empty');
  await page.goto('/users');
  
  // After user creation
  await mocker.selectScenario('getUsers', 'oneUser');
  await mocker.selectScenario('createUser', 'success');
  await page.click('.create-user-button');
  await page.fill('[name="name"]', 'John Doe');
  await page.click('button[type="submit"]');
  
  await mocker.reloadPages();
  await expect(page.locator('.user-item')).toHaveCount(1);
});
```

### Testing Delayed Responses

```typescript
test('should show loading state during slow API call', async ({ mocker, page }) => {
  // Use scenario with delay configured in mock
  await mocker.selectScenario('createUser', 'successDelayed');
  
  await page.goto('/users/new');
  await page.fill('[name="name"]', 'John');
  await page.click('button[type="submit"]');
  
  // Loading indicator should appear
  await expect(page.locator('.loading-spinner')).toBeVisible();
  
  // Eventually succeeds (with 2s delay from mock)
  await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });
});
```

### Complex Permission Scenarios

```typescript
test('should show different UI based on permission combination', async ({ mocker, page }) => {
  await test.step('Setup: View + Edit only', async () => {
    await mocker.selectPreset('configurablePermissions');
    
    const viewEditOnly = { view: true, create: false, delete: false, edit: true };
    await mocker.setVariable('approvalsManageCustomApprovalPolicyAndLevelPermissions', viewEditOnly);
    await mocker.reloadPages();
  });
  
  await page.goto('/policies');
  
  await test.step('Verify UI state', async () => {
    // Can view
    await expect(page.locator('.policy-list')).toBeVisible();
    
    // Can edit
    await expect(page.locator('.edit-button').first()).toBeEnabled();
    
    // Cannot create
    await expect(page.locator('.create-button')).toBeDisabled();
    
    // Cannot delete
    await expect(page.locator('.delete-button').first()).toBeDisabled();
  });
});
```

### Accessibility Testing with Different States

```typescript
test('@a11y - should be accessible with different data states', async ({ mocker, page }, testInfo) => {
  await test.step('Empty state accessibility', async () => {
    await mocker.selectScenario('getUsers', 'empty');
    await page.goto('/users');
    
    await expect(page).toBeAccessible(testInfo, '.container');
  });
  
  await test.step('Loaded state accessibility', async () => {
    await mocker.selectScenario('getUsers', 'success');
    await mocker.reloadPages();
    
    await expect(page).toBeAccessible(testInfo, '.container');
  });
  
  await test.step('Error state accessibility', async () => {
    await mocker.selectScenario('getUsers', 'serverError');
    await mocker.reloadPages();
    
    await expect(page).toBeAccessible(testInfo, '.container');
  });
});
```

---

## Best Practices

### 1. Use Test Steps for Organization

```typescript
test('should complete user creation workflow', async ({ mocker, page }) => {
  await test.step('Configure mocks', async () => {
    await mocker.selectScenario('getUsers', 'empty');
    await mocker.selectScenario('createUser', 'success');
  });
  
  await test.step('Navigate to create form', async () => {
    await page.goto('/users/new');
  });
  
  await test.step('Fill and submit form', async () => {
    await page.fill('[name="name"]', 'John Doe');
    await page.click('button[type="submit"]');
  });
  
  await test.step('Verify success', async () => {
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### 2. Group Mock Configuration

```typescript
test('complex scenario setup', async ({ mocker, page }) => {
  await test.step('Configure mocks', async () => {
    // All mock configuration in one place
    await mocker.selectPreset('configurablePermissions');
    await mocker.setVariable('userPermissions', { view: true, edit: false });
    await mocker.selectScenario('getUsers', 'success');
    await mocker.selectScenario('getDepartments', 'success');
    await mocker.reloadPages();
  });
  
  // Rest of test...
});
```

### 3. Use Descriptive Scenario Names

```typescript
// ✅ GOOD: Descriptive scenario names
await mocker.selectScenario('getUsers', 'emptyList');
await mocker.selectScenario('getUsers', 'validationError');
await mocker.selectScenario('getUsers', 'unauthorizedAccess');

// ❌ BAD: Vague scenario names
await mocker.selectScenario('getUsers', 'scenario1');
await mocker.selectScenario('getUsers', 'test');
await mocker.selectScenario('getUsers', 'error');
```

### 4. Always Reload After Variable Changes

```typescript
test('permission change requires reload', async ({ mocker, page }) => {
  await mocker.selectPreset('configurablePermissions');
  await mocker.setVariable('permissions', { create: false });
  
  // ✅ REQUIRED: Reload to apply variable changes
  await mocker.reloadPages();
  
  await page.goto('/users');
});
```

### 5. Reset State Between Tests

```typescript
test.describe('User Tests', () => {
  // Reset to default scenario before each test
  test.beforeEach(async ({ mocker }) => {
    await mocker.selectScenario('getUsers', 'success');
    await mocker.selectScenario('createUser', 'success');
  });

  test('test 1', async ({ page }) => {
    // Runs with default scenarios
  });

  test('test 2', async ({ mocker, page }) => {
    // Override for specific test
    await mocker.selectScenario('getUsers', 'error');
  });
});
```

### 6. Document Mock Dependencies

```typescript
/**
 * Tests user creation workflow
 * 
 * Mock Dependencies:
 * - getUsers: Returns current user list
 * - createUser: Simulates user creation
 * - getUserPermissions: Controls UI permissions
 */
test('should create new user', async ({ mocker, page }) => {
  await mocker.selectScenario('getUsers', 'empty');
  await mocker.selectScenario('createUser', 'success');
  // ...
});
```

---

## Troubleshooting

### Mock Changes Not Applied

**Problem**: Changes to scenarios don't reflect in the UI.

**Solution**:
```typescript
// Always reload after changing scenarios mid-test
await mocker.selectScenario('getUsers', 'newScenario');
await mocker.reloadPages(); // ← Add this
```

### Preset Variables Not Working

**Problem**: Variable changes don't affect the application.

**Solution**:
```typescript
// 1. Ensure preset is selected first
await mocker.selectPreset('configurablePermissions');

// 2. Set variable
await mocker.setVariable('permissions', { view: true });

// 3. MUST reload pages
await mocker.reloadPages();
```

### Wrong Scenario Active

**Problem**: Test uses unexpected mock data.

**Solution**:
```typescript
// Reset to known state in beforeEach
test.beforeEach(async ({ mocker }) => {
  await mocker.selectScenario('getUsers', 'success'); // Default state
});

// Or check dev interface at http://localhost:9999/dev-interface
```

### Mock Not Found Error

**Problem**: `Mock with name 'xyz' not found`.

**Solution**:
```typescript
// 1. Verify mock name matches .mock.json file exactly
await mocker.selectScenario('getUsers', 'success'); // ← Must match "name" property

// 2. Check mock is loaded (visit dev interface)

// 3. Verify mock pattern matches in playwright config
```

### Cookie Issues

**Problem**: Mocks work in dev interface but not in tests.

**Solution**:
```typescript
// Ensure cookie is set (usually automatic with selectScenario)
await mocker.selectScenario('getUsers', 'success');
await mocker.enable(); // ← Explicitly enable if needed

// Check cookie in browser context
const cookies = await context.cookies();
console.log(cookies); // Should include 'apimockid'
```

---

## React/TypeScript Adaptation

For React projects using TypeScript, adapt the Mocker class:

### TypeScript Mocker (React)

```typescript
import { BaseClient } from '@ng-apimock/base-client';
import { BrowserContext } from '@playwright/test';

export interface MockerOptions {
  apiBaseUrl?: string;
  mockServerBaseUrl?: string;
  cookieName?: string;
}

export class Mocker extends BaseClient {
  constructor(
    private browserContext: BrowserContext,
    options: MockerOptions = {}
  ) {
    const {
      apiBaseUrl = 'http://localhost:3000',
      mockServerBaseUrl = 'http://localhost:9999',
      cookieName = 'apimockid'
    } = options;
    
    super({ baseUrl: mockServerBaseUrl, identifier: cookieName });
    
    this.apiBaseUrl = apiBaseUrl;
    this.cookieName = cookieName;
  }

  private apiBaseUrl: string;
  private cookieName: string;

  async enable(): Promise<this> {
    await this.browserContext.addCookies([{
      name: this.cookieName,
      value: this.ngApimockId,
      url: this.apiBaseUrl
    }]);
    return this;
  }

  async disable(): Promise<this> {
    await this.browserContext.clearCookies({ name: this.cookieName });
    return this;
  }

  async selectScenario(apiName: string, scenario: string): Promise<void> {
    await super.selectScenario(apiName, scenario);
    await this.enable();
  }

  async selectPreset(preset: string): Promise<void> {
    await super.selectPreset(preset);
    await this.enable();
  }

  async reloadPages(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void> {
    for (const page of this.browserContext.pages()) {
      await page.reload();
      if (state) {
        await page.waitForLoadState(state);
      }
    }
  }
}
```

### Playwright Fixture (React)

```typescript
import { test as base } from '@playwright/test';
import { Mocker } from './mocker';

type MyFixtures = {
  mocker: Mocker;
};

export const test = base.extend<MyFixtures>({
  mocker: async ({ context }, use) => {
    const mocker = new Mocker(context);
    await use(mocker);
  },
});

export { expect } from '@playwright/test';
```

### Usage in React Tests

```typescript
import { test, expect } from './fixtures';

test('should display users', async ({ mocker, page }) => {
  await mocker.selectScenario('getUsers', 'success');
  
  await page.goto('/users');
  
  await expect(page.locator('.user-card')).toHaveCount(5);
});
```

---

## Quick Reference

### Common Methods

| Method | Purpose | When to Use |
|--------|---------|-------------|
| `selectScenario(name, scenario)` | Switch API response | Change specific endpoint behavior |
| `selectPreset(preset)` | Apply multiple mocks | Set up complex scenarios |
| `setVariable(name, value)` | Modify preset variable | Change permissions/config |
| `reloadPages(state?)` | Reload all pages | Apply mock changes |
| `enable()` | Activate mocking | Usually automatic |
| `disable()` | Deactivate mocking | Test without mocks |

### Common Scenarios

| Scenario Name | HTTP Status | Use Case |
|---------------|-------------|----------|
| `success` | 200/201 | Normal successful response |
| `empty` | 200 | Empty list/no results |
| `unauthorized` | 401 | Not logged in |
| `forbidden` | 403 | No permission |
| `notFound` | 404 | Resource doesn't exist |
| `validationError` | 400 | Invalid input |
| `serverError` | 500 | Server failure |
| `delayed` | 200/201 | Slow response (with delay) |

---

## Additional Resources

- [ng-apimock Documentation](https://ngapimock.org/)
- [Playwright Testing](https://playwright.dev/)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [BaseClient API](https://ngapimock.org/docs/api/base-client)

---

## Summary

The `mocker` fixture provides powerful control over API responses during E2E testing:

1. **Switch scenarios** with `selectScenario()` for different API responses
2. **Apply presets** with `selectPreset()` for complex multi-mock setups
3. **Modify variables** with `setVariable()` for dynamic configuration
4. **Reload pages** with `reloadPages()` to apply changes
5. **Organize tests** using test steps and beforeEach hooks
6. **Test all states**: success, errors, permissions, loading, empty

This enables comprehensive E2E testing without backend dependencies while simulating realistic scenarios including errors, delays, and edge cases.
