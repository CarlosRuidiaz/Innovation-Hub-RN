import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";

// El banner que lleva a la vitrina de prototipos. Reemplaza a
// `showcase_banner.dart`: la tarjeta de papel en petrol, con su borde y su
// sombra dura. Cuenta los proyectos en etapa Prototipo, que son los de la vitrina.
export function ShowcaseBanner() {
  const navigation = useNavigation();
  const { projects } = useProjects();
  const count = projects.filter((p) => p.stage === "prototype").length;
  const label = count === 1 ? "1 proyecto espera tu retroalimentación" : `${count} proyectos esperan tu retroalimentación`;

  return (
    <PaperCard
      testID={ShowcaseBanner.key}
      background={AppColors.petrol}
      margin={styles.margin}
      accessibilityLabel="Ir a la vitrina de prototipos"
      onPress={() => navigation.navigate("Showcase")}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title}>Prototipos abiertos a comentarios</Text>
          <Text style={styles.subtitle}>{label}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={AppTokens.iconSize} color={AppColors.white} />
      </View>
    </PaperCard>
  );
}

ShowcaseBanner.key = "ShowcaseBanner";

const styles = StyleSheet.create({
  margin: {
    marginLeft: AppTokens.gapL,
    marginRight: AppTokens.gapL + AppTokens.shadowOffset,
    marginTop: AppTokens.gapS,
    marginBottom: AppTokens.gapM + AppTokens.shadowOffset,
  },
  row: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapS },
  content: { flex: 1 },
  title: { ...AppTypography.titleMedium, color: AppColors.white, fontFamily: AppFonts.displayBold },
  // El blanco al 80 % de Flutter, sin escribir un color nuevo.
  subtitle: { ...AppTypography.bodySmall, color: AppColors.white, opacity: 0.8, marginTop: AppTokens.gapXs },
});
