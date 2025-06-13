/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#eab308'; // Gold-500
const tintColorDark = '#facc15'; // Gold-400

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#eab308', // Gold-500
    secondary: '#facc15', // Gold-400
    accent: '#fef3c7', // Gold-100
    muted: '#fef9c3', // Yellow-100
    card: '#fff',
    border: '#fde68a', // Amber-200
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#facc15', // Gold-400
    secondary: '#eab308', // Gold-500
    accent: '#78350f', // Amber-900
    muted: '#92400e', // Amber-800
    card: '#1f2937', // Slate-800
    border: '#92400e', // Amber-800
  },
};

export const PRIMARY = '#FF4B4B';
export const SECONDARY = '#4B4BFF';
export const BACKGROUND = '#FFFFFF';
export const TEXT = '#000000';
export const TEXT_SECONDARY = '#666666';
