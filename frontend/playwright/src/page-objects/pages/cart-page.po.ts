import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page.po';

/**
 * Cart Page Object
 * Represents the shopping cart page
 */
export class CartPage extends BasePage {
  readonly pageHeader: Locator;
  readonly cartItems: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    super(page, '/cart');
    
    this.pageHeader = this.$('h1');
    this.cartItems = this.$('.cart-item');
    this.totalPrice = this.$('.total-price');
    this.checkoutButton = this.$('button:has-text("Place Order")');
    this.continueShoppingButton = this.$('a:has-text("Continue Shopping")');
    this.emptyCartMessage = this.$('.empty-cart');
  }

  /**
   * Get a specific cart item by index
   */
  cartItem(index: number): CartItem {
    return new CartItem(this.cartItems.nth(index));
  }

  /**
   * Get total number of items in cart
   */
  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Get total price
   */
  async getTotalPrice(): Promise<string> {
    return await this.totalPrice.innerText();
  }

  /**
   * Proceed to checkout
   */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Continue shopping (go back to shop)
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * Check if cart is empty
   */
  async isEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible();
  }
}

/**
 * Cart Item Element
 * Represents a single item in the shopping cart
 */
class CartItem {
  readonly name: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly subtotal: Locator;
  readonly removeButton: Locator;
  readonly increaseButton: Locator;
  readonly decreaseButton: Locator;

  constructor(private root: Locator) {
    this.name = root.locator('h3');
    this.price = root.locator('.price');
    this.quantity = root.locator('input[type="number"]');
    this.subtotal = root.locator('.subtotal');
    this.removeButton = root.locator('button:has-text("Remove")');
    this.increaseButton = root.locator('button:has-text("+")');
    this.decreaseButton = root.locator('button:has-text("-")');
  }

  async getData() {
    return {
      name: await this.name.innerText(),
      price: await this.price.innerText(),
      quantity: await this.quantity.inputValue(),
      subtotal: await this.subtotal.innerText(),
    };
  }

  async remove(): Promise<void> {
    await this.removeButton.click();
  }

  async increaseQuantity(): Promise<void> {
    await this.increaseButton.click();
  }

  async decreaseQuantity(): Promise<void> {
    await this.decreaseButton.click();
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantity.fill(quantity.toString());
  }
}
