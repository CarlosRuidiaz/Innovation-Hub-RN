import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { BackButton } from "./BackButton";

// Lo que muestra una ruta mientras su carril no migra la pantalla: el nombre
// de la pantalla y la vista de Flutter que reemplaza. Cada ruta ya importa su
// pantalla desde la carpeta de su funcionalidad, asi que reemplazarla no toca
// la navegacion.
//
// `testID` es la clave de la pantalla: la misma `Key` de la pagina en Flutter,
// declarada junto a la pantalla, para que las pruebas que ya la buscan sigan
// valiendo cuando el carril la reemplace.
//
// `withBack` es para las rutas sin barra de arriba (en Flutter pintan su propia
// cabecera): asi se puede volver.
type Props = {
  name: string;
  replaces: string;
  withBack?: boolean;
  testID?: string;
  children?: React.ReactNode;
};

export function PendingScreen({ name, replaces, withBack = false, testID, children }: Props) {
  return (
    <SafeAreaView edges={withBack ? ["top"] : []} style={styles.screen} testID={testID ?? PendingScreen.keyFor(name)}>
      {withBack ? (
        <View style={styles.back}>
          <BackButton />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.container}>
        <MaterialIcons name="construction" size={AppTokens.emptyIconSize} color={AppColors.secondary} />
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.message}>Pantalla provisional. Reemplaza a {replaces}.</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

PendingScreen.keyFor = (name: string) => `PendingScreen-${name}`;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.paper },
  back: { paddingHorizontal: AppTokens.gapL, paddingTop: AppTokens.gapL },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: AppTokens.gapXl, gap: AppTokens.gapM },
  title: { ...AppTypography.titleMedium, textAlign: "center" },
  message: { ...AppTypography.bodyMedium, color: AppColors.secondary, textAlign: "center" },
});
