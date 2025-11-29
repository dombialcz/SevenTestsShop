/**
 * Screenshot name prefixes for consistent naming across visual tests
 * Use these enums to prefix screenshot names for better organization
 */

export enum ScreenshotPrefix {
  // Page-level screenshots
  PAGE_HOME = 'page-home',
  PAGE_SHOP = 'page-shop',
  PAGE_CART = 'page-cart',
  PAGE_ADMIN = 'page-admin',
  PAGE_COFFEE_BUILDER = 'page-coffee-builder',
  PAGE_PRODUCT_DETAIL = 'page-product-detail',
  
  // Component-level screenshots
  COMPONENT_HEADER = 'component-header',
  COMPONENT_FOOTER = 'component-footer',
  COMPONENT_CART_ITEM = 'component-cart-item',
  COMPONENT_PRODUCT_CARD = 'component-product-card',
  COMPONENT_CATEGORY_FILTER = 'component-category-filter',
  COMPONENT_COFFEE_OPTION = 'component-coffee-option',
  
  // State-based screenshots
  STATE_EMPTY = 'state-empty',
  STATE_LOADING = 'state-loading',
  STATE_ERROR = 'state-error',
  STATE_SUCCESS = 'state-success',
  STATE_POPULATED = 'state-populated',
  
  // Interaction screenshots
  INTERACTION_HOVER = 'interaction-hover',
  INTERACTION_FOCUS = 'interaction-focus',
  INTERACTION_CLICK = 'interaction-click',
  INTERACTION_MODAL = 'interaction-modal',
  INTERACTION_DROPDOWN = 'interaction-dropdown',
  
  // Responsive screenshots
  VIEWPORT_MOBILE = 'viewport-mobile',
  VIEWPORT_TABLET = 'viewport-tablet',
  VIEWPORT_DESKTOP = 'viewport-desktop',
  VIEWPORT_WIDE = 'viewport-wide',
  
  // Feature-specific screenshots
  FEATURE_FILTER_CATEGORY = 'feature-filter-category',
  FEATURE_SORT_PRODUCTS = 'feature-sort-products',
  FEATURE_ADD_TO_CART = 'feature-add-to-cart',
  FEATURE_REMOVE_FROM_CART = 'feature-remove-from-cart',
  FEATURE_CHECKOUT = 'feature-checkout',
  FEATURE_CUSTOM_COFFEE = 'feature-custom-coffee',
}

/**
 * Helper function to build screenshot name with prefix and description
 * @param prefix - Screenshot prefix from enum
 * @param description - Additional description
 * @returns Formatted screenshot name with .png extension
 */
export function buildScreenshotName(prefix: ScreenshotPrefix, description?: string): string {
  const name = description ? `${prefix}--${description}` : prefix;
  return `${name}.png`;
}
