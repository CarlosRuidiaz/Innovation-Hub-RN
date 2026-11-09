import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// Lo que se ve cuando la app arranca sin `.env`. Sin configuracion no se puede
// crear el cliente de Roble, y todo lo demas depende de el.
export function MissingConfigScreen({ missing }: { missing: string[] }) {
  return (
    <View style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
          <MaterialIcons name="settings" size={AppTokens.emptyIconSize} color={AppColors.ink} />
          <Text style={styles.title}>Falta la configuración</Text>
          <Text style={styles.body}>
            La app no sabe a qué servidor de Roble conectarse. Estos valores salen del archivo .env y no llegaron:
          </Text>
          {missing.map((name) => (
            <Text key={name} style={[styles.body, styles.mono]}>
              •  {name}
            </Text>
          ))}
          <Text style={styles.body}>Para arreglarlo:</Text>
          <Text style={styles.body}>1. Copia .env.example como .env.</Text>
          <Text style={styles.body}>2. Reinicia con:</Text>
          <Text selectable style={[styles.body, styles.mono]}>
            npx expo start --clear
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: AppColors.paper },
  container: { padding: AppTokens.gapXl, gap: AppTokens.gapM },
  title: { ...AppTypography.headlineMedium },
  body: { ...AppTypography.bodyLarge },
  mono: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }) },
});
