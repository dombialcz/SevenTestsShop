# Playwright Visual Testing Guide

This guide provides complete instructions for setting up and running visual regression tests using Playwright with Docker for consistent screenshot generation across environments.

---

## Table of Contents

1. [Overview](#overview)
2. [Why Docker for Visual Tests](#why-docker-for-visual-tests)
3. [Project Structure](#project-structure)
4. [Docker Setup](#docker-setup)
5. [Visual Test Configuration](#visual-test-configuration)
6. [Writing Visual Tests](#writing-visual-tests)
7. [Running Visual Tests](#running-visual-tests)
8. [Updating Snapshots](#updating-snapshots)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Visual testing (also called screenshot testing or visual regression testing) captures screenshots of your application and compares them against baseline images to detect unintended visual changes.

### Key Concepts

- **Baseline snapshots**: Reference screenshots stored in the repository
- **Visual diff**: Comparison between new screenshots and baselines
- **Docker consistency**: Ensures identical rendering across different machines
- **Mock integration**: Uses mock server for consistent data states

---

## Why Docker for Visual Tests

Visual tests are sensitive to rendering differences between environments. Docker ensures:

✅ **Consistent font rendering** across different operating systems  
✅ **Same browser version** for all developers and CI  
✅ **Identical screen dimensions** and pixel density  
✅ **Reproducible results** regardless of host machine  
✅ **No "works on my machine" issues**

**Without Docker**: Screenshots may differ due to:
- Different OS font rendering (Windows vs Mac vs Linux)
- Different Chrome versions
- Different system fonts
- Display scaling differences

**With Docker**: All screenshots are generated in the same Ubuntu-based container with Playwright's official browser builds.

---

## Project Structure

```
apps/
└── your-app-e2e/
    ├── visual.config.ts                    # Visual test configuration
    ├── docker-run-pw-test.sh               # Docker test runner script
    └── src/
        ├── snapshots/                      # Baseline screenshots
        │   └── Chrome_linux/               # Platform-specific snapshots
        │       └── [feature]/
        │           ├── feature-screenshot-1.png
        │           └── feature-screenshot-2.png
        ├── specs/
        │   └── [feature]/
        │       └── feature-visual.spec.ts  # Visual tests
        ├── data/
        │   └── enums/
        │       └── screenshot-name-prefix.enum.ts
        └── utils/
            └── playwright-utils.ts         # Viewport constants

tools/
└── css/
    └── screenshot-remove-banner.css        # CSS to hide dynamic elements
```

---

## Docker Setup

### 1. Create Docker Test Runner Script

**File**: `apps/your-app-e2e/docker-run-pw-test.sh`

```bash
#!/bin/bash

# Extract Playwright version from installed package
PW_VERSION=$(npx playwright -V | awk '{print $NF}')

# Ubuntu version should match your CI environment
UBUNTU_VERSION='noble'  # Use 'jammy' for Ubuntu 22.04, 'noble' for 24.04

echo "Running visual tests with:"
echo " - Playwright version: $PW_VERSION"
echo " - Ubuntu version: $UBUNTU_VERSION"

# Run Playwright tests in Docker container
docker run \
  -v "$PWD":/folder \           # Mount current directory
  --network=host \               # Use host network for localhost access
  -w /folder \                   # Set working directory
  -it \                          # Interactive terminal
  --rm \                         # Remove container after execution
  --ipc=host \                   # Share IPC namespace (improves performance)
  mcr.microsoft.com/playwright:v${PW_VERSION}-${UBUNTU_VERSION} \
  /bin/bash -c "npm install && npx playwright install chromium && npx playwright test $*"
```

**Make it executable:**
```bash
chmod +x apps/your-app-e2e/docker-run-pw-test.sh
```

### 2. How the Docker Script Works

1. **Detects Playwright version** from your local installation
2. **Pulls official Playwright Docker image** with matching version
3. **Mounts your project** into the container
4. **Installs dependencies** inside container
5. **Runs Playwright tests** with any additional arguments
6. **Generates screenshots** using consistent Linux environment
7. **Saves results** back to your mounted project directory

### 3. Docker Command Breakdown

```bash
docker run \
  -v "$PWD":/folder              # Maps current dir to /folder in container
  --network=host                 # Allows container to access localhost:4200 and localhost:9999
  -w /folder                     # Sets /folder as working directory
  -it                            # Interactive mode with terminal
  --rm                           # Auto-remove container when done
  --ipc=host                     # Improves Chrome performance
  mcr.microsoft.com/playwright:v1.55.1-noble \  # Official Playwright image
  /bin/bash -c "..."             # Command to execute
```

---

## Visual Test Configuration

### Base Visual Config

**File**: `apps/your-app-e2e/visual.config.ts`

```typescript
import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // Expect configuration
  expect: {
    timeout: 10 * 1000,
    toHaveScreenshot: { 
      stylePath: '../../tools/css/screenshot-remove-banner.css'  // Hide dynamic elements
    },
  },

  // Snapshot path template
  // {projectName} = 'Chrome', {platform} = 'linux', {arg} = screenshot filename
  snapshotPathTemplate: 'src/snapshots/{projectName}_{platform}/{testFileDir}/{arg}.png',

  // Test configuration
  timeout: 45 * 1000,
  testDir: './src/specs',
  retries: 0,                    // No retries for visual tests
  outputDir: '../../.tmp/pw-test-results-visual',
  grep: /@visual/,               // Only run tests tagged with @visual
  workers: process.env.CI ? 3 : 8,
  fullyParallel: true,

  // Reporting
  reporter: [
    [process.env.CI ? 'dot' : 'line'],
    ['html', { 
      outputFolder: process.env.CI ? 'html-report' : '../../.tmp/pw-report-visual', 
      open: 'never' 
    }],
  ],

  // Start both app and mock server
  webServer: [
    {
      command: 'npm start',  // Your app start command
      url: 'http://localhost:3000',
      timeout: 180 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run mock-server',
      url: 'http://localhost:9999/dev-interface/#/mocks',
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],

  // Browser settings
  use: {
    trace: { mode: 'retain-on-failure', sources: true },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',  // Regular screenshots on failure
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  // Project configuration
  projects: [
    {
      name: 'Chrome',
      use: {
        serviceWorkers: 'block',
        actionTimeout: 15000,
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },  // Default viewport
        storageState: 'apps/your-app-e2e/storage-state.json',
        launchOptions: {
          chromiumSandbox: false,
          args: [
            '--disable-infobars', 
            '--no-sandbox', 
            '--incognito', 
            '--disable-dev-shm-usage'
          ],
        },
      },
    },
  ],
};

export default config;
```

### CSS for Hiding Dynamic Elements

**File**: `tools/css/screenshot-remove-banner.css`

```css
/* Hide elements that change frequently and cause false positives */

/* Hide header/banner with timestamps or user info */
[role='banner'] {
  visibility: hidden;
}

/* Hide loading indicators */
.loading-indicator,
.spinner {
  visibility: hidden;
}

/* Hide dynamic timestamps */
.timestamp,
[data-testid='timestamp'] {
  visibility: hidden;
}

/* Hide notification badges */
.notification-badge {
  visibility: hidden;
}
```

### Screenshot Name Prefix Enum

**File**: `apps/your-app-e2e/src/data/enums/screenshot-name-prefix.enum.ts`

```typescript
/**
 * Screenshot name prefixes for organizing visual test snapshots.
 * Use these prefixes to maintain consistent naming conventions.
 */
export enum ScreenshotNamePrefix {
  USERS = 'users',
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
  PRODUCTS = 'products',
  // Add more as needed
}
```

### Viewport Constants

**File**: `apps/your-app-e2e/src/utils/playwright-utils.ts`

```typescript
/**
 * Common viewport sizes for visual testing
 */
export const viewPort_FHD = { width: 1920, height: 1080 };
export const viewPort_FHD_vertical = { width: 1080, height: 1920 };
export const viewPort_2K_vertical = { width: 1440, height: 2560 };
export const viewPort_mobile = { width: 375, height: 667 };
export const viewPort_tablet = { width: 768, height: 1024 };
```

---

## Writing Visual Tests

### Visual Test Template

**File**: `apps/your-app-e2e/src/specs/[feature]/[feature]-visual.spec.ts`

```typescript
import { expect, test } from '../../fixtures';
import { ScreenshotNamePrefix } from '../../data/enums/screenshot-name-prefix.enum';
import { viewPort_FHD_vertical } from '../../utils/playwright-utils';

test.describe('Feature Name - Visual Tests', { tag: '@visual' }, () => {
  // Optional: Set custom viewport for all tests in this suite
  test.use({ viewport: viewPort_FHD_vertical });

  test('feature main view', async ({ featurePage }) => {
    await featurePage.navigate();
    
    await expect(featurePage.container)
      .toHaveScreenshot(`${ScreenshotNamePrefix.FEATURE}-main-view.png`);
  });

  test('feature modal window', async ({ featurePage }) => {
    await featurePage.navigate();
    await featurePage.openModalButton.click();
    
    await expect(featurePage.modalWindow)
      .toHaveScreenshot(`${ScreenshotNamePrefix.FEATURE}-modal.png`);
  });

  test('feature with different states', async ({ featurePage }) => {
    await featurePage.navigate();

    await test.step('Empty state', async () => {
      await expect(featurePage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.FEATURE}-empty-state.png`);
    });

    await test.step('Filled state', async () => {
      await featurePage.fillForm({ name: 'Test' });
      
      await expect(featurePage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.FEATURE}-filled-state.png`);
    });

    await test.step('Validation error state', async () => {
      await featurePage.clearForm();
      await featurePage.submitButton.click();
      
      await expect(featurePage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.FEATURE}-validation-errors.png`);
    });
  });

  test('feature with tooltip', async ({ featurePage }) => {
    await featurePage.navigate();
    
    await test.step('Hover to show tooltip', async () => {
      await featurePage.helpIcon.hover();
      
      // Wait for tooltip animation
      await featurePage.page.waitForTimeout(500);
      
      await expect(featurePage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.FEATURE}-tooltip.png`);
    });
  });

  // Test multiple error scenarios in a loop
  const errorScenarios = [
    { 
      name: 'Unauthorized', 
      file: `${ScreenshotNamePrefix.FEATURE}-unauthorized.png` 
    },
    { 
      name: 'Forbidden', 
      file: `${ScreenshotNamePrefix.FEATURE}-forbidden.png` 
    },
    { 
      name: 'Server Error', 
      file: `${ScreenshotNamePrefix.FEATURE}-server-error.png` 
    },
    { 
      name: 'Not Found', 
      file: `${ScreenshotNamePrefix.FEATURE}-not-found.png` 
    },
  ];

  for (const scenario of errorScenarios) {
    test(`Error state: ${scenario.name}`, async ({ mocker, featurePage }) => {
      await mocker.selectScenario('getFeatureData', scenario.name);
      await featurePage.navigate();
      
      await expect(featurePage.container).toHaveScreenshot(scenario.file);
    });
  }

  test('feature with custom viewport', async ({ page, featurePage }) => {
    // Override viewport for this specific test
    await page.setViewportSize({ width: 375, height: 667 });
    
    await featurePage.navigate();
    
    await expect(featurePage.container)
      .toHaveScreenshot(`${ScreenshotNamePrefix.FEATURE}-mobile.png`);
  });
});
```

### Complete Example (Based on levels-visual.spec.ts)

**File**: `apps/your-app-e2e/src/specs/users/users-visual.spec.ts`

```typescript
import { expect, test } from '../../fixtures';
import { ScreenshotNamePrefix } from '../../data/enums/screenshot-name-prefix.enum';
import { viewPort_FHD_vertical } from '../../utils/playwright-utils';

test.describe('Users - Visual Tests', { tag: '@visual' }, () => {
  test.use({ viewport: viewPort_FHD_vertical });

  test('User list table', async ({ userListPage }) => {
    await userListPage.navigate();
    
    await expect(userListPage.container)
      .toHaveScreenshot(`${ScreenshotNamePrefix.USERS}-list-table.png`);
  });

  test('User details modal', async ({ userListPage }) => {
    await userListPage.navigate();
    await userListPage.userRow(0).name.click();
    
    await expect(userListPage.modalWindow)
      .toHaveScreenshot(`${ScreenshotNamePrefix.USERS}-details-modal.png`);
  });

  test('Create user form', async ({ userFormPage }) => {
    await userFormPage.navigate();

    await test.step('Empty form', async () => {
      await expect(userFormPage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.USERS}-create-form-empty.png`);
    });

    await test.step('Filled form', async () => {
      await userFormPage.nameInput.fill('John Doe');
      await userFormPage.emailInput.fill('john@example.com');
      
      await expect(userFormPage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.USERS}-create-form-filled.png`);
    });

    await test.step('Validation errors', async () => {
      await userFormPage.nameInput.fill('');
      await userFormPage.emailInput.fill('invalid-email');
      await userFormPage.saveButton.click();
      
      await expect(userFormPage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.USERS}-create-form-validation.png`);
    });
  });

  test('Help tooltip', async ({ userFormPage }) => {
    await userFormPage.navigate();
    
    await test.step('Show tooltip', async () => {
      await userFormPage.helpIcon.hover();
      await userFormPage.page.waitForTimeout(500);  // Wait for animation
      
      await expect(userFormPage.container)
        .toHaveScreenshot(`${ScreenshotNamePrefix.USERS}-help-tooltip.png`);
      
      // Move mouse away to hide tooltip
      await userFormPage.pageHeader.hover();
    });
  });

  // Test all error scenarios
  const errorScenarios = [
    { scenario: 'Empty response body', file: `${ScreenshotNamePrefix.USERS}-empty-list.png` },
    { scenario: 'Unauthorized', file: `${ScreenshotNamePrefix.USERS}-unauthorized.png` },
    { scenario: 'Forbidden', file: `${ScreenshotNamePrefix.USERS}-forbidden.png` },
    { scenario: 'Not Found', file: `${ScreenshotNamePrefix.USERS}-not-found.png` },
    { scenario: 'Server Error', file: `${ScreenshotNamePrefix.USERS}-server-error.png` },
  ];

  for (const { scenario, file } of errorScenarios) {
    test(`Error state: ${scenario}`, async ({ mocker, userListPage }) => {
      await mocker.selectScenario('getUsers', scenario);
      await userListPage.navigate();
      
      await expect(userListPage.container).toHaveScreenshot(file);
    });
  }

  test('Empty search result', async ({ userListPage, mocker }) => {
    await userListPage.navigate();
    
    await mocker.selectScenario('searchUsers', 'No results');
    await userListPage.search.for('nonexistent');
    
    await expect(userListPage.container)
      .toHaveScreenshot(`${ScreenshotNamePrefix.USERS}-empty-search.png`);
  });
});
```

---

## Running Visual Tests

### NPM Scripts Setup

Add to `package.json`:

```json
{
  "scripts": {
    "docker-run-pw-test": "bash apps/your-app-e2e/docker-run-pw-test.sh",
    
    "test:visual": "npm run docker-run-pw-test -- --config apps/your-app-e2e/visual.config.ts",
    "test:visual:update": "npm run test:visual -- --update-snapshots",
    "test:visual:ui": "npx playwright test --config apps/your-app-e2e/visual.config.ts --ui",
    
    "test:visual:ci": "npx playwright test --config apps/your-app-e2e/visual.config.ts"
  }
}
```

### Running Tests Locally

```bash
# Run all visual tests (in Docker)
npm run test:visual

# Run visual tests with UI mode (no Docker, for debugging)
npm run test:visual:ui

# Run specific visual test file
npm run docker-run-pw-test -- --config apps/your-app-e2e/visual.config.ts users-visual.spec.ts

# Run visual tests for specific feature
npm run docker-run-pw-test -- --config apps/your-app-e2e/visual.config.ts --grep "Users"
```

### Running in CI

```bash
# CI environment (no Docker needed if running in Linux CI)
npm run test:visual:ci
```

### First-Time Setup

1. **Run tests to generate initial snapshots:**
```bash
npm run test:visual:update
```

2. **Review generated screenshots:**
```bash
ls -la apps/your-app-e2e/src/snapshots/Chrome_linux/
```

3. **Commit baseline snapshots to git:**
```bash
git add apps/your-app-e2e/src/snapshots/
git commit -m "Add visual test baselines"
```

---

## Updating Snapshots

### When to Update

Update snapshots when you've made **intentional** visual changes:
- Updated UI components
- Changed layouts or styling
- Modified color schemes
- Updated fonts or spacing

### How to Update

```bash
# Update all snapshots
npm run test:visual:update

# Update specific test snapshots
npm run docker-run-pw-test -- --config apps/your-app-e2e/visual.config.ts --update-snapshots users-visual.spec.ts

# Update and commit
npm run test:visual:update
git add apps/your-app-e2e/src/snapshots/
git commit -m "Update visual baselines for new button styles"
```

### Review Updated Snapshots

Before committing:

1. **Check the diff** in your git tool
2. **Verify changes are intentional**
3. **Look for unexpected differences**
4. **Test on multiple viewports** if applicable

---

## Best Practices

### 1. Snapshot Organization

```
snapshots/
└── Chrome_linux/
    └── [feature-name]/
        ├── feature-main-view.png
        ├── feature-modal.png
        ├── feature-empty-state.png
        └── feature-error-state.png
```

✅ Use descriptive filenames  
✅ Group by feature  
✅ Include state in name (`empty`, `filled`, `error`)  
✅ Use screenshot prefix enums for consistency

### 2. Wait for Stability

```typescript
// ❌ BAD: Screenshot may capture mid-animation
await button.click();
await expect(page).toHaveScreenshot();

// ✅ GOOD: Wait for stable state
await button.click();
await page.waitForLoadState('networkidle');
await expect(page).toHaveScreenshot();

// ✅ GOOD: Wait for specific element
await button.click();
await page.locator('.success-message').waitFor();
await expect(page).toHaveScreenshot();

// ✅ GOOD: Wait for animations
await tooltip.hover();
await page.waitForTimeout(500);  // Animation duration
await expect(page).toHaveScreenshot();
```

### 3. Hide Dynamic Content

```css
/* In screenshot-remove-banner.css */

/* Timestamps */
.timestamp,
[data-testid="last-updated"] {
  visibility: hidden;
}

/* User-specific content */
.user-greeting,
.personalized-banner {
  visibility: hidden;
}

/* Random/generated IDs */
.uuid,
.session-id {
  visibility: hidden;
}
```

### 4. Test Multiple States

```typescript
test('component states', async ({ componentPage }) => {
  await test.step('Default state', async () => {
    await expect(componentPage.root).toHaveScreenshot('default.png');
  });

  await test.step('Hover state', async () => {
    await componentPage.button.hover();
    await expect(componentPage.root).toHaveScreenshot('hover.png');
  });

  await test.step('Active state', async () => {
    await componentPage.button.click();
    await expect(componentPage.root).toHaveScreenshot('active.png');
  });

  await test.step('Disabled state', async () => {
    await componentPage.disableButton.click();
    await expect(componentPage.root).toHaveScreenshot('disabled.png');
  });
});
```

### 5. Use Loops for Similar Tests

```typescript
const scenarios = [
  { name: 'light-theme', class: 'theme-light' },
  { name: 'dark-theme', class: 'theme-dark' },
  { name: 'high-contrast', class: 'theme-contrast' },
];

for (const { name, class: className } of scenarios) {
  test(`theme: ${name}`, async ({ page, homePage }) => {
    await page.addStyleTag({ content: `.root { @extend .${className}; }` });
    await homePage.navigate();
    
    await expect(homePage.container).toHaveScreenshot(`home-${name}.png`);
  });
}
```

### 6. Viewport Testing

```typescript
test('responsive design', async ({ page, homePage }) => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const { name, width, height } of viewports) {
    await test.step(`${name} viewport`, async () => {
      await page.setViewportSize({ width, height });
      await homePage.navigate();
      
      await expect(homePage.container).toHaveScreenshot(`home-${name}.png`);
    });
  }
});
```

---

## Troubleshooting

### Visual Diff Failures

**Problem**: Tests fail with small pixel differences

**Solutions**:
1. **Update snapshots** if changes are intentional:
   ```bash
   npm run test:visual:update
   ```

2. **Increase threshold** in config:
   ```typescript
   expect: {
     toHaveScreenshot: {
       maxDiffPixels: 100,  // Allow up to 100 different pixels
       threshold: 0.2,      // 20% difference threshold
     }
   }
   ```

3. **Hide dynamic elements**:
   ```css
   /* Add to screenshot-remove-banner.css */
   .dynamic-content {
     visibility: hidden;
   }
   ```

### Font Rendering Differences

**Problem**: Fonts look different on Mac vs Linux

**Solution**: Always use Docker for visual tests
```bash
npm run test:visual  # Uses Docker
```

### Animation Timing Issues

**Problem**: Screenshots capture mid-animation

**Solution**: Wait for animations to complete
```typescript
await element.hover();
await page.waitForTimeout(500);  // Wait for CSS transition
await expect(page).toHaveScreenshot();
```

### Modal Not Captured

**Problem**: Modal extends beyond viewport

**Solution**: Adjust viewport size
```typescript
test('large modal', async ({ page, modalPage }) => {
  await modalPage.navigate();
  await modalPage.openLargeModal();
  
  // Expand viewport to fit modal
  await page.setViewportSize({ width: 1920, height: 1200 });
  
  await expect(modalPage.modal).toHaveScreenshot();
});
```

### Docker Performance Issues

**Problem**: Docker tests run slowly

**Solutions**:
1. **Use `--ipc=host`** (already in script)
2. **Increase Docker memory** in Docker Desktop settings
3. **Reuse existing server**:
   ```typescript
   reuseExistingServer: true,  // In config
   ```

### Missing Snapshots

**Problem**: No baseline snapshots exist

**Solution**: Generate initial baselines
```bash
npm run test:visual:update
git add apps/your-app-e2e/src/snapshots/
git commit -m "Add initial visual test baselines"
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Tests

on: [pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run visual tests
        run: npm run test:visual:ci
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: visual-test-results
          path: apps/your-app-e2e/test-results/
      
      - name: Upload diff images
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-diffs
          path: apps/your-app-e2e/test-results/**/*-diff.png
```

---

## Summary

Visual testing with Docker provides:

✅ **Consistent screenshots** across all environments  
✅ **Catch unintended visual changes** automatically  
✅ **Test multiple states** (empty, filled, error, etc.)  
✅ **Mock integration** for predictable data  
✅ **CI/CD ready** with reproducible results

### Key Files to Create

1. `visual.config.ts` - Visual test configuration
2. `docker-run-pw-test.sh` - Docker runner script
3. `tools/css/screenshot-remove-banner.css` - Hide dynamic elements
4. `src/data/enums/screenshot-name-prefix.enum.ts` - Naming conventions
5. `src/specs/[feature]/[feature]-visual.spec.ts` - Visual tests

### Essential Commands

```bash
# Generate initial baselines
npm run test:visual:update

# Run visual tests
npm run test:visual

# Update after intentional changes
npm run test:visual:update && git add src/snapshots/

# Debug with UI mode
npm run test:visual:ui
```

Visual testing is your safety net for UI changes. Use it to catch regressions early and maintain consistent user experience across your application.
