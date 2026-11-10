import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { Pill } from "@/src/core/components/Pill";
import { StageChip } from "@/src/core/components/StageChip";
import { ApplicationAction } from "@/src/features/application/presentation/components/ApplicationAction";
import { useMyApplication } from "@/src/features/application/presentation/hooks/useMyApplication";
import { FollowButton } from "@/src/features/follow/presentation/components/FollowButton";
import { ActivePollsBlock } from "@/src/features/poll/presentation/components/ActivePollsBlock";
import { isFull } from "@/src/features/project/domain/entities/Project";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useProjectDetailViewModel } from "../viewmodels/useProjectDetailViewModel";

// Pantalla 07: el detalle de un proyecto. Reemplaza a `project_detail_page.dart`.
//
// El pie se arma con piezas de otros carriles: `FollowButton`,
// `ApplicationAction` (postularse) y `ActivePollsBlock` (encuestas).
export default function ProjectDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ProjectDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { project, myId, isLeader, isMember, team } = useProjectDetailViewModel(route.params.project);
  const { application } = useMyApplication(project.id ?? "");
  // Miembro por las postulaciones aceptadas del proyecto, o por la del
  // estudiante cuando el carril 2 la complete.
  const member = isMember || application?.status === "accepted";
  const full = isFull(project);

  return (
    <ScrollView testID={ProjectDetailScreen.key} style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.chipRow}>
        <StageChip stage={project.stage} />
        {project.tags.map((tag) => (
          <Pill key={tag} label={tag} />
        ))}
      </View>

      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.program}>{project.academicProgram}</Text>
      <Text style={[styles.members, full ? styles.membersFull : null]}>
        {project.currentMembers} de {project.maxMembers} miembros
      </Text>

      {project.problem.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problema a resolver</Text>
          <Text style={styles.body}>{project.problem}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.body}>{project.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades requeridas</Text>
        {project.skillsWanted.length > 0 ? (
          <View style={styles.pills}>
            {project.skillsWanted.map((s) => (
              <Pill key={s} label={s} />
            ))}
          </View>
        ) : (
          <Text style={styles.bodySmall}>No se requieren habilidades específicas</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Equipo actual</Text>
      <View style={styles.avatarRow}>
        {team.initials.map((letters, i) => (
          <View key={i} style={styles.avatar}>
            <Text style={styles.avatarText}>{letters}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.bodySmall, styles.teamNames]}>{team.names}</Text>

      {/* Sin perfil no se sabe quien mira: ni se sigue ni se adivina el lider. */}
      <View style={styles.footer}>
        {myId != null && !isLeader ? (
          <View style={styles.flex}>
            <FollowButton project={project} />
          </View>
        ) : null}
        <ApplicationAction project={project} />
      </View>

      {myId != null ? <ActivePollsBlock project={project} /> : null}

      {isLeader ? (
        <SecondaryButton
          testID={ProjectDetailScreen.applicantsButtonKey}
          label="Gestionar postulantes"
          onPress={() => navigation.navigate("Applicants", { project })}
          style={styles.extraButton}
        />
      ) : null}

      {/* El espacio de trabajo es privado: solo el lider y los miembros. */}
      {isLeader || member ? (
        <PrimaryButton
          testID={ProjectDetailScreen.workspaceButtonKey}
          label="Espacio de trabajo"
          onPress={() => navigation.navigate("Workspace", { project })}
          style={styles.extraButton}
        />
      ) : null}
    </ScrollView>
  );
}

// Las `Key` de Flutter.
ProjectDetailScreen.key = "ProjectDetailPage";
ProjectDetailScreen.applicantsButtonKey = "ButtonApplicants";
ProjectDetailScreen.workspaceButtonKey = "ButtonWorkspace";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.paper },
  flex: { flex: 1 },
  scroll: { padding: AppTokens.gapL },
  chipRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: AppTokens.gapS, rowGap: AppTokens.gapXs, marginBottom: AppTokens.gapM },
  title: { ...AppTypography.headlineMedium, marginBottom: AppTokens.gapXs },
  program: { ...AppTypography.bodySmall, marginBottom: AppTokens.gapM },
  members: { ...AppTypography.bodyMedium, marginBottom: AppTokens.gapL },
  membersFull: { color: AppColors.persimmon, fontFamily: AppFonts.bodySemiBold },
  section: { marginBottom: AppTokens.gapL },
  sectionTitle: { ...AppTypography.titleMedium, marginBottom: AppTokens.gapS },
  body: { ...AppTypography.bodyLarge },
  bodySmall: { ...AppTypography.bodySmall },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  avatarRow: { flexDirection: "row", gap: AppTokens.gapS, marginBottom: AppTokens.gapS },
  avatar: {
    width: AppTokens.typeTileSizeSmall,
    height: AppTokens.typeTileSizeSmall,
    borderRadius: AppTokens.pillRadius,
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...AppTypography.labelLarge, fontFamily: AppFonts.bodyBold },
  teamNames: { marginBottom: AppTokens.gapXl },
  footer: { flexDirection: "row", gap: AppTokens.gapM },
  extraButton: { marginTop: AppTokens.gapM },
});
