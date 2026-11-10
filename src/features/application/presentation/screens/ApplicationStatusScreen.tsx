import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { StageChip } from "@/src/core/components/StageChip";
import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { Application, canWithdraw } from "../../domain/entities/Application";
import { ApplicationRepository } from "../../domain/repositories/ApplicationRepository";
import { WithdrawSheet } from "../components/WithdrawSheet";

type StatusRouteProp = RouteProp<RootStackParamList, "ApplicationStatus">;

export default function ApplicationStatusScreen() {
  const route = useRoute<StatusRouteProp>();
  const navigation = useNavigation();
  const initialApp = route.params?.application;

  const projectRepo = useInject<ProjectRepository>(TOKENS.ProjectRepo);
  const applicationRepo = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);

  const [application, setApplication] = useState<Application | null>(initialApp ?? null);
  const [project, setProject] = useState<Project | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  useEffect(() => {
    if (initialApp?.projectId) {
      projectRepo.getProjects().then((list) => {
        const found = list.find((p) => p.id === initialApp.projectId);
        if (found) setProject(found);
      });
    }
  }, [initialApp?.projectId, projectRepo]);

  if (!application) {
    return (
      <View testID={ApplicationStatusScreen.key} style={styles.center}>
        <Text style={styles.errorText}>
          route.params llegó vacío: se esperaba una Application.
        </Text>
      </View>
    );
  }

  const isAccepted = application.status === "accepted";
  const isWithdrawn = application.status === "withdrawn";
  const isLeft = application.status === "left";
  const isRemoved = application.status === "removed";
  const isPending = application.status === "pending";

  let iconName: React.ComponentProps<typeof MaterialIcons>["name"];
  let iconColor: string;
  let title: string;
  let subtitle: string;
  let statusPill: React.ReactNode;

  if (isAccepted) {
    iconName = "check-circle-outline";
    iconColor = AppColors.petrol;
    title = "Ya eres parte del equipo";
    subtitle =
      "¡Felicitaciones! Has sido aceptado en el proyecto. Puedes comunicarte con el equipo y comenzar a colaborar.";
    statusPill = <Pill label="Aceptada" background={AppColors.petrol} foreground={AppColors.white} />;
  } else if (isWithdrawn) {
    iconName = "cancel";
    iconColor = AppColors.secondary;
    title = "Postulación cancelada";
    subtitle = "Has cancelado tu postulación a este proyecto.";
    statusPill = <Pill label="Cancelada" background={AppColors.card} />;
  } else if (isLeft) {
    iconName = "logout";
    iconColor = AppColors.secondary;
    title = "Saliste del proyecto";
    subtitle =
      "Dejaste el equipo de este proyecto. Puedes volver a postularte mientras el reclutamiento siga abierto.";
    statusPill = <Pill label="Salida" background={AppColors.card} />;
  } else if (isRemoved) {
    iconName = "person-remove";
    iconColor = AppColors.persimmon;
    title = "Te removieron del proyecto";
    subtitle =
      "El líder del proyecto te sacó del equipo. No puedes volver a postularte a este proyecto.";
    statusPill = <Pill label="Removido" background={AppColors.card} />;
  } else if (isPending) {
    iconName = "schedule";
    iconColor = AppColors.persimmon;
    title = "Tu postulación está en revisión";
    subtitle =
      "El líder del proyecto está evaluando tu perfil y tus habilidades. Te avisaremos cuando haya una respuesta.";
    statusPill = <Pill label="Pendiente" background={AppColors.gold} foreground={AppColors.ink} />;
  } else {
    iconName = "highlight-off";
    iconColor = AppColors.secondary;
    title = "Postulación no seleccionada";
    subtitle = "El líder del proyecto ha completado el equipo con otros perfiles.";
    statusPill = <Pill label="Rechazada" background={AppColors.card} />;
  }

  const handleWithdraw = async () => {
    if (!application.id) return;
    await applicationRepo.withdraw(application.id);
    setApplication({ ...application, status: "withdrawn" });
  };

  return (
    <ScrollView
      testID={ApplicationStatusScreen.key}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name={iconName} size={64} color={iconColor} />
      </View>

      <View style={styles.pillContainer}>{statusPill}</View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.projectCardWrapper}>
        <PaperCard>
          {project ? (
            <View style={styles.projectCardContent}>
              <View style={styles.projectTopRow}>
                <StageChip stage={project.stage} />
                <Text style={styles.programText} numberOfLines={1}>
                  {project.academicProgram}
                </Text>
              </View>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectMembers}>
                {`${project.currentMembers} de ${project.maxMembers} miembros`}
              </Text>
            </View>
          ) : (
            <View style={styles.projectCardContent}>
              <Text style={styles.projectSubtitle}>Proyecto</Text>
              <Text style={styles.projectTitle}>
                {`Identificador: ${application.projectId}`}
              </Text>
            </View>
          )}
        </PaperCard>
      </View>

      {isPending && canWithdraw(application) ? (
        <View style={styles.footerButtons}>
          <SecondaryButton
            testID={ApplicationStatusScreen.withdrawButtonKey}
            label="Cancelar postulación"
            onPress={() => setConfirmWithdraw(true)}
          />
          <Text style={styles.footerNote}>
            Puedes volver a postularte mientras el reclutamiento siga abierto.
          </Text>
        </View>
      ) : null}

      {isAccepted ? (
        <View style={styles.footerButtons}>
          <PrimaryButton
            label="Ir al espacio del proyecto"
            onPress={() => {
              if (project) {
                navigation.navigate("Workspace", { project });
              }
            }}
          />
          <SecondaryButton
            label="Salir del proyecto"
            onPress={() => { }}
          />
        </View>
      ) : null}

      {isWithdrawn || isLeft ? (
        <Text style={styles.footerNote}>
          Puedes volver a postularte mientras el reclutamiento siga abierto.
        </Text>
      ) : null}

      <WithdrawSheet
        visible={confirmWithdraw}
        onDismiss={() => setConfirmWithdraw(false)}
        onConfirm={handleWithdraw}
      />
    </ScrollView>
  );
}

ApplicationStatusScreen.key = "ApplicationStatusPage";
ApplicationStatusScreen.withdrawButtonKey = "ButtonWithdraw";

const styles = StyleSheet.create({
  scroll: {
    padding: AppTokens.gapL,
    gap: AppTokens.gapM,
    alignItems: "stretch",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: AppTokens.gapL,
  },
  errorText: {
    ...AppTypography.bodyMedium,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: AppTokens.gapL,
  },
  pillContainer: {
    alignItems: "center",
  },
  title: {
    ...AppTypography.headlineMedium,
    textAlign: "center",
  },
  subtitle: {
    ...AppTypography.bodyLarge,
    textAlign: "center",
    marginBottom: AppTokens.gapL,
  },
  projectCardWrapper: {
    marginBottom: AppTokens.gapL,
  },
  projectCardContent: {
    gap: AppTokens.gapS,
  },
  projectTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTokens.gapS,
  },
  programText: {
    ...AppTypography.bodySmall,
    flex: 1,
  },
  projectTitle: {
    ...AppTypography.titleMedium,
  },
  projectSubtitle: {
    ...AppTypography.bodySmall,
  },
  projectMembers: {
    ...AppTypography.bodySmall,
  },
  footerButtons: {
    gap: AppTokens.gapM,
  },
  footerNote: {
    ...AppTypography.bodySmall,
    textAlign: "center",
    marginTop: AppTokens.gapS,
  },
});
