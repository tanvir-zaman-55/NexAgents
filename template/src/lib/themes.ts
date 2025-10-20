/**
 * Theme configurations for the landing page
 *
 * Each theme defines a cohesive color scheme that can be applied
 * throughout the application. Themes are designed to work seamlessly
 * with the Tailwind configuration.
 */

export type ThemeName = "creative" | "professional" | "modern" | "warm";

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    primaryHover: string;
    accent: string;
    accentHover: string;
    background: string;
    text: string;
    textMuted: string;
  };
  buttonVariant: "primary" | "professional" | "tech" | "warm";
  badgeVariant: "default" | "professional" | "tech" | "warm";
}

export const themes: Record<ThemeName, Theme> = {
  creative: {
    name: "creative",
    displayName: "Creative Purple",
    description: "Bold and vibrant purple theme with pink accents",
    colors: {
      primary: "#8B5CF6", // purple-500
      primaryHover: "#7C3AED", // purple-600
      accent: "#EC4899", // pink-500
      accentHover: "#DB2777", // pink-600
      background: "#FFFFFF",
      text: "#1F2937", // gray-800
      textMuted: "#6B7280", // gray-500
    },
    buttonVariant: "primary",
    badgeVariant: "default",
  },
  professional: {
    name: "professional",
    displayName: "Professional",
    description: "Sophisticated charcoal with bronze accents",
    colors: {
      primary: "#1a1a1a", // charcoal-950
      primaryHover: "#343a40", // charcoal-800
      accent: "#c9a961", // bronze-500
      accentHover: "#b8964e", // bronze-600
      background: "#FFFFFF",
      text: "#1a1a1a", // charcoal-950
      textMuted: "#6c757d", // charcoal-600
    },
    buttonVariant: "professional",
    badgeVariant: "professional",
  },
  modern: {
    name: "modern",
    displayName: "Modern Tech",
    description: "Sleek tech theme with cyber blue accents",
    colors: {
      primary: "#0f172a", // slate-900
      primaryHover: "#1e293b", // slate-800
      accent: "#00f2fe", // cyber-500
      accentHover: "#4facfe", // cyber-400
      background: "#FFFFFF",
      text: "#0f172a", // slate-900
      textMuted: "#64748b", // slate-500
    },
    buttonVariant: "tech",
    badgeVariant: "tech",
  },
  warm: {
    name: "warm",
    displayName: "Warm Welcome",
    description: "Inviting warm theme with amber accents",
    colors: {
      primary: "#1c1917", // stone-900
      primaryHover: "#292524", // stone-800
      accent: "#f59e0b", // amber-500
      accentHover: "#d97706", // amber-600
      background: "#fffbeb", // amber-50
      text: "#1c1917", // stone-900
      textMuted: "#78716c", // stone-500
    },
    buttonVariant: "warm",
    badgeVariant: "warm",
  },
};

export const defaultTheme: ThemeName = "creative";

/**
 * Get a theme by name
 */
export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes[defaultTheme];
}

/**
 * Get all available themes
 */
export function getAllThemes(): Theme[] {
  return Object.values(themes);
}
