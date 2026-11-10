import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";

type PublishedRoute = RouteProp<RootStackParamList, "IdeaPublished">;

// Pantalla 11: confirmacion de que la idea fue publicada.
// Reemplaza a `idea_published_page.dart`.
export default function IdeaPublishedScreen() {
  const route = useRoute<PublishedRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const project: Project = route.params.project;

  return (
    <ScrollView
      testID={IdeaPublishedScreen.key}
      contentContainerStyle={styles.scroll}
    >
      {/* Icono de exito */}
      <View style={styles.iconWrapper}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>

      <Text style={styles.headline}>Tu idea ya está en la cartelera</Text>

      <View style={styles.gapXl} />

      {/* Resumen de la idea */}
      <PaperCard>
        <Text style={styles.projectTitle}>{project.title}</Text>
        <View style={styles.gapM} />
        {project.skillsWanted.length > 0 ? (
          <View style={styles.pills}>
            {project.skillsWanted.map((s) => (
              <Pill key={s} label={s} />
            ))}
          </View>
        ) : null}
        <View style={styles.gapM} />
        <Text style={styles.meta}>
          Máximo {project.maxMembers} miembros · {project.academicProgram}
        </Text>
      </PaperCard>

      <View style={styles.gapXl} />
      <View style={styles.gapXl} />

      {/* Ver el detalle */}
      <PrimaryButton
        label="Ver mi idea publicada"
        onPress={() => navigation.navigate("ProjectDetail", { project })}
      />

      <View style={styles.gapM} />

      {/* Volver a la cartelera */}
      <SecondaryButton
        testID="ButtonIdeaPublishedHome"
        label="Ver proyectos publicados"
        onPress={() => navigation.popToTop()}
      />
    </ScrollView>
  );
}

IdeaPublishedScreen.key = "IdeaPublishedPage";

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: AppColors.paper,
    padding: AppTokens.gapXl,
    alignItems: "stretch",
  },
  iconWrapper: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.petrol,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: AppTokens.gapL,
  },
  checkIcon: { color: AppColors.white, fontSize: 40, lineHeight: 44 },
  headline: {
    ...AppTypography.headlineMedium,
    textAlign: "center",
    fontFamily: "Fraunces_700Bold",
  },
  projectTitle: { ...AppTypography.titleLarge, fontFamily: "Fraunces_700Bold" },
  meta: { ...AppTypography.bodyMedium, color: AppColors.secondary },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapXs },
  gapXl: { height: AppTokens.gapXl },
  gapM: { height: AppTokens.gapM },
});
