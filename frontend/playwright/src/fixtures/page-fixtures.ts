import { test as baseTest } from '@playwright/test';
import { ShopPage } from '../page-objects/pages/shop-page.po';
import { CartPage } from '../page-objects/pages/cart-page.po';

export interface PageFixtures {
  shopPage: ShopPage;
  cartPage: CartPage;
}

export const pageFixtures = {
  shopPage: async ({ page }: any, use: any) => {
    await use(new ShopPage(page));
  },
  
  cartPage: async ({ page }: any, use: any) => {
    await use(new CartPage(page));
  },
};
