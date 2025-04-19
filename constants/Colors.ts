/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryLight = '#CACAFF';
const accentLight = '#BFE1B3';
const tintColorLight = '#CACAFF';
const tintColorDark = '#CACAFF';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FEFDFA',
    tint: tintColorLight,
    primary: primaryLight,
    accent: accentLight,
    icon: '#000000',
    tabIconDefault: '#00000066',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FEFDFA',
    background: '#000000',
    tint: tintColorDark,
    primary: '#CACAFF',
    accent: '#BFE1B3',
    icon: '#FEFDFA',
    tabIconDefault: '#FEFDFA66',
    tabIconSelected: tintColorDark,
  },
};