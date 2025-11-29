import { Locator, Page } from '@playwright/test';

/**
 * Base Page Object
 * 
 * All page objects should extend this class to inherit common functionality
 */
export class BasePage {
  readonly notification: Locator;
  readonly loadingIndicator: Locator;

  constructor(
    readonly page: Page,
    readonly url = '',
  ) {
    this.notification = this.page.locator('.toast');
    this.loadingIndicator = this.page.locator('[data-testid="loading"]');
  }

  /**
   * Shorthand for page.locator()
   */
  $(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get element by data-testid attribute
   */
  testId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Navigate to page URL
   */
  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'networkidle' });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}
