import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppColors, AppTokens, AppTypography, textColorOn } from "@/src/theme/tokens";

// Chip en pildora del sistema "Cartelera". Reemplaza a
// `lib/core/widgets/pill.dart`. Generico a proposito: no sabe de proyectos ni
// de etapas, quien lo usa le pasa el texto y el color.
type Props = {
  label: string;
  background?: string;
  // Si no se pasa, blanco o tinta segun el brillo del fondo, como en Flutter.
  foreground?: string;
  outlined?: boolean;
  // El color del borde, si va con borde. Por omision, tinta.
  borderColor?: string;
  testID?: string;
};

export function Pill({ label, background = AppColors.card, foreground, outlined = true, borderColor, testID }: Props) {
  return (
    <View
      testID={testID}
      style={[styles.pill, { backgroundColor: background }, outlined ? styles.outlined : null, outlined && borderColor ? { borderColor } : null]}
    >
      <Text style={[styles.label, { color: foreground ?? textColorOn(background) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: AppTokens.pillPaddingH,
    paddingVertical: AppTokens.gapXs,
    borderRadius: AppTokens.pillRadius,
  },
  outlined: {
    borderWidth: AppTokens.borderWidth,
    borderColor: AppColors.ink,
  },
  label: AppTypography.pill,
});
