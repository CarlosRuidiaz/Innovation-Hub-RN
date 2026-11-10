import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { StageChip } from "@/src/core/components/StageChip";
import { Project } from "@/src/features/project/domain/entities/Project";
import { AppTokens, AppTypography } from "@/src/theme/tokens";

type Props = {
  project: Project;
  bottomWidget?: React.ReactNode;
  trailing?: React.ReactNode;
  onTap?: () => void;
  testID?: string;
};

// Tarjeta compacta de proyecto, usada en el perfil y en "Mis proyectos".
// Reemplaza a `lib/features/my_projects/ui/views/widgets/compact_project_card.dart`.
export function CompactProjectCard({ project, bottomWidget, trailing, onTap, testID }: Props) {
  return (
    <PaperCard testID={testID} onPress={onTap} margin={styles.cardMargin} padding={AppTokens.gapM}>
      <View style={styles.contentRow}>
        <View style={styles.mainCol}>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.metaRow}>
            <StageChip stage={project.stage} />
            <Text style={styles.members} numberOfLines={1}>
              {`${project.currentMembers} de ${project.maxMembers} miembros`}
            </Text>
          </View>
          {bottomWidget ? <View style={styles.bottom}>{bottomWidget}</View> : null}
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  cardMargin: {
    marginHorizontal: AppTokens.gapL,
    marginBottom: AppTokens.gapM,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainCol: {
    flex: 1,
    gap: AppTokens.gapXs,
  },
  title: {
    ...AppTypography.titleMedium,
    fontWeight: "bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTokens.gapS,
  },
  members: {
    ...AppTypography.bodySmall,
    flex: 1,
  },
  bottom: {
    marginTop: AppTokens.gapXs,
  },
  trailing: {
    marginLeft: AppTokens.gapS,
  },
});

