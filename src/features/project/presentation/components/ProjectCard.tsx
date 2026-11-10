import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { StageChip } from "@/src/core/components/StageChip";
import { TypeTile } from "@/src/core/components/TypeTile";
import { ProjectCounters } from "@/src/features/follow/presentation/components/ProjectCounters";
import { acceptsApplications, isFull, Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";

// Tarjeta de un proyecto en la cartelera. Reemplaza a `project_card.dart`.
// La llave de cada instancia es `ProjectCard-${project.id}`, como en Flutter.
// Como en Flutter, la tarjeta no muestra los tags: salen en el detalle.
//
// Con Kora: a la izquierda el icono del tipo con los contadores de miembros y
// seguidores debajo, y a la derecha el titulo a todo el ancho y la etapa en la
// fila del programa. Mas datos en una tarjeta mas baja.
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
      <View style={styles.row}>
        <View style={styles.side}>
          <TypeTile type={project.innovationType} />
          <ProjectCounters project={project} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.metaRow}>
            <StageChip stage={project.stage} />
            <Text style={styles.meta} numberOfLines={1}>
              {project.academicProgram}
            </Text>
          </View>
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
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: AppTokens.gapM },
  side: { alignItems: "center" },
  body: { flex: 1 },
  title: { ...AppTypography.titleMedium, marginBottom: AppTokens.gapS },
  metaRow: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapS, marginBottom: AppTokens.gapS },
  meta: { ...AppTypography.bodyMedium, flex: 1 },
  skills: { ...AppTypography.bodySmall },
  closed: { color: AppColors.persimmon, fontFamily: AppFonts.bodySemiBold },
});

ProjectCard.keyFor = (project: Project) => `ProjectCard-${project.id}`;
