import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Demo Shop E2E tests
 * 
 * This config includes:
 * - Dual web server setup (React app + mock server)
 * - Accessibility testing support via custom matchers
 * - CI/CD optimizations
 */
export default defineConfig({
  // Test execution settings
  testDir: './playwright/src/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : 8,
  
  // Timeouts
  timeout: 60 * 1000,
  expect: {
    timeout: 5 * 1000,
  },

  // Reporting
  reporter: [
    [process.env.CI ? 'dot' : 'line'],
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never' 
    }],
  ],

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Global configuration for all projects
  use: {
    // Base URL for page.goto()
    baseURL: 'http://localhost:3000',
    
    // Screenshot and trace settings
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Start both application and mock server before tests
  webServer: [
    {
      // React application
      command: 'npm start',
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
      cwd: '../',  // Run from project root
      stderr: 'pipe',
      stdout: 'pipe',
    },
  ],

  // Test projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          args: [
            '--disable-infobars',
            '--no-sandbox',
            '--disable-dev-shm-usage',
          ],
        },
      },
    },

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
});
