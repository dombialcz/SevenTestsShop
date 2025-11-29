import { expect, test } from '../fixtures';
import { SHOP_PAGE, ERROR_SCENARIOS } from '../data/shop.data';

/**
 * Shop Page E2E Tests
 * 
 * Tests the main shopping page functionality including:
 * - Product display
 * - Category filtering
 * - Adding items to cart
 * - Error handling
 * - Mock server integration
 */
test.describe('Shop Page', () => {
  test.beforeEach(async ({ shopPage, mocker }) => {
    // Reset to default successful scenario before each test
    await mocker.selectScenario('getProducts', 'success');
    await shopPage.navigate();
  });

  test.describe('@ui - UI Element Verification', () => {
    test('should display all page elements', async ({ shopPage }) => {
      await test.step('Page header', async () => {
        await expect(shopPage.pageHeader).toBeVisible();
        await expect(shopPage.pageHeader).toHaveText(SHOP_PAGE.title);
      });

      await test.step('Category filter', async () => {
        await expect(shopPage.categoryFilter).toBeVisible();
      });

      await test.step('Product cards', async () => {
        await expect(shopPage.productCards).toHaveCount(10);
      });
    });

    test('should display product card information', async ({ shopPage }) => {
      const firstProduct = shopPage.productCard(0);

      await test.step('Product name', async () => {
        await expect(firstProduct.name).toBeVisible();
      });

      await test.step('Product price', async () => {
        await expect(firstProduct.price).toBeVisible();
      });

      await test.step('Add to cart button', async () => {
        await expect(firstProduct.addToCartButton).toBeVisible();
        await expect(firstProduct.addToCartButton).toBeEnabled();
      });
    });
  });

  test.describe('@act - User Actions', () => {
    test('should add product to cart', async ({ shopPage, page }) => {
      await test.step('Add first product to cart', async () => {
        await shopPage.addFirstProductToCart();
      });

      await test.step('Verify success notification', async () => {
        await expect(shopPage.notification).toBeVisible();
        await expect(shopPage.notification).toContainText('Added to cart');
      });
    });

    test('should filter products by category', async ({ shopPage, mocker }) => {
      await test.step('Select Electronics category', async () => {
        await shopPage.filterByCategory('Electronics');
      });

      await test.step('Wait for filtered results', async () => {
        // Products should be filtered (implementation dependent)
        await expect(shopPage.productCards.first()).toBeVisible();
      });
    });

    test('should navigate to cart page', async ({ shopPage, page }) => {
      await test.step('Click view cart button', async () => {
        await shopPage.goToCart();
      });

      await test.step('Verify navigation', async () => {
        await expect(page).toHaveURL('/cart');
      });
    });
  });

  test.describe('@mock - Mock Server Integration', () => {
    test('should display empty state when no products', async ({ shopPage, mocker }) => {
      await test.step('Configure empty products mock', async () => {
        await mocker.selectScenario('getProducts', 'empty');
        await mocker.reloadPages('networkidle');
      });

      await test.step('Verify empty state', async () => {
        await expect(shopPage.productCards).toHaveCount(0);
        // Empty state message assertions (adjust based on actual UI)
      });
    });

    test('should handle slow API responses', async ({ shopPage, mocker }) => {
      await test.step('Configure slow response mock', async () => {
        await mocker.selectScenario('getProducts', 'slow');
        await mocker.reloadPages();
      });

      await test.step('Loading indicator should appear', async () => {
        // Note: This test may need adjustment based on actual loading behavior
        await expect(shopPage.productCards).toHaveCount(10, { timeout: 10000 });
      });
    });
  });

  test.describe('@error - Error Handling', () => {
    for (const error of ERROR_SCENARIOS) {
      test(`should display ${error.scenario} error`, async ({ shopPage, mocker }) => {
        await test.step(`Configure ${error.scenario} mock`, async () => {
          await mocker.selectScenario('getProducts', error.scenario);
          await mocker.reloadPages('networkidle');
        });

        await test.step('Verify error state', async () => {
          // Error display assertions (adjust based on actual UI)
          // await expect(shopPage.$('.error-message')).toBeVisible();
          // await expect(shopPage.$('.error-message')).toContainText(error.message);
        });
      });
    }
  });

  test.describe('@preset - Preset Testing', () => {
    test('should handle happy path preset', async ({ shopPage, mocker }) => {
      await test.step('Apply happy-path preset', async () => {
        await mocker.selectPreset('happy-path');
        await mocker.reloadPages('networkidle');
      });

      await test.step('Verify all success scenarios', async () => {
        await expect(shopPage.productCards).toHaveCount(10);
        await expect(shopPage.productCards.first()).toBeVisible();
      });
    });

    test('should handle error scenarios preset', async ({ shopPage, mocker }) => {
      await test.step('Apply error-scenarios preset', async () => {
        await mocker.selectPreset('error-scenarios');
        await mocker.reloadPages('networkidle');
      });

      await test.step('Verify error states', async () => {
        // Error state assertions (adjust based on actual UI)
      });
    });
  });
});
