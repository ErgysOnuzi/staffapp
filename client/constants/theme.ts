import { Platform } from "react-native";

const tintColorLight = "#1A73E8";
const tintColorDark = "#4285F4";

export const SemanticColors = {
  success: "#34A853",
  warning: "#FBBC04",
  error: "#EA4335",
  info: "#4285F4",
  primary: "#1A73E8",
};

export const AccentColors = {
  white: "#FFFFFF",
  pink: "#F48FB1",
  green: "#81C784",
  blue: "#64B5F6",
  red: "#E57373",
};

export const Colors = {
  light: {
    text: "#202124",
    textSecondary: "#5F6368",
    buttonText: "#FFFFFF",
    tabIconDefault: "#5F6368",
    tabIconSelected: tintColorLight,
    link: tintColorLight,
    backgroundRoot: "#F8F9FA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F3F4",
    backgroundTertiary: "#E8EAED",
    border: "#DADCE0",
    ...SemanticColors,
  },
  dark: {
    text: "#E8EAED",
    textSecondary: "#9AA0A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9AA0A6",
    tabIconSelected: tintColorDark,
    link: tintColorDark,
    backgroundRoot: "#121212",
    backgroundDefault: "#1E1E1E",
    backgroundSecondary: "#282828",
    backgroundTertiary: "#323232",
    border: "#3C4043",
    ...SemanticColors,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
