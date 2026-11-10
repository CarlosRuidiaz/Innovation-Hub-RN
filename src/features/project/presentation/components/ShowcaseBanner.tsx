import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// El banner que lleva a la vitrina de prototipos. Reemplaza a
// `showcase_banner.dart`: fondo petrol, borde de tinta y sombra dura de 3.
export function ShowcaseBanner() {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow} />
      <TouchableOpacity
        testID="ShowcaseBanner"
        style={styles.banner}
        onPress={() => navigation.navigate("Showcase" as never)}
        accessibilityRole="button"
        accessibilityLabel="Ir a la vitrina de prototipos"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Prototipos abiertos a comentarios</Text>
          <Text style={styles.subtitle}>Proyectos esperan tu retroalimentación</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={22} color={AppColors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: AppTokens.gapL,
    marginTop: AppTokens.gapS,
    marginBottom: AppTokens.gapM + AppTokens.shadowOffset,
  },
  shadow: {
    position: "absolute",
    top: AppTokens.shadowOffset,
    left: AppTokens.shadowOffset,
    right: -AppTokens.shadowOffset,
    bottom: -AppTokens.shadowOffset,
    backgroundColor: AppColors.ink,
    borderRadius: AppTokens.radius,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.petrol,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    paddingHorizontal: AppTokens.gapL,
    paddingVertical: AppTokens.gapM + 2,
  },
  content: { flex: 1 },
  title: {
    ...AppTypography.titleMedium,
    color: AppColors.white,
    fontFamily: "Archivo_700Bold",
  },
  subtitle: {
    ...AppTypography.bodySmall,
    color: "rgba(255,255,255,0.8)",
    marginTop: AppTokens.gapXs,
  },
});
