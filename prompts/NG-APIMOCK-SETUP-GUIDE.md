# ng-apimock Mock Server Setup Guide

This guide provides instructions for setting up ng-apimock in a React/MongoDB project based on our Angular implementation.

## Overview

ng-apimock is a powerful mock server that allows you to:
- Develop frontend applications without a live backend
- Create multiple response scenarios for testing
- Switch between scenarios in real-time via a web UI
- Integrate with E2E testing frameworks (Playwright, Cypress, etc.)
- Simulate delays, errors, and edge cases

---

## Installation

### Required Dependencies

Add these packages to your `devDependencies`:

```json
{
  "@ng-apimock/core": "^3.12.0",
  "@ng-apimock/dev-interface": "^3.5.1",
  "@ng-apimock/base-client": "^3.3.1",
  "express": "^4.21.2",
  "http-proxy-middleware": "^2.0.0"
}
```

Install via npm:

```bash
npm install --save-dev @ng-apimock/core @ng-apimock/dev-interface @ng-apimock/base-client express http-proxy-middleware
```

---

## Project Structure

Create the following directory structure:

```
project-root/
├── mock-server/
│   ├── mock-server.js              # Server entry point
│   └── mocks/
│       └── my-app/                 # Replace with your app name
│           ├── mocks/              # API endpoint mock definitions
│           │   └── [feature]/      # Organize by feature (e.g., users, products)
│           │       └── [endpoint]/ # One folder per endpoint
│           │           ├── *.mock.json    # Mock configuration
│           │           └── *.json         # Response data files
│           └── presets/            # Optional preset configurations
│               └── *.preset.json
```

---

## Mock Server Setup

### 1. Create Mock Server Entry Point

Create `mock-server/mock-server.js`:

```javascript
const apiMock = require('@ng-apimock/core');
const devInterface = require('@ng-apimock/dev-interface');
const express = require('express');
const app = express();

// Get app name from command line argument or use default
const appName = process.argv[3] || 'my-app';
console.log(`Starting mock server for ${appName}`);

app.set('port', 9999);

/**
 * Configure ng-apimock processor
 * Docs: https://ngapimock.org/docs/installation#processor
 */
apiMock.processor.process({
  src: 'mock-server/mocks',
  patterns: {
    mocks: `${appName}/mocks/**/*.mock.json`,
    presets: `${appName}/presets/**/*.preset.json`,
  },
  watch: true, // Auto-reload on file changes
});

// Register middleware
app.use(apiMock.middleware);
app.use('/dev-interface', express.static(devInterface));

app.listen(app.get('port'), () => {
  console.log(`Mock server running on http://localhost:${app.get('port')}`);
  console.log(`Dev interface: http://localhost:${app.get('port')}/dev-interface`);
});
```

### 2. Add NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "mock-server": "node ./mock-server/mock-server.js -- my-app",
    "dev:with-mocks": "npm run mock-server & npm start",
    "test:e2e": "npm run mock-server & npx playwright test"
  }
}
```

---

## Mock Definition Format

### File Structure

Each API endpoint requires a `.mock.json` file that defines:
- Request pattern (URL and HTTP method)
- Unique identifier name
- Multiple response scenarios

### Anatomy of a Mock File

```json
{
  "request": {
    "url": "/api/endpoint/pattern",  // Regex pattern
    "method": "GET"                   // HTTP method
  },
  "name": "uniqueMockName",           // Unique identifier
  "isArray": false,                   // Whether response is an array
  "responses": {
    "scenarioName": {
      "default": true,                // Mark one as default
      "status": 200,
      "headers": { "content-type": "application/json" },
      "file": "data.json"             // External file
      // OR
      "data": { "key": "value" }      // Inline data
    }
  }
}
```

---

## Examples by HTTP Method

### GET Request

**File**: `mocks/my-app/mocks/users/get-users/get-users.mock.json`

```json
{
  "request": {
    "url": "/api/users.*",
    "method": "GET"
  },
  "name": "getUsers",
  "isArray": false,
  "responses": {
    "success": {
      "default": true,
      "status": 200,
      "headers": { "content-type": "application/json" },
      "file": "users-list.json"
    },
    "empty": {
      "status": 200,
      "headers": { "content-type": "application/json" },
      "data": []
    },
    "unauthorized": {
      "status": 401
    },
    "forbidden": {
      "status": 403
    },
    "serverError": {
      "status": 500
    }
  }
}
```

**Data file**: `mocks/my-app/mocks/users/get-users/users-list.json`

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "createdAt": "2024-01-16T14:20:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
]
```

### POST Request

**File**: `mocks/my-app/mocks/users/create-user/create-user.mock.json`

```json
{
  "request": {
    "url": "/api/users",
    "method": "POST"
  },
  "name": "createUser",
  "isArray": false,
  "responses": {
    "success": {
      "default": true,
      "status": 201,
      "headers": { "content-type": "application/json" },
      "file": "created-user.json"
    },
    "successDelayed": {
      "status": 201,
      "delay": 2000,
      "headers": { "content-type": "application/json" },
      "file": "created-user.json"
    },
    "validationError": {
      "status": 400,
      "headers": { "content-type": "application/json" },
      "data": {
        "error": "Validation failed",
        "fields": {
          "email": "Invalid email format",
          "password": "Password too weak"
        }
      }
    },
    "conflict": {
      "status": 409,
      "headers": { "content-type": "application/json" },
      "data": {
        "error": "User with this email already exists"
      }
    },
    "unauthorized": {
      "status": 401
    },
    "serverError": {
      "status": 500
    }
  }
}
```

**Data file**: `mocks/my-app/mocks/users/create-user/created-user.json`

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "New User",
  "email": "newuser@example.com",
  "role": "user",
  "createdAt": "2024-11-29T10:00:00Z",
  "updatedAt": "2024-11-29T10:00:00Z"
}
```

### PUT Request

**File**: `mocks/my-app/mocks/users/update-user/update-user.mock.json`

```json
{
  "request": {
    "url": "/api/users/.*",
    "method": "PUT"
  },
  "name": "updateUser",
  "isArray": false,
  "responses": {
    "success": {
      "default": true,
      "status": 200,
      "headers": { "content-type": "application/json" },
      "file": "updated-user.json"
    },
    "notFound": {
      "status": 404,
      "headers": { "content-type": "application/json" },
      "data": {
        "error": "User not found"
      }
    },
    "validationError": {
      "status": 400,
      "headers": { "content-type": "application/json" },
      "data": {
        "error": "Invalid data provided"
      }
    },
    "unauthorized": {
      "status": 401
    },
    "forbidden": {
      "status": 403
    }
  }
}
```

### DELETE Request

**File**: `mocks/my-app/mocks/users/delete-user/delete-user.mock.json`

```json
{
  "request": {
    "url": "/api/users/.*",
    "method": "DELETE"
  },
  "name": "deleteUser",
  "isArray": false,
  "responses": {
    "success": {
      "default": true,
      "status": 204
    },
    "successWithBody": {
      "status": 200,
      "headers": { "content-type": "application/json" },
      "data": {
        "message": "User deleted successfully"
      }
    },
    "notFound": {
      "status": 404,
      "headers": { "content-type": "application/json" },
      "data": {
        "error": "User not found"
      }
    },
    "forbidden": {
      "status": 403,
      "headers": { "content-type": "application/json" },
      "data": {
        "error": "Cannot delete this user"
      }
    },
    "unauthorized": {
      "status": 401
    }
  }
}
```

---

## Presets

Presets allow you to configure multiple mocks at once, useful for setting up specific test scenarios.

**File**: `mocks/my-app/presets/admin-user.preset.json`

```json
{
  "name": "adminUser",
  "mocks": {
    "getUsers": {
      "scenario": "success"
    },
    "createUser": {
      "scenario": "success"
    },
    "deleteUser": {
      "scenario": "success"
    }
  },
  "variables": {
    "userRole": "admin",
    "hasPermissions": true
  }
}
```

**File**: `mocks/my-app/presets/error-scenarios.preset.json`

```json
{
  "name": "errorScenarios",
  "mocks": {
    "getUsers": {
      "scenario": "serverError"
    },
    "createUser": {
      "scenario": "serverError"
    },
    "updateUser": {
      "scenario": "serverError"
    }
  }
}
```

---

## React Integration

### Create React App (CRA)

Add to `package.json`:

```json
{
  "proxy": "http://localhost:9999"
}
```

### Vite

Create/update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
      },
      '/ngapimock': {
        target: 'http://localhost:9999',
        changeOrigin: true,
      }
    }
  }
});
```

### Next.js

Create/update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9999/api/:path*',
      },
      {
        source: '/ngapimock/:path*',
        destination: 'http://localhost:9999/ngapimock/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## Playwright Integration

### Create Mocker Utility

**File**: `tests/utils/mocker.js`

```javascript
const { BaseClient } = require('@ng-apimock/base-client');

class Mocker extends BaseClient {
  constructor(context, options = {}) {
    const {
      apiBaseUrl = 'http://localhost:3000',
      mockServerBaseUrl = 'http://localhost:9999',
      cookieName = 'apimockid'
    } = options;
    
    super({ baseUrl: mockServerBaseUrl, identifier: cookieName });
    this.context = context;
    this.apiBaseUrl = apiBaseUrl;
    this.cookieName = cookieName;
  }

  async enable() {
    await this.context.addCookies([{
      name: this.cookieName,
      value: this.ngApimockId,
      url: this.apiBaseUrl
    }]);
    return this;
  }

  async disable() {
    await this.context.clearCookies({ name: this.cookieName });
    return this;
  }

  async selectScenario(apiName, scenario) {
    await super.selectScenario(apiName, scenario);
    await this.enable();
  }

  async selectPreset(preset) {
    await super.selectPreset(preset);
    await this.enable();
  }

  async reloadPages(state = 'load') {
    for (const page of this.context.pages()) {
      await page.reload();
      if (state) await page.waitForLoadState(state);
    }
  }
}

module.exports = { Mocker };
```

### Playwright Config

**File**: `playwright.config.js`

```javascript
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  webServer: [
    {
      command: 'npm start',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run mock-server',
      url: 'http://localhost:9999/dev-interface',
      timeout: 30 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

### Example Test

**File**: `tests/users.spec.js`

```javascript
const { test, expect } = require('@playwright/test');
const { Mocker } = require('./utils/mocker');

test.describe('User Management', () => {
  let mocker;

  test.beforeEach(async ({ context }) => {
    mocker = new Mocker(context);
  });

  test('should display users list', async ({ page }) => {
    await mocker.selectScenario('getUsers', 'success');
    await page.goto('/users');
    
    await expect(page.locator('.user-item')).toHaveCount(2);
    await expect(page.locator('.user-item').first()).toContainText('John Doe');
  });

  test('should show empty state when no users', async ({ page }) => {
    await mocker.selectScenario('getUsers', 'empty');
    await page.goto('/users');
    
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should handle server error', async ({ page }) => {
    await mocker.selectScenario('getUsers', 'serverError');
    await page.goto('/users');
    
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await mocker.selectScenario('createUser', 'success');
    await page.goto('/users/new');
    
    await page.fill('[name="name"]', 'New User');
    await page.fill('[name="email"]', 'new@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await mocker.selectScenario('createUser', 'validationError');
    await page.goto('/users/new');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.field-error')).toHaveCount(2);
  });

  test('should handle slow response', async ({ page }) => {
    await mocker.selectScenario('createUser', 'successDelayed');
    await page.goto('/users/new');
    
    await page.fill('[name="name"]', 'New User');
    await page.click('button[type="submit"]');
    
    // Should show loading state
    await expect(page.locator('.loading-spinner')).toBeVisible();
    
    // Eventually succeeds
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });
  });
});
```

---

## MongoDB-Specific Considerations

When creating mock data for MongoDB-backed APIs, ensure consistency with MongoDB document structure:

### ObjectId Format
Use 24 hexadecimal characters for `_id` fields:
```json
{
  "_id": "507f1f77bcf86cd799439011"
}
```

### Timestamps
Include ISO 8601 formatted timestamps:
```json
{
  "createdAt": "2024-11-29T10:30:00Z",
  "updatedAt": "2024-11-29T15:45:30Z"
}
```

### Nested Documents
Match your schema structure:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  }
}
```

### Arrays and References
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "tags": ["important", "urgent"],
  "assignedTo": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

### Pagination Responses
```json
{
  "data": [
    { "_id": "...", "name": "Item 1" },
    { "_id": "...", "name": "Item 2" }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## Advanced Features

### Delays

Simulate slow network responses:

```json
{
  "responses": {
    "slow": {
      "status": 200,
      "delay": 3000,
      "headers": { "content-type": "application/json" },
      "data": { "message": "This took 3 seconds" }
    }
  }
}
```

### Connectivity Issues

Simulate network failures:

```json
{
  "responses": {
    "networkError": {
      "status": 0
    }
  }
}
```

### Complex URL Patterns

Use regex for dynamic URLs:

```json
{
  "request": {
    "url": "/api/users/[a-f0-9]{24}/orders",
    "method": "GET"
  }
}
```

### Response Based on Request

Use inline data with variables:

```json
{
  "responses": {
    "dynamic": {
      "status": 200,
      "headers": { "content-type": "application/json" },
      "data": {
        "requestUrl": "<%=url%>",
        "timestamp": "<%=new Date().toISOString()%>"
      }
    }
  }
}
```

---

## Dev Interface

Once the mock server is running, access the web interface at:

```
http://localhost:9999/dev-interface
```

### Features:
- **View all mocks**: See all registered endpoints
- **Switch scenarios**: Change response scenarios in real-time
- **Apply presets**: Activate preset configurations
- **Reset state**: Return all mocks to default scenarios
- **Variables**: View and edit preset variables
- **Recording**: Record actual API calls (advanced)

---

## Best Practices

### 1. Organize by Feature
```
mocks/
  users/
    get-users/
    create-user/
    update-user/
  products/
    get-products/
    get-product-by-id/
```

### 2. Use Descriptive Names
- Mock name: `getUserById` not `mock1`
- Scenario names: `success`, `notFound`, `validationError`

### 3. Always Include Error Scenarios
Every mock should have:
- `success` (default)
- `unauthorized` (401)
- `forbidden` (403)
- `notFound` (404) - for specific resource endpoints
- `serverError` (500)

### 4. External Files for Large Responses
Use `"file"` for responses > 50 lines:
```json
{
  "file": "large-dataset.json"
}
```

Use `"data"` for small inline responses:
```json
{
  "data": { "id": 1, "name": "Simple" }
}
```

### 5. Version Your Mocks
For API versioning:
```
mocks/
  v1/
    users/
  v2/
    users/
```

### 6. Use Presets for Test Scenarios
Create presets for common workflows:
- `happy-path.preset.json` - All success scenarios
- `error-scenarios.preset.json` - All error scenarios
- `edge-cases.preset.json` - Unusual but valid states

---

## Troubleshooting

### Mocks Not Loading
1. Check console output for errors
2. Verify file paths in `mock-server.js`
3. Ensure `.mock.json` files are valid JSON
4. Check that `patterns` match your directory structure

### Scenarios Not Switching
1. Verify cookie is set (check browser DevTools)
2. Clear cookies and reload
3. Check mock name matches exactly
4. Ensure dev interface shows the mock

### Proxy Not Working
1. Verify proxy configuration in your build tool
2. Check both servers are running (app + mock server)
3. Inspect network tab for request routing
4. Try absolute URLs to mock server as fallback

### Performance Issues
1. Reduce number of mocks loaded
2. Use specific patterns instead of `**/*.mock.json`
3. Disable watch mode in production testing
4. Split mocks by app/feature

---

## Migration Checklist

- [ ] Install dependencies
- [ ] Create `mock-server/mock-server.js`
- [ ] Set up directory structure
- [ ] Create mock definitions for each endpoint
- [ ] Add response data files
- [ ] Configure proxy in dev server
- [ ] Add npm scripts
- [ ] Test manually via dev interface
- [ ] Create Mocker utility (if using Playwright)
- [ ] Write E2E tests using mocks
- [ ] Create presets for common scenarios
- [ ] Document mock scenarios for team

---

## Additional Resources

- [ng-apimock Documentation](https://ngapimock.org/)
- [ng-apimock GitHub](https://github.com/ng-apimock/core)
- [Express.js Documentation](https://expressjs.com/)
- [Playwright Testing](https://playwright.dev/)

---

## Example: Complete User CRUD Setup

```
mock-server/
└── mocks/
    └── my-app/
        ├── mocks/
        │   └── users/
        │       ├── get-users/
        │       │   ├── get-users.mock.json
        │       │   ├── users-list.json
        │       │   └── empty-list.json
        │       ├── get-user-by-id/
        │       │   ├── get-user-by-id.mock.json
        │       │   └── user-detail.json
        │       ├── create-user/
        │       │   ├── create-user.mock.json
        │       │   └── created-user.json
        │       ├── update-user/
        │       │   ├── update-user.mock.json
        │       │   └── updated-user.json
        │       └── delete-user/
        │           └── delete-user.mock.json
        └── presets/
            ├── admin-user.preset.json
            └── guest-user.preset.json
```

This structure provides complete CRUD operations with multiple scenarios for comprehensive testing.
