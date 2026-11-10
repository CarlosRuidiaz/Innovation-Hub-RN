import React from "react";
import { StyleSheet, View } from "react-native";

import { AppColors, AppTokens } from "@/src/theme/tokens";

const size = AppTokens.hatchSize;
// Cada raya va de (i, 0) a (i + lado, lado): una diagonal a 45 grados.
const length = size * Math.SQRT2;
const offsets: number[] = [];
for (let i = -size; i < size; i += AppTokens.hatchSpacing) offsets.push(i);

// El cuadro de papel con rayas diagonales de la tarjeta de la vitrina: el
// `_HatchPatternPainter` de Flutter. Las rayas son vistas giradas y el cuadro
// recorta lo que sobra.
export function HatchSquare() {
  return (
    <View style={styles.square}>
      {offsets.map((i) => (
        <View key={i} style={[styles.line, { left: i + size / 2 - length / 2 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    width: size,
    height: size,
    overflow: "hidden",
    backgroundColor: AppColors.paper,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
  },
  line: {
    position: "absolute",
    top: size / 2 - AppTokens.hatchStroke / 2,
    width: length,
    height: AppTokens.hatchStroke,
    backgroundColor: AppColors.hatch,
    transform: [{ rotate: "45deg" }],
  },
});
