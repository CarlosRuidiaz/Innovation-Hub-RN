import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { StageChip } from "@/src/core/components/StageChip";
import { TypeTile } from "@/src/core/components/TypeTile";
import { ProjectCounters } from "@/src/features/follow/presentation/components/ProjectCounters";
import { Project } from "@/src/features/project/domain/entities/Project";
import { AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";

type Props = {
  project: Project;
  bottomWidget?: React.ReactNode;
  trailing?: React.ReactNode;
  onTap?: () => void;
  testID?: string;
};

// Tarjeta compacta de proyecto, usada en el perfil y en "Mis proyectos".
// Reemplaza a `lib/features/my_projects/ui/views/widgets/compact_project_card.dart`.
//
// Con Kora, como la de la cartelera: el icono del tipo (compacto) con los
// contadores debajo, el titulo a todo el ancho y la etapa junto al programa.
export function CompactProjectCard({ project, bottomWidget, trailing, onTap, testID }: Props) {
  return (
    <PaperCard testID={testID} onPress={onTap} margin={styles.cardMargin} padding={AppTokens.gapM}>
      <View style={styles.contentRow}>
        <View style={styles.side}>
          <TypeTile type={project.innovationType} compact />
          <ProjectCounters project={project} />
        </View>
        <View style={styles.mainCol}>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.metaRow}>
            <StageChip stage={project.stage} />
            <Text style={styles.members} numberOfLines={1}>
              {project.academicProgram}
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
    gap: AppTokens.gapM,
  },
  side: {
    alignItems: "center",
  },
  mainCol: {
    flex: 1,
    gap: AppTokens.gapXs,
  },
  title: {
    ...AppTypography.titleMedium,
    fontFamily: AppFonts.displayBold,
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

