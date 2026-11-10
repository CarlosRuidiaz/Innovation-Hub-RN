import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useProjects } from "../context/ProjectsContext";

// Las cifras de la comunidad en Explorar (Kora, 05KA): tres numeros con su
// etiqueta, separados por lineas. Cada uno es un filtro rapido. Salen de la
// lista ya cargada: no piden nada a Roble.
export function CommunityStats() {
  const { stats, clearFilters, showOnlyIdeas, showRecruiting } = useProjects();
  return (
    <PaperCard testID={CommunityStats.key} padding={0} margin={styles.margin}>
      <View style={styles.row}>
        <Stat
          testID={CommunityStats.projectsKey}
          value={stats.projects}
          label="Proyectos"
          hint={`${stats.projects} ${stats.projects === 1 ? "proyecto" : "proyectos"}. Toca para ver todos, sin filtros`}
          onPress={clearFilters}
        />
        <View style={styles.divider} />
        <Stat
          testID={CommunityStats.ideasKey}
          value={stats.ideas}
          label="Ideas"
          hint={`${stats.ideas} ${stats.ideas === 1 ? "idea" : "ideas"}. Toca para ver solo las ideas`}
          onPress={showOnlyIdeas}
        />
        <View style={styles.divider} />
        <Stat
          testID={CommunityStats.recruitingKey}
          value={stats.recruiting}
          label={"Buscan\nequipo"}
          hint={`${stats.recruiting} ${stats.recruiting === 1 ? "proyecto busca" : "proyectos buscan"} equipo. Toca para ver solo esos`}
          onPress={showRecruiting}
        />
      </View>
    </PaperCard>
  );
}

CommunityStats.key = "CommunityStats";
CommunityStats.projectsKey = "StatProyectos";
CommunityStats.ideasKey = "StatIdeas";
CommunityStats.recruitingKey = "StatBuscanEquipo";

function Stat({ value, label, hint, onPress, testID }: { value: number; label: string; hint: string; onPress: () => void; testID: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={hint} onPress={onPress} style={styles.stat}>
      <Text style={AppTypography.statNumber}>{value}</Text>
      <Text style={AppTypography.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  margin: { marginBottom: AppTokens.gapM + AppTokens.shadowOffset },
  row: { flexDirection: "row", alignItems: "stretch" },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: AppTokens.gapS,
    paddingVertical: AppTokens.gapS,
  },
  divider: { width: AppTokens.statDividerWidth, backgroundColor: AppColors.ink, marginVertical: AppTokens.gapS },
});
