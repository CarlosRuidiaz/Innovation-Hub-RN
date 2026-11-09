import React from "react";
import { StyleSheet, Text } from "react-native";

import { AppTokens, AppTypography } from "@/src/theme/tokens";
import { useProfile } from "../context/ProfileContext";

// La linea "Proyectos que buscan: …" con las habilidades del perfil, arriba de
// la pestaña "Para tus habilidades" de la cartelera (`profile_skills_line.dart`).
// Sin perfil, o sin habilidades, no se ve.
export function ProfileSkillsLine() {
  const { profile } = useProfile();
  if (!profile || profile.skills.length === 0) return null;
  return (
    <Text testID={ProfileSkillsLine.key} style={styles.line}>
      Proyectos que buscan: {profile.skills.join(" · ")}
    </Text>
  );
}

ProfileSkillsLine.key = "ProfileSkillsLine";

const styles = StyleSheet.create({
  line: {
    ...AppTypography.bodySmall,
    fontSize: AppTypography.bodyMedium.fontSize,
    paddingTop: AppTokens.gapM,
    paddingBottom: AppTokens.gapS,
    paddingHorizontal: AppTokens.gapL,
  },
});
