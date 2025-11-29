import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Visual Testing Configuration
 * 
 * This configuration is specifically for visual regression tests.
 * Uses Docker for consistent screenshot generation across environments.
 */
export default defineConfig({
  testDir: './playwright/src/specs',
  
  // Only run tests tagged with @visual
  grep: /@visual/,
  
  // Visual tests should not retry (snapshots must be exact)
  retries: 0,
  
  // Run tests serially to avoid mock server preset conflicts
  fullyParallel: false,
  workers: 1,
  
  // Timeouts
  timeout: 45 * 1000,
  expect: {
    timeout: 10 * 1000,
    toHaveScreenshot: {
      // Path to CSS file that hides dynamic elements
      stylePath: './playwright/src/utils/screenshot-remove-dynamic.css',
      // Allow small differences for anti-aliasing
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Output directory for test results
  outputDir: 'test-results-visual',

  // Reporting
  reporter: [
    [process.env.CI ? 'dot' : 'line'],
    ['html', { 
      outputFolder: 'playwright-report-visual',
      open: 'never' 
    }],
  ],

  // Start both application and mock server before tests
  webServer: [
    {
      command: 'npm start',
      url: 'http://localhost:3000',
      timeout: 180 * 1000,
      reuseExistingServer: !process.env.CI,
      stderr: 'pipe',
      stdout: 'pipe',
    },
    {
      command: 'npm run mock-server',
      url: 'http://localhost:9999/dev-interface/#/mocks',
      timeout: 30 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: '../',
      stderr: 'pipe',
      stdout: 'pipe',
    },
  ],

  // Global configuration
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Browser configuration - optimized for visual testing
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        // Disable service workers for consistent behavior
        serviceWorkers: 'block',
        launchOptions: {
          args: [
            '--disable-infobars',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--font-render-hinting=none', // Consistent font rendering
          ],
        },
      },
    },
  ],
});
