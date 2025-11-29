import { Mocker } from '../utils/mocker';
import { test as baseTest } from '@playwright/test';

export interface MockFixtures {
  mocker: Mocker;
}

export const mockFixtures = {
  mocker: async ({ context }: any, use: any) => {
    await use(new Mocker(context));
  },
};
