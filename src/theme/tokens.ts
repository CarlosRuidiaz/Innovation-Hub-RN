// Identidad visual "Cartelera": los mismos valores de `lib/core/app_tokens.dart`
// de la app Flutter, con los mismos nombres. Este archivo es la UNICA fuente de
// color, medida y tipografia: ninguna pantalla escribe un color o un tamaño
// suelto.

export const AppColors = {
  // Fondo de la app: papel.
  paper: "#F5F0E6",
  // Fondo de tarjetas y superficies elevadas.
  card: "#FFFCF5",
  // Texto principal y bordes.
  ink: "#17150F",
  // Texto secundario y bordes suaves.
  secondary: "#6B665A",
  // Acento principal (acciones destacadas, pestaña activa).
  persimmon: "#E8552F",
  // Acento de apoyo.
  petrol: "#0F5C56",
  // Acento de atencion.
  gold: "#F2B705",
  // Trazo de los rayados decorativos sobre papel (tarjetas de la vitrina).
  hatch: "#DFD7C2",
  // Texto sobre un fondo de color fuerte: la unica excepcion permitida en
  // Flutter (`Colors.white`).
  white: "#FFFFFF",
  // El velo detras de una hoja: el `Colors.black54` que pone Flutter por
  // omision en `showModalBottomSheet`.
  backdrop: "rgba(0, 0, 0, 0.54)",
  // Un boton deshabilitado: lo que pone Flutter por omision, la tinta al 12 %
  // de fondo y al 38 % en el texto.
  disabledBackground: "rgba(23, 21, 15, 0.12)",
  disabledText: "rgba(23, 21, 15, 0.38)",
} as const;

// Colores de las seis etapas de un proyecto. Viven en la UI: la entidad no sabe
// de colores.
export const AppStageColors = {
  idea: "#F2B705",
  teamFormation: "#E8552F",
  research: "#2D5BFF",
  prototype: "#0F5C56",
  testing: "#6B4EE6",
  finished: "#17150F",
} as const;

// Medidas del sistema: radio 4, borde 1.5 y sombra dura de 3 sin difuminado.
export const AppTokens = {
  radius: 4,
  borderWidth: 1.5,
  shadowOffset: 3,

  // Espaciados usados en las pantallas.
  gapXs: 4,
  gapS: 8,
  gapM: 12,
  gapL: 16,
  gapXl: 24,

  // Las hojas que suben desde abajo redondean el borde de arriba con 3 radios.
  sheetRadius: 12,
  // Las pildoras son redondas del todo.
  pillRadius: 999,
  // Iconos de los estados vacios.
  emptyIconSize: 48,
} as const;

// Las familias cargadas en `App.tsx`. En React Native cada peso es una fuente
// distinta: `fontWeight` no elige el archivo, el nombre de la familia si.
export const AppFonts = {
  displaySemiBold: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  body: "Archivo_400Regular",
  bodySemiBold: "Archivo_600SemiBold",
  bodyBold: "Archivo_700Bold",
} as const;

type TextStyleToken = {
  fontFamily: string;
  fontSize: number;
  color: string;
  lineHeight?: number;
};

// La tabla de tipografia de `app_theme.dart`: Fraunces para titulares, Archivo
// para todo lo demas, con los mismos tamaños y pesos.
export const AppTypography = {
  displayLarge: { fontFamily: AppFonts.displayBold, fontSize: 32, color: AppColors.ink },
  headlineMedium: { fontFamily: AppFonts.displayBold, fontSize: 26, color: AppColors.ink },
  // El titulo de la barra de arriba (`appBarTheme.titleTextStyle`).
  appBarTitle: { fontFamily: AppFonts.displayBold, fontSize: 22, color: AppColors.ink },
  titleLarge: { fontFamily: AppFonts.displayBold, fontSize: 20, color: AppColors.ink },
  titleMedium: { fontFamily: AppFonts.displaySemiBold, fontSize: 16, color: AppColors.ink },
  bodyLarge: { fontFamily: AppFonts.body, fontSize: 15, color: AppColors.ink },
  bodyMedium: { fontFamily: AppFonts.body, fontSize: 13.5, color: AppColors.ink },
  bodySmall: { fontFamily: AppFonts.body, fontSize: 12, color: AppColors.secondary },
  labelLarge: { fontFamily: AppFonts.bodySemiBold, fontSize: 14, color: AppColors.ink },
  // Texto de los botones principal y secundario.
  button: { fontFamily: AppFonts.bodySemiBold, fontSize: 15, color: AppColors.ink },
  // Pestañas de arriba (`tabBarTheme`).
  tab: { fontFamily: AppFonts.bodySemiBold, fontSize: 14, color: AppColors.ink },
  // Etiquetas de la barra inferior.
  navLabel: { fontFamily: AppFonts.body, fontSize: 10, color: AppColors.ink },
  // Texto de una pildora.
  pill: { fontFamily: AppFonts.bodySemiBold, fontSize: 11.5, color: AppColors.ink, lineHeight: 14 },
} as const satisfies Record<string, TextStyleToken>;

// Elige tinta o blanco para el texto segun el brillo del fondo, como
// `ThemeData.estimateBrightnessForColor` de Flutter.
export function textColorOn(background: string): string {
  return isDark(background) ? AppColors.white : AppColors.ink;
}

function isDark(hex: string): boolean {
  const value = hex.replace("#", "");
  const channel = (i: number) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  // El mismo umbral de Flutter: (L + 0.05)^2 > 0.15 es un fondo claro.
  return (luminance + 0.05) * (luminance + 0.05) <= 0.15;
}
