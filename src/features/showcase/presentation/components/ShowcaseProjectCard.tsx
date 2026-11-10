import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { StageChip } from "@/src/core/components/StageChip";
import { Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { HatchSquare } from "./HatchSquare";

type Props = {
  project: Project;
  commentCount: number;
  overallAverage: number;
  onPress: () => void;
};

// La tarjeta de un prototipo en la vitrina: `showcase_project_card.dart`.
export function ShowcaseProjectCard({ project, commentCount, overallAverage, onPress }: Props) {
  return (
    <PaperCard
      onPress={onPress}
      padding={AppTokens.gapM}
      testID={ShowcaseProjectCard.keyFor(project.id)}
      accessibilityLabel={project.title}
    >
      <View style={styles.row}>
        <HatchSquare />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {project.title}
            </Text>
            <StageChip stage="prototype" />
          </View>
          <Text style={styles.program}>{project.academicProgram}</Text>
          <Text style={styles.stats}>{statsText(commentCount, overallAverage)}</Text>
        </View>
      </View>
    </PaperCard>
  );
}

ShowcaseProjectCard.keyFor = (projectId: string | null) => `ShowcaseProjectCard_${projectId ?? ""}`;

export function statsText(commentCount: number, overallAverage: number) {
  return overallAverage > 0
    ? `${commentCount} comentarios · ${overallAverage.toFixed(1)} ★`
    : `${commentCount} comentarios · Sin calificaciones`;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: AppTokens.gapM },
  body: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: AppTokens.gapXs },
  title: { ...AppTypography.titleMedium, fontFamily: AppFonts.displayBold, flex: 1 },
  program: { ...AppTypography.bodySmall, marginTop: AppTokens.gapXs },
  stats: { ...AppTypography.bodySmall, fontFamily: AppFonts.bodySemiBold, color: AppColors.ink, marginTop: AppTokens.gapS },
});
