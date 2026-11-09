import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { innovationTypeOf } from "@/src/core/catalogs";
import { AppColors, AppTokens } from "@/src/theme/tokens";

// El cuadro con el icono de un tipo de innovacion (segunda fase, tarjetas de
// Kora): fondo papel, borde de tinta, esquinas de 4. Va en dos tamaños: 44 en
// las tarjetas de la cartelera y 36 (`compact`) en las compactas.
//
// Recibe la clave tal como esta en el proyecto: nula o desconocida se pinta como
// "Otros", igual que `innovationTypeOf`.
export function TypeTile({ type, compact = false, testID }: { type: string | null | undefined; compact?: boolean; testID?: string }) {
  const kind = innovationTypeOf(type);
  const size = compact ? AppTokens.typeTileSizeSmall : AppTokens.typeTileSize;
  return (
    <View
      testID={testID}
      accessibilityLabel={kind.label}
      style={[styles.tile, { width: size, height: size }]}
    >
      <MaterialIcons name={kind.icon} size={compact ? AppTokens.iconSizeSmall : AppTokens.iconSize} color={AppColors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.paper,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
  },
});
