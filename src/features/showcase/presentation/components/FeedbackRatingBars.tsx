import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { FeedbackSummary, isEmptySummary } from "../../domain/entities/FeedbackSummary";

// Los cuatro promedios de un prototipo en barras de cinco: `feedback_rating_bars.dart`.
export function FeedbackRatingBars({ summary }: { summary: FeedbackSummary }) {
  const empty = isEmptySummary(summary);
  return (
    <View>
      <BarRow label="Usabilidad" score={summary.usabilityAverage} empty={empty} />
      <BarRow label="Innovación" score={summary.innovationAverage} empty={empty} />
      <BarRow label="Diseño visual" score={summary.visualDesignAverage} empty={empty} />
      <BarRow label="Factibilidad técnica" score={summary.feasibilityAverage} empty={empty} />
    </View>
  );
}

// "4 de 5" si es entero, "3.5 de 5" si no, y "Sin datos" sin calificaciones.
export function scoreLabel(score: number, empty: boolean) {
  if (empty) return "Sin datos";
  return `${score % 1 === 0 ? score : score.toFixed(1)} de 5`;
}

function BarRow({ label, score, empty }: { label: string; score: number; empty: boolean }) {
  const filled = Math.round(score);
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.score}>{scoreLabel(score, empty)}</Text>
      </View>
      <View style={styles.bars}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.bar, i < filled ? styles.filled : null]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: AppTokens.gapM },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { ...AppTypography.bodyMedium, fontFamily: AppFonts.bodyBold },
  score: AppTypography.bodySmall,
  bars: { flexDirection: "row", gap: AppTokens.gapXs, marginTop: AppTokens.gapXs + AppTokens.hairGap },
  bar: {
    flex: 1,
    height: AppTokens.ratingBarHeight,
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.ratingBarBorder,
    borderRadius: AppTokens.ratingBarRadius,
  },
  filled: { backgroundColor: AppColors.persimmon },
});
