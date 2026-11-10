import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useFollows } from "../context/FollowsContext";

// Los dos contadores de las tarjetas (Kora): los miembros del equipo y las
// personas que siguen el proyecto. Van debajo del icono del tipo.
export function ProjectCounters({ project }: { project: Project }) {
  const { followersOf } = useFollows();
  const followers = followersOf(project.id);
  return (
    <View style={styles.column}>
      <View
        style={styles.counter}
        testID={ProjectCounters.membersKeyFor(project.id)}
        accessibilityLabel={`${project.currentMembers} de ${project.maxMembers} miembros`}
      >
        <MaterialIcons name="person-outline" size={AppTokens.counterIconSize} color={AppColors.secondary} />
        <Text style={AppTypography.counter}>
          {project.currentMembers}/{project.maxMembers}
        </Text>
      </View>
      <View
        style={styles.counter}
        testID={ProjectCounters.followersKeyFor(project.id)}
        accessibilityLabel={
          followers === 1 ? "1 persona sigue este proyecto" : `${followers} personas siguen este proyecto`
        }
      >
        <MaterialIcons name="favorite-border" size={AppTokens.counterIconSize} color={AppColors.secondary} />
        <Text style={AppTypography.counter}>{followers}</Text>
      </View>
    </View>
  );
}

ProjectCounters.membersKeyFor = (projectId: string | null) => `CounterMembers-${projectId ?? ""}`;
ProjectCounters.followersKeyFor = (projectId: string | null) => `CounterFollowers-${projectId ?? ""}`;

const styles = StyleSheet.create({
  column: { alignItems: "center", gap: AppTokens.gapXs, marginTop: AppTokens.gapS },
  counter: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapXs / 2 },
});
