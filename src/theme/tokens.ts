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
  // Kora: el papel al 85 %, para el texto chico sobre el bloque persimmon de la
  // frase de la comunidad.
  paperMuted: "rgba(245, 240, 230, 0.85)",
  // El blanco al 80 % (el subtitulo del banner de la vitrina) y la tinta al
  // 15 % (las lineas finas de la gestion de postulantes).
  whiteMuted: "rgba(255, 255, 255, 0.8)",
  inkFaint: "rgba(23, 21, 15, 0.15)",
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
  // Iconos: el normal de Flutter, el compacto y el que va dentro de un boton.
  iconSize: 24,
  iconSizeSmall: 20,
  buttonIconSize: 18,
  // Relleno de los botones principal y secundario (`padding` de sus temas).
  buttonPaddingH: 20,
  buttonPaddingV: 14,
  // Relleno a los lados de una pildora.
  pillPaddingH: 10,
  // El cuadro del tipo de innovacion: en la cartelera y en las tarjetas compactas.
  typeTileSize: 44,
  typeTileSizeSmall: 36,
  // La barra inferior de `home_page.dart`: relleno arriba y abajo, la raya
  // persimmon bajo la pestaña activa y el boton negro de "Crear".
  navBarPaddingTop: 8,
  navBarPaddingBottom: 16,
  navIndicatorWidth: 16,
  navIndicatorHeight: 3,
  navIndicatorRadius: 2,
  navCreateWidth: 42,
  navCreateHeight: 28,
  navCreateBottomSpace: 7,
  // Los campos de texto (`inputDecorationTheme`): relleno de 14 y, con el foco,
  // borde persimmon de 2.
  fieldPadding: 14,
  focusedBorderWidth: 2,
  // El espacio de trabajo: la barra de avance de la cabecera (10 de alto, con
  // marcas de 4 debajo), el punto y la linea de la bitacora de avances, y los
  // avatares con iniciales (el `CircleAvatar` de Flutter: 40, y 28 en las tareas).
  progressBarHeight: 10,
  progressTickHeight: 4,
  timelineDotSize: 12,
  timelineLineWidth: 2,
  avatarSize: 40,
  avatarSizeSmall: 28,
  // La barra de cada opcion en los resultados de una encuesta: el alto del
  // `LinearProgressIndicator` de Flutter.
  resultBarHeight: 4,
  // El calendario para elegir una fecha (`showDatePicker`): cada dia es un
  // circulo de 40.
  calendarDaySize: 40,
  // Las pestañas de arriba (`TabBar` de Flutter): 46 de alto, la raya de la
  // pestaña activa de 2 y la linea de abajo de 1.
  tabHeight: 46,
  tabIndicatorHeight: 2,
  tabDividerHeight: 1,
  // Kora: la frase de la comunidad (59 de alto), la franja de cifras con sus
  // separadores, los contadores de las tarjetas y los botones cuadrados de
  // aceptar y rechazar en la gestion de postulantes.
  communityBannerHeight: 59,
  statDividerWidth: 1,
  counterIconSize: 14,
  squareButtonSize: 42,
  // Lineas finas de 1, el espacio de 2 entre lineas de texto, la barra del
  // mensaje citado, el espaciado de las etiquetas en mayusculas, el alto minimo
  // de un vacio dentro de una lista y el avatar grande del perfil.
  hairline: 1,
  hairGap: 2,
  quoteBarWidth: 3,
  labelLetterSpacing: 0.5,
  emptyMinHeight: 180,
  avatarSizeLarge: 64,
  // La vitrina (`showcase_project_card.dart`, `feedback_rating_bars.dart`,
  // `feedback_bottom_sheet.dart` y `comment_thread_view.dart`).
  hatchSize: 76,
  hatchSpacing: 10,
  hatchStroke: 2,
  ratingBarHeight: 10,
  ratingBarBorder: 1.2,
  ratingBarRadius: 2,
  scoreCellHeight: 34,
  commentAvatarSize: 32,
  commentAvatarBorder: 1.2,
  replyRuleWidth: 2,
  teamBadgeFontSize: 9.5,
  teamBadgeLetterSpacing: 0.5,
  teamBadgePaddingH: 6,
  teamBadgePaddingV: 2,
  closeIconSize: 16,
  sectionLetterSpacing: 1,
} as const;

// Las familias cargadas en `App.tsx`. En React Native cada peso es una fuente
// distinta: `fontWeight` no elige el archivo, el nombre de la familia si.
export const AppFonts = {
  displaySemiBold: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  // Kora: la frase de la comunidad.
  displaySemiBoldItalic: "Fraunces_600SemiBold_Italic",
  body: "Archivo_400Regular",
  // Kora: el mensaje del postulante.
  bodyItalic: "Archivo_400Regular_Italic",
  // Kora: las etiquetas de las cifras.
  bodyMedium: "Archivo_500Medium",
  bodySemiBold: "Archivo_600SemiBold",
  bodyBold: "Archivo_700Bold",
} as const;

type TextStyleToken = {
  fontFamily: string;
  fontSize: number;
  color: string;
  lineHeight?: number;
  letterSpacing?: number;
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
  // La de la pestaña activa, en negrita.
  navLabelActive: { fontFamily: AppFonts.bodyBold, fontSize: 10, color: AppColors.ink },
  // Etiqueta, pista y contador de los campos de texto.
  field: { fontFamily: AppFonts.body, fontSize: 14, color: AppColors.secondary },
  // Texto de una pildora.
  pill: { fontFamily: AppFonts.bodySemiBold, fontSize: 11.5, color: AppColors.ink, lineHeight: 14 },
  // Kora: "COMUNIDAD DE INNOVACIÓN" y la frase de abajo, sobre persimmon.
  communityKicker: { fontFamily: AppFonts.bodySemiBold, fontSize: 10.5, color: AppColors.paperMuted, letterSpacing: 1.2 },
  communityPhrase: { fontFamily: AppFonts.displaySemiBoldItalic, fontSize: 17, color: AppColors.paper },
  // Kora: las cifras de Explorar, el numero y su etiqueta.
  statNumber: { fontFamily: AppFonts.displayBold, fontSize: 22, color: AppColors.persimmon },
  statLabel: { fontFamily: AppFonts.bodyMedium, fontSize: 11.5, color: AppColors.ink, lineHeight: 14 },
  // Kora: los contadores de miembros y seguidores bajo el icono de la tarjeta.
  counter: { fontFamily: AppFonts.bodySemiBold, fontSize: 11, color: AppColors.secondary },
  // Kora: el mensaje del postulante, en cursiva.
  quote: { fontFamily: AppFonts.bodyItalic, fontSize: 13.5, color: AppColors.ink },
  // Las iniciales dentro de un avatar: blancas sobre color en el equipo, de
  // tinta y mas chicas en las tareas.
  avatarInitials: { fontFamily: AppFonts.bodyBold, fontSize: 16, color: AppColors.white },
  avatarInitialsSmall: { fontFamily: AppFonts.bodyBold, fontSize: 11, color: AppColors.ink },
  // La fecha de un avance en la bitacora (`labelSmall` con espaciado de 1).
  timelineDate: { fontFamily: AppFonts.bodySemiBold, fontSize: 11, color: AppColors.secondary, letterSpacing: 1 },
  // El titulo de los resultados de una encuesta: el `headlineSmall` que Flutter
  // deja con su tamaño por omision.
  headlineSmall: { fontFamily: AppFonts.body, fontSize: 24, color: AppColors.ink },
  // Una pestaña de arriba sin elegir (`unselectedLabelStyle`).
  tabUnselected: { fontFamily: AppFonts.body, fontSize: 14, color: AppColors.secondary },
  // El conteo de cada opcion en los resultados de una encuesta, en negrita.
  resultCount: { fontFamily: AppFonts.bodyBold, fontSize: 13.5, color: AppColors.ink },
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
