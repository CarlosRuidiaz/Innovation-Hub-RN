import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SecondaryButton, PrimaryButton } from "@/src/core/components/Buttons";
import { Pill } from "@/src/core/components/Pill";
import { StageChip } from "@/src/core/components/StageChip";
import { ApplicationAction } from "@/src/features/application/presentation/components/ApplicationAction";
import { useMyApplication } from "@/src/features/application/presentation/hooks/useMyApplication";
import { useFollows } from "@/src/features/follow/presentation/context/FollowsContext";
import { FollowButton } from "@/src/features/follow/presentation/components/FollowButton";
import { ActivePollsBlock } from "@/src/features/poll/presentation/components/ActivePollsBlock";
import { isFull, Project } from "@/src/features/project/domain/entities/Project";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";

type DetailRoute = RouteProp<RootStackParamList, "ProjectDetail">;

// Pantalla 07: detalle de un proyecto. Reemplaza a `project_detail_page.dart`.
export default function ProjectDetailScreen() {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useSession();
  const { projects, refresh } = useProjects();
  const { isFollowing } = useFollows();
  const { application } = useMyApplication(route.params.project.id ?? "");

  // El proyecto del argumento es la foto al abrir. La copia viva viene del
  // contexto; si el id no esta, se usa el argumento de respaldo.
  const argumento = route.params.project;
  const project: Project = projects.find((p) => p.id === argumento.id) ?? argumento;

  // Al abrir el detalle se refresca la lista (igual que `_cargar` en Flutter).
  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const miId = user?.userId ?? null;
  const esLider = miId != null && project.leaderId === miId;

  // La postulacion aceptada indica que el usuario es miembro del equipo.
  const esMiembro =
    miId != null && application?.status === "accepted" && application?.applicantId === miId;

  // --- Avatares del equipo ---
  function initials(name: string) {
    const partes = name.trim().split(/\s+/).filter(Boolean);
    return partes
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join() || "?";
  }

  function shortName(name: string) {
    const partes = name.trim().split(/\s+/);
    if (partes.length !== 2) return name;
    return `${partes[0]} ${partes[1][0].toUpperCase()}.`;
  }

  const full = isFull(project);

  return (
    <ScrollView
      testID={ProjectDetailScreen.key}
      style={styles.root}
      contentContainerStyle={styles.scroll}
    >
      {/* Cabecera: etapa + tags */}
      <View style={styles.chipRow}>
        <StageChip stage={project.stage} />
        {project.tags.map((tag) => (
          <Pill key={tag} label={tag} />
        ))}
      </View>

      {/* Titulo y programa */}
      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.program}>{project.academicProgram}</Text>

      {/* Miembros */}
      <Text style={[styles.members, full ? styles.membersFull : null]}>
        {project.currentMembers} de {project.maxMembers} miembros
        {full ? " · Equipo completo" : ""}
      </Text>

      {/* Problema */}
      {project.problem.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problema a resolver</Text>
          <Text style={styles.body}>{project.problem}</Text>
        </View>
      ) : null}

      {/* Descripcion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.body}>{project.description}</Text>
      </View>

      {/* Habilidades */}
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

      {/* Equipo actual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipo actual</Text>
        <View style={styles.avatarRow}>
          {[esLider ? (user?.name ?? "Líder del proyecto") : "Líder del proyecto"].map((name, i) => (
            <View key={i} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bodySmall}>
          {esLider ? shortName(user?.name ?? "Líder del proyecto") : "Líder del proyecto"}
        </Text>
      </View>

      {/* Pie: botones de seguir y postularse (del carril 2) */}
      <View style={styles.footer}>
        {miId != null && !esLider ? (
          <FollowButton project={project} />
        ) : null}
        <ApplicationAction project={project} />
      </View>

      {/* Encuestas activas (del carril 3) */}
      {miId != null ? <ActivePollsBlock project={project} /> : null}

      {/* Gestionar postulantes: solo el lider */}
      {esLider ? (
        <View style={styles.section}>
          <SecondaryButton
            testID="ButtonApplicants"
            label="Gestionar postulantes"
            onPress={() => navigation.navigate("Applicants", { project })}
          />
        </View>
      ) : null}

      {/* Espacio de trabajo: lider o miembro aceptado */}
      {esLider || esMiembro ? (
        <View style={styles.section}>
          <PrimaryButton
            testID="ButtonWorkspace"
            label="Espacio de trabajo"
            onPress={() => navigation.navigate("Workspace", { project })}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

ProjectDetailScreen.key = "ProjectDetailPage";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.paper },
  scroll: { padding: AppTokens.gapL, paddingBottom: AppTokens.gapXl },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS, marginBottom: AppTokens.gapM },
  title: { ...AppTypography.headlineMedium, marginBottom: AppTokens.gapXs },
  program: { ...AppTypography.bodySmall, marginBottom: AppTokens.gapM },
  members: { ...AppTypography.bodyMedium, marginBottom: AppTokens.gapL },
  membersFull: { color: AppColors.persimmon, fontFamily: "Archivo_600SemiBold" },
  section: { marginBottom: AppTokens.gapL },
  sectionTitle: { ...AppTypography.titleMedium, marginBottom: AppTokens.gapS },
  body: { ...AppTypography.bodyLarge },
  bodySmall: { ...AppTypography.bodySmall },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  avatarRow: { flexDirection: "row", gap: AppTokens.gapS, marginBottom: AppTokens.gapS },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...AppTypography.labelLarge, fontSize: 12.5 },
  footer: { flexDirection: "row", gap: AppTokens.gapM, marginBottom: AppTokens.gapM },
});
