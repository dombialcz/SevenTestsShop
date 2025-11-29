/**
 * Standard viewport sizes for visual regression testing
 * Based on common device breakpoints and testing requirements
 */

export const VIEWPORTS = {
  // Mobile devices
  MOBILE_SMALL: {
    width: 375,
    height: 667,
    name: 'mobile-small',
    description: 'iPhone SE, small mobile phones',
  },
  MOBILE_MEDIUM: {
    width: 390,
    height: 844,
    name: 'mobile-medium',
    description: 'iPhone 12/13/14, standard mobile',
  },
  MOBILE_LARGE: {
    width: 428,
    height: 926,
    name: 'mobile-large',
    description: 'iPhone 14 Pro Max, large mobile',
  },

  // Tablet devices
  TABLET_PORTRAIT: {
    width: 768,
    height: 1024,
    name: 'tablet-portrait',
    description: 'iPad Mini/Air portrait',
  },
  TABLET_LANDSCAPE: {
    width: 1024,
    height: 768,
    name: 'tablet-landscape',
    description: 'iPad Mini/Air landscape',
  },
  TABLET_PRO: {
    width: 1024,
    height: 1366,
    name: 'tablet-pro',
    description: 'iPad Pro portrait',
  },

  // Desktop/Laptop
  DESKTOP_SMALL: {
    width: 1280,
    height: 720,
    name: 'desktop-small',
    description: 'Small laptop, 720p',
  },
  DESKTOP_MEDIUM: {
    width: 1366,
    height: 768,
    name: 'desktop-medium',
    description: 'Standard laptop, most common resolution',
  },
  DESKTOP_LARGE: {
    width: 1440,
    height: 900,
    name: 'desktop-large',
    description: 'MacBook Pro 13", large laptop',
  },
  DESKTOP_HD: {
    width: 1920,
    height: 1080,
    name: 'desktop-hd',
    description: 'Full HD desktop, 1080p',
  },

  // Wide/Ultra-wide
  DESKTOP_WIDE: {
    width: 2560,
    height: 1440,
    name: 'desktop-wide',
    description: '2K/QHD desktop',
  },
  DESKTOP_ULTRAWIDE: {
    width: 3440,
    height: 1440,
    name: 'desktop-ultrawide',
    description: 'Ultra-wide monitor 21:9',
  },
} as const;

/**
 * Default viewport for visual testing (matches playwright.visual.config.ts)
 */
export const DEFAULT_VIEWPORT = VIEWPORTS.DESKTOP_LARGE;

/**
 * Breakpoints for responsive testing
 */
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1440,
} as const;

/**
 * Common viewport sets for different testing scenarios
 */
export const VIEWPORT_SETS = {
  // Essential viewports for basic coverage
  ESSENTIAL: [
    VIEWPORTS.MOBILE_MEDIUM,
    VIEWPORTS.TABLET_PORTRAIT,
    VIEWPORTS.DESKTOP_LARGE,
  ],
  
  // Mobile-focused testing
  MOBILE_ONLY: [
    VIEWPORTS.MOBILE_SMALL,
    VIEWPORTS.MOBILE_MEDIUM,
    VIEWPORTS.MOBILE_LARGE,
  ],
  
  // Desktop-focused testing
  DESKTOP_ONLY: [
    VIEWPORTS.DESKTOP_SMALL,
    VIEWPORTS.DESKTOP_MEDIUM,
    VIEWPORTS.DESKTOP_LARGE,
    VIEWPORTS.DESKTOP_HD,
  ],
  
  // Comprehensive cross-device testing
  COMPREHENSIVE: [
    VIEWPORTS.MOBILE_MEDIUM,
    VIEWPORTS.TABLET_PORTRAIT,
    VIEWPORTS.TABLET_LANDSCAPE,
    VIEWPORTS.DESKTOP_MEDIUM,
    VIEWPORTS.DESKTOP_LARGE,
    VIEWPORTS.DESKTOP_HD,
  ],
} as const;

/**
 * Helper type for viewport configuration
 */
export type Viewport = {
  width: number;
  height: number;
  name: string;
  description: string;
};

/**
 * Helper to get viewport by name
 */
export function getViewport(name: string): Viewport | undefined {
  return Object.values(VIEWPORTS).find(vp => vp.name === name);
}
