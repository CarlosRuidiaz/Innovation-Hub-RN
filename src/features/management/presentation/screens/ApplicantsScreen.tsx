import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { Application, ApplicationStatus } from "@/src/features/application/domain/entities/Application";
import { useProfile } from "@/src/features/profile/presentation/context/ProfileContext";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useManagementViewModel } from "../viewmodels/useManagementViewModel";

type RouteProps = RouteProp<RootStackParamList, "Applicants">;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 0);
  const letters = parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  return letters.length === 0 ? "?" : letters;
}

function statusLabel(status: ApplicationStatus): string {
  switch (status) {
    case "accepted":
      return "Aceptada";
    case "rejected":
      return "Rechazada";
    case "withdrawn":
      return "Cancelada";
    case "left":
      return "Salida";
    case "removed":
      return "Removido";
    default:
      return "Pendiente";
  }
}

export default function ApplicantsScreen() {
  const route = useRoute<RouteProps>();
  const initialProject = route.params?.project;
  const projectId = initialProject?.id ?? "";

  const { profile, isLoading: isProfileLoading, refresh: refreshProfile } = useProfile();
  const {
    applicants,
    project: currentProject,
    isLoading,
    pendingCount,
    getApplicants,
    decide,
    closeRecruitment,
  } = useManagementViewModel();

  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (projectId && profile?.id && initialProject?.leaderId === profile.id) {
      getApplicants(projectId);
    }
  }, [projectId, profile?.id, initialProject?.leaderId, getApplicants]);

  if (isProfileLoading && !profile) {
    return (
      <View testID={ApplicantsScreen.key} style={styles.center}>
        <ActivityIndicator color={AppColors.persimmon} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View testID={ApplicantsScreen.key} style={styles.center}>
        <Text style={styles.centerText}>No pudimos comprobar quién eres.</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="Reintentar" onPress={refreshProfile} />
        </View>
      </View>
    );
  }

  if (initialProject && initialProject.leaderId !== profile.id) {
    return (
      <View testID={ApplicantsScreen.key} style={styles.center}>
        <Text style={styles.centerText}>
          No tienes permiso para gestionar los postulantes de este proyecto: solo el líder puede hacerlo.
        </Text>
      </View>
    );
  }

  const project = currentProject ?? initialProject;

  return (
    <View testID={ApplicantsScreen.key} style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && applicants.length > 0}
            onRefresh={() => getApplicants(projectId)}
            colors={[AppColors.persimmon]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.projectTitle}>{project?.title ?? ""}</Text>
          <View style={styles.membersRow}>
            <MaterialIcons name="people-outline" size={18} color={AppColors.secondary} />
            <Text style={styles.membersText}>
              {`${project?.currentMembers ?? 0} de ${project?.maxMembers ?? 0} miembros`}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.pendingHeader}>
          {`${pendingCount} ${pendingCount === 1 ? "postulación pendiente" : "postulaciones pendientes"}`}
        </Text>

        {isLoading && applicants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator color={AppColors.persimmon} size="large" />
          </View>
        ) : applicants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Todavía no hay postulantes.</Text>
          </View>
        ) : (
          applicants.map((application) => (
            <ApplicantCard
              key={application.id ?? application.applicantId}
              application={application}
              onDecide={(decision) => application.id && decide(application.id, decision)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <SecondaryButton
          testID={ApplicantsScreen.closeRecruitmentButtonKey}
          label={project?.recruitmentOpen ? "Cerrar reclutamiento" : "Reclutamiento cerrado"}
          disabled={!project?.recruitmentOpen}
          onPress={() => setConfirmClose(true)}
        />
        <Text style={styles.bottomBarNote}>
          {project?.recruitmentOpen
            ? "El proyecto dejará de recibir postulaciones nuevas."
            : "El proyecto ya no recibe postulaciones nuevas."}
        </Text>
      </View>

      <BottomSheet
        visible={confirmClose}
        onDismiss={() => setConfirmClose(false)}
        title="¿Cerrar el reclutamiento?"
        message="El proyecto dejará de recibir postulaciones nuevas."
      >
        <PrimaryButton
          testID={ApplicantsScreen.confirmCloseRecruitmentButtonKey}
          label="Sí, cerrar reclutamiento"
          onPress={async () => {
            await closeRecruitment(projectId);
            setConfirmClose(false);
          }}
        />
        <SecondaryButton label="Volver" onPress={() => setConfirmClose(false)} />
      </BottomSheet>
    </View>
  );
}

function ApplicantCard({
  application,
  onDecide,
}: {
  application: Application;
  onDecide: (decision: ApplicationStatus) => void;
}) {
  return (
    <PaperCard margin={styles.cardMargin}>
      <View style={styles.cardContent}>
        <View style={styles.applicantRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(application.applicantName)}</Text>
          </View>

          <View style={styles.applicantInfo}>
            <Text style={styles.applicantName}>{application.applicantName}</Text>
            <Text style={styles.applicantProgram}>
              {`${application.applicantProgram} · ${application.applicantSemester}.º semestre`}
            </Text>
          </View>

          {application.status === "pending" ? (
            <View style={styles.actionsRow}>
              <Pressable
                testID={`Reject_${application.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Rechazar a ${application.applicantName}`}
                onPress={() => onDecide("rejected")}
                style={styles.squareButtonReject}
              >
                <MaterialIcons name="close" size={24} color={AppColors.ink} />
              </Pressable>

              <View style={styles.acceptButtonWrapper}>
                <View style={styles.acceptButtonShadow} />
                <Pressable
                  testID={`Accept_${application.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Aceptar a ${application.applicantName}`}
                  onPress={() => onDecide("accepted")}
                  style={styles.squareButtonAccept}
                >
                  <MaterialIcons name="check" size={24} color={AppColors.white} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pill
              label={statusLabel(application.status)}
              background={application.status === "accepted" ? AppColors.petrol : AppColors.card}
              foreground={application.status === "accepted" ? AppColors.white : undefined}
            />
          )}
        </View>

        {application.skillsOffered.length > 0 ? (
          <View style={styles.skillsRow}>
            {application.skillsOffered.map((skill) => (
              <Pill key={skill} label={skill} background={AppColors.paper} />
            ))}
          </View>
        ) : null}

        {application.message && application.message.trim().length > 0 ? (
          <View style={styles.quoteRow}>
            <View style={styles.quoteBar} />
            <Text style={styles.quoteText}>{`“${application.message.trim()}”`}</Text>
          </View>
        ) : null}
      </View>
    </PaperCard>
  );
}

ApplicantsScreen.key = "ApplicantsPage";
ApplicantsScreen.closeRecruitmentButtonKey = "ButtonCloseRecruitment";
ApplicantsScreen.confirmCloseRecruitmentButtonKey = "ButtonCloseRecruitmentConfirm";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: AppColors.paper },
  scrollContent: { paddingBottom: AppTokens.gapXl * 3 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: AppTokens.gapL,
    backgroundColor: AppColors.paper,
  },
  centerText: { ...AppTypography.bodyMedium, textAlign: "center" },
  retryButton: { marginTop: AppTokens.gapM },
  header: {
    paddingHorizontal: AppTokens.gapL,
    paddingTop: AppTokens.gapM,
    paddingBottom: AppTokens.gapS,
    gap: AppTokens.gapXs,
  },
  projectTitle: { ...AppTypography.headlineMedium, fontSize: 24 },
  membersRow: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapXs },
  membersText: { ...AppTypography.bodySmall, color: AppColors.ink },
  divider: {
    height: 1,
    backgroundColor: AppColors.ink,
    opacity: 0.15,
    marginVertical: AppTokens.gapS,
  },
  pendingHeader: {
    ...AppTypography.bodySmall,
    color: AppColors.secondary,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: AppTokens.gapL,
    paddingVertical: AppTokens.gapS,
  },
  emptyContainer: {
    padding: AppTokens.gapXl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  emptyText: { ...AppTypography.bodyMedium, color: AppColors.secondary, textAlign: "center" },
  cardMargin: {
    marginHorizontal: AppTokens.gapL,
    marginBottom: AppTokens.gapM,
  },
  cardContent: {
    gap: AppTokens.gapM,
  },
  applicantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: AppTokens.gapM,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.paper,
    borderWidth: AppTokens.borderWidth,
    borderColor: AppColors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: AppFonts.bodyBold,
    color: AppColors.ink,
    fontSize: 14,
  },
  applicantInfo: {
    flex: 1,
    gap: 2,
  },
  applicantName: {
    ...AppTypography.titleMedium,
    color: AppColors.ink,
  },
  applicantProgram: {
    ...AppTypography.bodySmall,
    color: AppColors.secondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: AppTokens.gapS,
    alignItems: "center",
  },
  squareButtonReject: {
    width: 42,
    height: 42,
    borderRadius: AppTokens.radius,
    borderWidth: AppTokens.borderWidth,
    borderColor: AppColors.ink,
    backgroundColor: AppColors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonWrapper: {
    width: 42 + AppTokens.shadowOffset,
    height: 42 + AppTokens.shadowOffset,
  },
  acceptButtonShadow: {
    position: "absolute",
    top: AppTokens.shadowOffset,
    left: AppTokens.shadowOffset,
    width: 42,
    height: 42,
    borderRadius: AppTokens.radius,
    backgroundColor: AppColors.persimmon,
  },
  squareButtonAccept: {
    width: 42,
    height: 42,
    borderRadius: AppTokens.radius,
    backgroundColor: AppColors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: AppTokens.gapS,
  },
  quoteRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: AppTokens.gapS,
    paddingTop: 2,
  },
  quoteBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: AppColors.persimmon,
  },
  quoteText: {
    flex: 1,
    fontFamily: AppFonts.body,
    fontStyle: "italic",
    fontSize: 13.5,
    lineHeight: 18,
    color: AppColors.ink,
  },
  bottomBar: {
    padding: AppTokens.gapL,
    backgroundColor: AppColors.paper,
    borderTopWidth: 1,
    borderColor: "rgba(23, 21, 15, 0.1)",
    gap: AppTokens.gapS,
  },
  bottomBarNote: {
    ...AppTypography.bodySmall,
    textAlign: "center",
    color: AppColors.secondary,
  },
});
