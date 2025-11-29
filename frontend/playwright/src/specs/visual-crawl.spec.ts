/**
 * Visual regression test that crawls through the entire mocked frontend
 * Tags: @visual
 * 
 * This test navigates through all major pages and UI states, taking screenshots
 * for visual comparison. It uses the mock server to ensure consistent data.
 * 
 * Run locally: npm run test:visual
 * Run in Docker: ./docker-run-visual-tests.sh
 */

import { test, expect } from '../fixtures';
import { VIEWPORTS } from '../utils/viewport-constants';

test.describe('Visual Regression - Full App Crawl @visual', () => {

  test('Homepage - Initial load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Screenshot the homepage
    await expect(page).toHaveScreenshot('page-home--initial-load.png');
  });

  test('Shop Page - All products displayed', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Wait for products to load
    await page.waitForSelector('.product-card', { timeout: 5000 });

    // Screenshot full shop page
    await expect(page).toHaveScreenshot('page-shop--all-products.png', {
      fullPage: true
    });
  });

  test('Shop Page - Category filter applied', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.product-card', { timeout: 5000 });

    // Find and click a category filter (assuming there's a filter UI)
    const categoryButton = page.locator('button, a').filter({ hasText: /coffee|tea|equipment/i }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(500); // Allow filter animation

      await expect(page).toHaveScreenshot('feature-filter-category--filtered-results.png', {
        fullPage: true
      });
    }
  });

  test('Product Detail Page', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.product-card', { timeout: 5000 });

    // Click first product to view details
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('page-product-detail--product-view.png');
  });

  test('Coffee Builder Page - Initial state', async ({ page }) => {
    await page.goto('/coffee-builder');
    await page.waitForLoadState('networkidle');

    // Screenshot initial coffee builder
    await expect(page).toHaveScreenshot('page-coffee-builder--initial-state.png');
  });

  test('Coffee Builder Page - Options selected', async ({ page }) => {
    await page.goto('/coffee-builder');
    await page.waitForLoadState('networkidle');

    // Select various options (adjust selectors based on actual implementation)
    const optionButtons = page.locator('button, input[type="radio"], input[type="checkbox"]');
    const visibleOptions = await optionButtons.count();
    
    if (visibleOptions > 0) {
      // Click first 3 options
      for (let i = 0; i < Math.min(3, visibleOptions); i++) {
        const option = optionButtons.nth(i);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForTimeout(200);
        }
      }

      await expect(page).toHaveScreenshot('feature-custom-coffee--options-selected.png');
    }
  });

  test('Cart Page - Empty state', async ({ page }) => {
    // Clear cart first
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('page-cart--empty-state.png');
  });

  test('Cart Page - With items', async ({ page }) => {
    // Add items to cart first
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.product-card', { timeout: 5000 });

    // Add first product to cart
    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('page-cart--with-items.png', {
      fullPage: true
    });
  });

  test('Admin Page - Product management', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Wait for admin content to load
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('page-admin--product-management.png', {
      fullPage: true
    });
  });

  test('Header Component - All states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Screenshot header
    const header = page.locator('header, nav').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('component-header--default-state.png');
    }
  });

  test('Mobile viewport - Shop page', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({
      width: VIEWPORTS.MOBILE_MEDIUM.width,
      height: VIEWPORTS.MOBILE_MEDIUM.height,
    });

    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.product-card', { timeout: 5000 });

    await expect(page).toHaveScreenshot('viewport-mobile--shop-page.png', {
      fullPage: true
    });
  });

  test('Tablet viewport - Coffee builder', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({
      width: VIEWPORTS.TABLET_PORTRAIT.width,
      height: VIEWPORTS.TABLET_PORTRAIT.height,
    });

    await page.goto('/coffee-builder');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('viewport-tablet--coffee-builder.png', {
      fullPage: true
    });
  });

  // Note: Error state tests require mock server scenario switching
  // which can cause conflicts in parallel execution.
  // These are better tested in E2E tests with proper mock isolation.
});

test.describe('Visual Regression - Component Focus @visual', () => {

  test('Product Card - Default state', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.product-card', { timeout: 5000 });

    const productCard = page.locator('.product-card').first();
    if (await productCard.isVisible()) {
      await expect(productCard).toHaveScreenshot('component-product-card--default-state.png');
    }
  });

  test('Product Card - Hover state', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.product-card', { timeout: 5000 });

    const productCard = page.locator('.product-card').first();
    if (await productCard.isVisible()) {
      await productCard.hover();
      await page.waitForTimeout(200);

      await expect(productCard).toHaveScreenshot('component-product-card--hover-state.png');
    }
  });
});
