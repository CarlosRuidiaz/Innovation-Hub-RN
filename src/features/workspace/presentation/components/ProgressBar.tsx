import React from "react";
import { StyleSheet, View } from "react-native";

import { AppColors, AppTokens } from "@/src/theme/tokens";

const TICKS = Array.from({ length: 10 }, (_, i) => i);

// La barra de avance de la cabecera (`_ProgressBar` de `workspace_page.dart`):
// relleno persimmon sobre fondo de papel, con diez marcas cortas debajo a
// modo de regla graduada.
export function ProgressBar({ percent }: { percent: number }) {
  const factor = Math.min(Math.max(percent, 0), 100);
  return (
    <View>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: factor }}>
        <View style={[styles.fill, { width: `${factor}%` }]} />
      </View>
      <View style={styles.ticks}>
        {TICKS.map((i) => (
          <View key={i} style={styles.tick} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: AppTokens.progressBarHeight,
    borderRadius: AppTokens.pillRadius,
    backgroundColor: AppColors.paper,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: AppColors.persimmon },
  ticks: { flexDirection: "row", gap: AppTokens.gapXs, marginTop: AppTokens.gapXs },
  tick: { flex: 1, height: AppTokens.progressTickHeight, backgroundColor: AppColors.secondary },
});
