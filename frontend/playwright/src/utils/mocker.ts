import { BaseClient } from '@ng-apimock/base-client';
import { BrowserContext } from '@playwright/test';

export interface MockerOptions {
  apiBaseUrl?: string;
  mockServerBaseUrl?: string;
  cookieName?: string;
}

/**
 * Mocker class for controlling ng-apimock mock server during E2E tests
 * 
 * Provides methods to:
 * - Switch between different response scenarios
 * - Apply preset configurations
 * - Modify preset variables
 * - Reload pages to apply changes
 * 
 * @example
 * await mocker.selectScenario('getProducts', 'success');
 * await mocker.selectScenario('getProducts', 'serverError');
 * await mocker.selectPreset('error-scenarios');
 */
export class Mocker extends BaseClient {
  private apiBaseUrl: string;
  private cookieName: string;

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

  /**
   * Required by BaseClient - not used in Playwright context
   */
  async openUrl(url: string): Promise<void> {
    // No-op: Playwright handles navigation
  }

  /**
   * Required by BaseClient - not used in Playwright context
   */
  async setCookie(name: string, value: string): Promise<void> {
    await this.browserContext.addCookies([{
      name,
      value,
      url: this.apiBaseUrl
    }]);
  }

  /**
   * Enable mocking by setting the apimock cookie
   */
  async enable(): Promise<this> {
    await this.browserContext.addCookies([{
      name: this.cookieName,
      value: this.ngApimockId,
      url: this.apiBaseUrl
    }]);
    return this;
  }

  /**
   * Disable mocking by removing the apimock cookie
   */
  async disable(): Promise<this> {
    await this.browserContext.clearCookies({ name: this.cookieName });
    return this;
  }

  /**
   * Select a specific scenario for a mock endpoint
   * Automatically enables mocking after selection
   * 
   * @param apiName - The mock name from .mock.json file
   * @param scenario - The scenario name to activate
   * 
   * @example
   * await mocker.selectScenario('getProducts', 'success');
   * await mocker.selectScenario('getProducts', 'empty');
   * await mocker.selectScenario('getProducts', 'serverError');
   */
  async selectScenario(apiName: string, scenario: string): Promise<void> {
    await super.selectScenario(apiName, scenario);
    await this.enable();
  }

  /**
   * Apply a preset configuration that sets multiple mocks at once
   * Automatically enables mocking after selection
   * 
   * @param preset - The preset name from .preset.json file
   * 
   * @example
   * await mocker.selectPreset('happy-path');
   * await mocker.selectPreset('error-scenarios');
   */
  async selectPreset(preset: string): Promise<void> {
    await super.selectPreset(preset);
    await this.enable();
  }

  /**
   * Reload all pages in the browser context
   * Required after changing scenarios to fetch new mock data
   * 
   * @param state - Optional load state to wait for
   * 
   * @example
   * await mocker.selectScenario('getProducts', 'serverError');
   * await mocker.reloadPages('networkidle');
   */
  async reloadPages(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void> {
    for (const page of this.browserContext.pages()) {
      await page.reload();
      if (state) {
        await page.waitForLoadState(state);
      }
    }
  }
}
