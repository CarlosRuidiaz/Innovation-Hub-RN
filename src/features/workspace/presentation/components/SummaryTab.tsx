import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { SecondaryButton } from "@/src/core/components/Buttons";
import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { WorkspacePollsBlock } from "@/src/features/poll/presentation/components/WorkspacePollsBlock";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { roleOf, TeamMember } from "../viewmodels/TeamMember";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";
import { LeaveProjectSheet } from "./LeaveProjectSheet";
import { MemberAvatar } from "./MemberAvatar";
import { useRefreshControl } from "./refreshControl";
import { RemoveMemberSheet } from "./RemoveMemberSheet";
import { StageSelector } from "./StageSelector";

const AVATAR_COLORS = [AppColors.petrol, AppColors.persimmon, AppColors.gold];

// Pestaña "Resumen": `summary_tab.dart`. Estado actual, equipo, tarjeta de
// reclutamiento, salir del proyecto y las encuestas.
export function SummaryTab() {
  const vm = useWorkspace();
  const refreshControl = useRefreshControl(vm.reload);
  const [leaving, setLeaving] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const project = vm.project;
  if (project == null) return null;

  const spotsLeft = project.maxMembers - project.currentMembers;

  return (
    <>
      <ScrollView testID={SummaryTab.key} contentContainerStyle={styles.list} refreshControl={refreshControl}>
        <Text style={AppTypography.titleMedium}>Estado actual</Text>
        <View style={styles.gapS} />
        <StageSelector stage={project.stage} />
        <View style={styles.gapXl} />
        <Text style={AppTypography.titleMedium}>Miembros del equipo</Text>
        <View style={styles.gapM} />
        {vm.members.map((member, i) => (
          <View key={`${member.id}-${i}`} style={styles.memberRow}>
            <MemberAvatar name={member.name} background={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
            <View style={styles.memberText}>
              <Text style={AppTypography.titleMedium}>{member.name}</Text>
              <Text style={AppTypography.bodySmall}>
                {member.academicProgram.length === 0 ? roleOf(member) : `${member.academicProgram} · ${roleOf(member)}`}
              </Text>
            </View>
            {vm.isLeader && !member.isLeader ? (
              <Button
                testID={SummaryTab.removeKey(member.id)}
                mode="text"
                textColor={AppColors.persimmon}
                onPress={() => setRemoving(member)}
              >
                Remover
              </Button>
            ) : null}
          </View>
        ))}
        <View style={styles.gapS} />
        <PaperCard margin={styles.cardMargin}>
          <View style={styles.cardHeader}>
            <Text style={AppTypography.titleMedium}>Reclutamiento</Text>
            <Pill
              label={project.recruitmentOpen ? "Abierto" : "Cerrado"}
              background={project.recruitmentOpen ? AppColors.petrol : AppColors.card}
              foreground={project.recruitmentOpen ? AppColors.white : undefined}
            />
          </View>
          <View style={styles.gapS} />
          <Text style={AppTypography.bodyMedium}>
            {spotsLeft > 0
              ? `Quedan ${spotsLeft} ${spotsLeft === 1 ? "cupo" : "cupos"} de ${project.maxMembers}.`
              : "Sin cupos disponibles."}
          </Text>
        </PaperCard>
        {vm.canLeave ? (
          <>
            <View style={styles.gapXl} />
            <SecondaryButton
              testID={SummaryTab.leaveKey}
              label="Salir del proyecto"
              color={AppColors.persimmon}
              onPress={() => setLeaving(true)}
            />
          </>
        ) : null}
        <View style={styles.gapXl} />
        <WorkspacePollsBlock project={project} />
      </ScrollView>
      <LeaveProjectSheet visible={leaving} onDismiss={() => setLeaving(false)} />
      <RemoveMemberSheet member={removing} onDismiss={() => setRemoving(null)} />
    </>
  );
}

SummaryTab.key = "workspace.summary";
SummaryTab.leaveKey = "workspace.summary.leave";
SummaryTab.removeKey = (memberId: string) => `workspace.summary.remove.${memberId}`;

const styles = StyleSheet.create({
  list: { padding: AppTokens.gapL },
  gapS: { height: AppTokens.gapS },
  gapM: { height: AppTokens.gapM },
  gapXl: { height: AppTokens.gapXl },
  memberRow: { flexDirection: "row", alignItems: "center", marginBottom: AppTokens.gapM },
  memberText: { flex: 1, marginLeft: AppTokens.gapM },
  // La tarjeta va dentro de la lista, que ya tiene su margen: solo se deja
  // sitio para la sombra.
  cardMargin: { marginLeft: 0, marginRight: AppTokens.shadowOffset, marginBottom: AppTokens.shadowOffset },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
