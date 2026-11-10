import { configureFonts, MD3LightTheme } from "react-native-paper";

import { AppColors, AppFonts, AppTypography } from "./tokens";

// El tema "Cartelera" de React Native Paper, armado desde `tokens.ts`. Es la
// traduccion de `lib/core/app_theme.dart`: los componentes de Paper que no se
// dibujan a mano (campos, avisos, indicadores) toman de aqui sus colores y
// fuentes.
type Variant = keyof typeof MD3LightTheme.fonts;

// Cada variante de Paper con su familia: los titulares en Fraunces y el resto en
// Archivo. Despues, los tamaños y pesos que fija `app_theme.dart`.
const display = (v: Variant) => v.startsWith("display") || v.startsWith("headline") || v.startsWith("title");
const base = Object.fromEntries(
  (Object.keys(MD3LightTheme.fonts) as Variant[])
    .filter((v) => v !== "default")
    .map((v) => [v, { ...MD3LightTheme.fonts[v], fontFamily: display(v) ? AppFonts.displayBold : AppFonts.body }]),
);

const fonts = configureFonts({
  config: {
    ...base,
    displayLarge: { ...MD3LightTheme.fonts.displayLarge, fontFamily: AppFonts.displayBold, fontSize: AppTypography.displayLarge.fontSize, fontWeight: "700" },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: AppFonts.displayBold, fontSize: AppTypography.headlineMedium.fontSize, fontWeight: "700" },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: AppFonts.displayBold, fontSize: AppTypography.titleLarge.fontSize, fontWeight: "700" },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: AppFonts.displaySemiBold, fontSize: AppTypography.titleMedium.fontSize, fontWeight: "600" },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: AppFonts.body, fontSize: AppTypography.bodyLarge.fontSize },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: AppFonts.body, fontSize: AppTypography.bodyMedium.fontSize },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: AppFonts.body, fontSize: AppTypography.bodySmall.fontSize },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: AppFonts.bodySemiBold, fontSize: AppTypography.labelLarge.fontSize, fontWeight: "600" },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: AppFonts.bodySemiBold },
  },
});

export const lightTheme = {
  ...MD3LightTheme,
  roundness: 1,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: AppColors.persimmon,
    onPrimary: AppColors.white,
    primaryContainer: AppColors.card,
    onPrimaryContainer: AppColors.ink,
    secondary: AppColors.petrol,
    onSecondary: AppColors.white,
    secondaryContainer: AppColors.paper,
    onSecondaryContainer: AppColors.ink,
    background: AppColors.paper,
    onBackground: AppColors.ink,
    surface: AppColors.card,
    onSurface: AppColors.ink,
    surfaceVariant: AppColors.paper,
    onSurfaceVariant: AppColors.secondary,
    outline: AppColors.ink,
    outlineVariant: AppColors.secondary,
    error: AppColors.persimmon,
    onError: AppColors.white,
    errorContainer: AppColors.card,
    onErrorContainer: AppColors.persimmon,
    inverseSurface: AppColors.ink,
    inverseOnSurface: AppColors.white,
    backdrop: AppColors.backdrop,
    elevation: {
      level0: "transparent",
      level1: AppColors.card,
      level2: AppColors.card,
      level3: AppColors.card,
      level4: AppColors.card,
      level5: AppColors.card,
    },
  },
};

// "Cartelera" es un sistema de papel claro: no hay variante oscura. Como en
// Flutter (`AppTheme.dark => light`), con el sistema en modo oscuro la app se
// ve igual en vez de caer al Material por defecto.
export const darkTheme = lightTheme;
