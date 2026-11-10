import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { StageChip } from "@/src/core/components/StageChip";
import { acceptsApplications, isFull, Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// Tarjeta de un proyecto en la cartelera. Reemplaza a `project_card.dart`.
// La llave de cada instancia es `ProjectCard-${project.id}`, como en Flutter.
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
      <View style={styles.bottom}>
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
      {project.tags.length > 0 ? (
        <View style={styles.tags}>
          {project.tags.map((tag) => (
            <Pill key={tag} label={tag} />
          ))}
        </View>
      ) : null}
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  title: { ...AppTypography.titleMedium, marginBottom: AppTokens.gapS },
  chipRow: { flexDirection: "row", marginBottom: AppTokens.gapS },
  meta: { ...AppTypography.bodyMedium, marginBottom: AppTokens.gapXs },
  bottom: { marginTop: 2 },
  skills: { ...AppTypography.bodySmall },
  closed: { color: AppColors.persimmon, fontFamily: "Archivo_600SemiBold" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapXs, marginTop: AppTokens.gapS },
});
