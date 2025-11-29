import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page.po';

/**
 * Shop Page Object
 * Represents the main shopping page with product listings
 */
export class ShopPage extends BasePage {
  readonly pageHeader: Locator;
  readonly categoryFilter: Locator;
  readonly productCards: Locator;
  readonly addToCartButtons: Locator;
  readonly viewCartButton: Locator;

  constructor(page: Page) {
    super(page, '/');
    
    this.pageHeader = this.$('h1');
    this.categoryFilter = this.$('select[name="category"]');
    this.productCards = this.$('.product-card');
    this.addToCartButtons = this.$('button:has-text("Add to Cart")');
    this.viewCartButton = this.$('a[href="/cart"]');
  }

  /**
   * Get a specific product card by index
   */
  productCard(index: number): ProductCard {
    return new ProductCard(this.productCards.nth(index));
  }

  /**
   * Filter products by category
   */
  async filterByCategory(category: string): Promise<void> {
    await this.categoryFilter.selectOption(category);
  }

  /**
   * Add first product to cart
   */
  async addFirstProductToCart(): Promise<void> {
    await this.addToCartButtons.first().click();
  }

  /**
   * Get total number of products displayed
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Navigate to cart page
   */
  async goToCart(): Promise<void> {
    await this.viewCartButton.click();
  }
}

/**
 * Product Card Element
 * Represents a single product card in the shop
 */
class ProductCard {
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly addToCartButton: Locator;
  readonly stockBadge: Locator;

  constructor(private root: Locator) {
    this.name = root.locator('h3');
    this.price = root.locator('.price');
    this.description = root.locator('p');
    this.addToCartButton = root.locator('button:has-text("Add to Cart")');
    this.stockBadge = root.locator('.stock-badge');
  }

  async getData() {
    return {
      name: await this.name.innerText(),
      price: await this.price.innerText(),
      description: await this.description.innerText(),
    };
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
