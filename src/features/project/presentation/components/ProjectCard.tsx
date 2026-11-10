import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { StageChip } from "@/src/core/components/StageChip";
import { acceptsApplications, isFull, Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";

// Tarjeta de un proyecto en la cartelera. Reemplaza a `project_card.dart`.
// La llave de cada instancia es `ProjectCard-${project.id}`, como en Flutter.
// Como en Flutter, la tarjeta no muestra los tags: salen en el detalle.
type Props = {
  project: Project;
  onPress?: () => void;
  testID?: string;
};

export function ProjectCard({ project, onPress, testID }: Props) {
  const accepts = acceptsApplications(project);
  const full = isFull(project);

  return (
    <PaperCard onPress={onPress} testID={testID}>
      <Text style={styles.title}>{project.title}</Text>
      <View style={styles.chipRow}>
        <StageChip stage={project.stage} />
      </View>
      <Text style={styles.meta}>
        {project.academicProgram} · {project.currentMembers} de {project.maxMembers} miembros
      </Text>
      <View>
        {accepts ? (
          project.skillsWanted.length > 0 ? (
            <Text style={styles.skills}>Busca: {project.skillsWanted.join(" · ")}</Text>
          ) : (
            <Text style={styles.skills}>Abierto a postulaciones</Text>
          )
        ) : (
          <Text style={[styles.skills, styles.closed]}>
            {full ? "Equipo completo · reclutamiento cerrado" : "Reclutamiento cerrado"}
          </Text>
        )}
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  title: { ...AppTypography.titleMedium, marginBottom: AppTokens.gapS },
  chipRow: { flexDirection: "row", marginBottom: AppTokens.gapS },
  meta: { ...AppTypography.bodyMedium, marginBottom: AppTokens.gapS },
  skills: { ...AppTypography.bodySmall },
  closed: { color: AppColors.persimmon, fontFamily: AppFonts.bodySemiBold },
});

ProjectCard.keyFor = (project: Project) => `ProjectCard-${project.id}`;
