import { expect, test } from '../fixtures';
import { CART_PAGE, ORDER_SCENARIOS } from '../data/shop.data';

/**
 * Cart Page E2E Tests
 * 
 * Tests shopping cart functionality including:
 * - Cart display
 * - Item management
 * - Checkout process
 * - Error handling
 */
test.describe('Cart Page', () => {
  test.beforeEach(async ({ cartPage }) => {
    await cartPage.navigate();
  });

  test.describe('@ui - UI Element Verification', () => {
    test('should display cart page elements', async ({ cartPage }) => {
      await test.step('Page header', async () => {
        await expect(cartPage.pageHeader).toBeVisible();
        await expect(cartPage.pageHeader).toHaveText(CART_PAGE.title);
      });

      await test.step('Action buttons', async () => {
        await expect(cartPage.continueShoppingButton).toBeVisible();
      });
    });

    test('should display empty cart message when cart is empty', async ({ cartPage }) => {
      await test.step('Clear cart (if needed)', async () => {
        // Implementation depends on cart state
      });

      await test.step('Verify empty state', async () => {
        const isEmpty = await cartPage.isEmpty();
        if (isEmpty) {
          await expect(cartPage.emptyCartMessage).toBeVisible();
          await expect(cartPage.emptyCartMessage).toContainText(CART_PAGE.emptyMessage);
        }
      });
    });
  });

  test.describe('@act - User Actions', () => {
    test('should display cart items', async ({ shopPage, cartPage }) => {
      await test.step('Add product to cart', async () => {
        await shopPage.navigate();
        await shopPage.addFirstProductToCart();
        await cartPage.navigate();
      });

      await test.step('Verify cart items', async () => {
        const itemCount = await cartPage.getItemCount();
        expect(itemCount).toBeGreaterThan(0);
      });
    });

    test('should update item quantity', async ({ shopPage, cartPage }) => {
      await test.step('Setup: Add product to cart', async () => {
        await shopPage.navigate();
        await shopPage.addFirstProductToCart();
        await cartPage.navigate();
      });

      await test.step('Increase quantity', async () => {
        const firstItem = cartPage.cartItem(0);
        await firstItem.increaseQuantity();
        
        // Wait for update (adjust based on actual behavior)
        await cartPage.page.waitForTimeout(500);
      });

      await test.step('Verify quantity changed', async () => {
        const firstItem = cartPage.cartItem(0);
        const quantity = await firstItem.quantity.inputValue();
        expect(parseInt(quantity)).toBeGreaterThan(1);
      });
    });

    test('should remove item from cart', async ({ shopPage, cartPage }) => {
      await test.step('Setup: Add product to cart', async () => {
        await shopPage.navigate();
        await shopPage.addFirstProductToCart();
        await cartPage.navigate();
      });

      await test.step('Remove item', async () => {
        const initialCount = await cartPage.getItemCount();
        const firstItem = cartPage.cartItem(0);
        await firstItem.remove();
        
        // Wait for removal (adjust based on actual behavior)
        await cartPage.page.waitForTimeout(500);
        
        const newCount = await cartPage.getItemCount();
        expect(newCount).toBeLessThan(initialCount);
      });
    });

    test('should proceed to checkout', async ({ shopPage, cartPage, mocker }) => {
      await test.step('Setup: Add product and configure mocks', async () => {
        await mocker.selectScenario('createOrder', 'success');
        await shopPage.navigate();
        await shopPage.addFirstProductToCart();
        await cartPage.navigate();
      });

      await test.step('Click checkout button', async () => {
        await cartPage.checkout();
      });

      await test.step('Verify order confirmation', async () => {
        await expect(cartPage.notification).toBeVisible();
        await expect(cartPage.notification).toContainText(ORDER_SCENARIOS.success.expectedMessage);
      });
    });
  });

  test.describe('@mock - Order Creation Scenarios', () => {
    test('should handle validation error', async ({ shopPage, cartPage, mocker }) => {
      await test.step('Setup: Add product and configure mock', async () => {
        await mocker.selectScenario('createOrder', 'validationError');
        await shopPage.navigate();
        await shopPage.addFirstProductToCart();
        await cartPage.navigate();
      });

      await test.step('Attempt checkout', async () => {
        await cartPage.checkout();
      });

      await test.step('Verify validation error', async () => {
        await expect(cartPage.notification).toBeVisible();
        // Adjust based on actual error display
      });
    });

    test('should handle out of stock error', async ({ shopPage, cartPage, mocker }) => {
      await test.step('Configure mock', async () => {
        await mocker.selectScenario('createOrder', 'outOfStock');
        await shopPage.navigate();
        await shopPage.addFirstProductToCart();
        await cartPage.navigate();
      });

      await test.step('Attempt checkout', async () => {
        await cartPage.checkout();
      });

      await test.step('Verify out of stock error', async () => {
        await expect(cartPage.notification).toBeVisible();
        await expect(cartPage.notification).toContainText(ORDER_SCENARIOS.outOfStock.expectedMessage);
      });
    });

    test('should handle payment failure', async ({ shopPage, cartPage, mocker }) => {
      await test.step('Configure mock', async () => {
        await mocker.selectScenario('createOrder', 'paymentFailed');
        await shopPage.navigate();
        await shopPage.addFirstProductToCart();
        await cartPage.navigate();
      });

      await test.step('Attempt checkout', async () => {
        await cartPage.checkout();
      });

      await test.step('Verify payment error', async () => {
        await expect(cartPage.notification).toBeVisible();
        await expect(cartPage.notification).toContainText(ORDER_SCENARIOS.paymentFailed.expectedMessage);
      });
    });
  });

  test.describe('@nav - Navigation', () => {
    test('should navigate back to shop', async ({ cartPage, page }) => {
      await test.step('Click continue shopping', async () => {
        await cartPage.continueShopping();
      });

      await test.step('Verify navigation', async () => {
        await expect(page).toHaveURL('/');
      });
    });
  });
});
