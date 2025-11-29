import { test as baseTest } from '@playwright/test';
import { mockFixtures, MockFixtures } from './mock-fixtures';
import { pageFixtures, PageFixtures } from './page-fixtures';

// Merge all fixtures together
export const test = baseTest.extend<MockFixtures & PageFixtures>({
  ...mockFixtures,
  ...pageFixtures,
});

export { expect } from '@playwright/test';
