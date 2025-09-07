import { Colors } from './Colors';

const Fonts = {
  sizes: {
    small: 12, // --text-xs: 0.75rem (0.75 * 16px = 12px)
    medium: 16, // --text-base: 1rem (1 * 16px = 16px)
    large: 20, // --text-xl: 1.25rem (1.25 * 16px = 20px)
    xlarge: 24, // --text-2xl: 1.5rem (1.5 * 16px = 24px)
  },
  weights: {
    light: '300', // Keep existing, not found in CSS
    regular: '400', // --font-weight-normal
    medium: '500', // --font-weight-medium
    bold: 'bold', // Keep existing, not found in CSS
  },
};

const Spacing = {
  small: 8, // 2 * var(--spacing) = 2 * 4px = 8px
  medium: 16, // 4 * var(--spacing) = 4 * 4px = 16px
  large: 24, // 6 * var(--spacing) = 6 * 4px = 24px
};

const Radii = {
  small: 4,
  medium: 8,
  large: 12,
};

const Shadows = {
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const Theme = {
  Colors,
  Fonts,
  Spacing,
  Radii,
  Shadows,
};
