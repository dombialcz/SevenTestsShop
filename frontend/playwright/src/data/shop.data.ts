/**
 * Test data for shop and cart tests
 */

export const SHOP_PAGE = {
  title: 'Demo Shop',
  categories: ['All', 'Electronics', 'Clothing', 'Books', 'Home & Garden'],
};

export const CART_PAGE = {
  title: 'Shopping Cart',
  emptyMessage: 'Your cart is empty',
  checkoutButton: 'Place Order',
  continueShoppingButton: 'Continue Shopping',
};

export const PRODUCT_SCENARIOS = {
  success: {
    scenario: 'success',
    expectedCount: 10,
  },
  empty: {
    scenario: 'empty',
    expectedCount: 0,
  },
  slow: {
    scenario: 'slow',
    expectedCount: 10,
  },
};

export const ERROR_SCENARIOS = [
  { scenario: 'unauthorized', statusCode: 401, message: 'Unauthorized' },
  { scenario: 'serverError', statusCode: 500, message: 'Server Error' },
];

export const ORDER_SCENARIOS = {
  success: {
    scenario: 'success',
    expectedMessage: 'Order placed successfully',
  },
  validationError: {
    scenario: 'validationError',
    expectedMessage: 'Validation failed',
  },
  emptyCart: {
    scenario: 'emptyCart',
    expectedMessage: 'Cart is empty',
  },
  outOfStock: {
    scenario: 'outOfStock',
    expectedMessage: 'Product out of stock',
  },
  paymentFailed: {
    scenario: 'paymentFailed',
    expectedMessage: 'Payment failed',
  },
};
