import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { innovationTypeOf } from "@/src/core/catalogs";
import { AppColors, AppTokens } from "@/src/theme/tokens";

// El cuadro con el icono de un tipo de innovacion (segunda fase, tarjetas de
// Kora): fondo papel, borde de tinta, esquinas de 4. Va en dos tamaños: 44 en
// las tarjetas de la cartelera y 36 en las compactas.
//
// Recibe la clave tal como esta en el proyecto: nula o desconocida se pinta como
// "Otros", igual que `innovationTypeOf`.
export function TypeTile({ type, size = 44, testID }: { type: string | null | undefined; size?: 44 | 36; testID?: string }) {
  const kind = innovationTypeOf(type);
  return (
    <View
      testID={testID}
      accessibilityLabel={kind.label}
      style={[styles.tile, { width: size, height: size }]}
    >
      <MaterialIcons name={kind.icon} size={size === 44 ? 24 : 20} color={AppColors.ink} />
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
