import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppTokens, AppTypography } from "@/src/theme/tokens";

// Las dos primeras iniciales de un nombre, en mayusculas; sin nombre, "?".
export function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return letters.length === 0 ? "?" : letters;
}

// El `CircleAvatar` con iniciales del espacio de trabajo: de 40 y letras
// blancas en el equipo, de 28 y letras de tinta (`small`) en las tareas.
export function MemberAvatar({ name, background, small = false }: { name: string; background: string; small?: boolean }) {
  const size = small ? AppTokens.avatarSizeSmall : AppTokens.avatarSize;
  return (
    <View style={[styles.circle, { width: size, height: size, backgroundColor: background }]}>
      <Text style={small ? AppTypography.avatarInitialsSmall : AppTypography.avatarInitials}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center", borderRadius: AppTokens.pillRadius },
});
