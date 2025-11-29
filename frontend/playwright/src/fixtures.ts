import { test as baseTest } from '@playwright/test';
import { PageFixtures, pageFixtures } from './fixtures/page-fixtures';
import { MockFixtures, mockFixtures } from './fixtures/mock-fixtures';

/**
 * Extended Playwright test with custom fixtures
 * 
 * Available fixtures:
 * - mocker: Mocker instance for controlling mock scenarios
 * - Page objects will be added here as they are created
 * 
 * @example
 * test('should display products', async ({ mocker, page }) => {
 *   await mocker.selectScenario('getProducts', 'success');
 *   await page.goto('/');
 *   // ... test assertions
 * });
 */
export const test = baseTest.extend<MockFixtures & PageFixtures>({
  ...mockFixtures,
  ...pageFixtures,
});

export { expect } from '@playwright/test';
