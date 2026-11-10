// Las medidas propias de la vitrina en Flutter que no tienen un token en
// `src/theme/tokens.ts`. Viven aqui, con su nombre, y no sueltas en las
// pantallas; al integrar se pueden subir a los tokens.
export const ShowcaseSizes = {
  // El cuadro rayado de la tarjeta (`showcase_project_card.dart`): su lado, la
  // distancia entre rayas y su grosor.
  hatchSize: 76,
  hatchSpacing: 10,
  hatchStroke: 2,
  // Las barras de `feedback_rating_bars.dart`: alto, borde y esquinas.
  ratingBarHeight: 10,
  ratingBarBorder: 1.2,
  ratingBarRadius: 2,
  // Las casillas del 1 al 5 de `feedback_bottom_sheet.dart`.
  scoreCellHeight: 34,
  // El avatar de `comment_thread_view.dart`, su borde y la raya de las respuestas.
  avatarSize: 32,
  avatarBorder: 1.2,
  replyRuleWidth: 2,
  // La marca "EQUIPO DEL PROYECTO": letra y relleno.
  teamBadgeFontSize: 9.5,
  teamBadgeLetterSpacing: 0.5,
  teamBadgePaddingH: 6,
  teamBadgePaddingV: 2,
  // El espacio de 2 sobre la marca y bajo la etiqueta de cada barra.
  hairGap: 2,
  // La "x" de cancelar la respuesta.
  closeIconSize: 16,
  // Los titulos en mayusculas de "RETROALIMENTACIÓN" y "COMENTARIOS".
  sectionLetterSpacing: 1,
} as const;
