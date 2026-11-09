import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { AppColors, AppTokens } from "@/src/theme/tokens";

// La flecha de volver de la barra de arriba: el `Icons.arrow_back` que pone el
// `AppBar` de Flutter. Es la misma en Android y en el navegador, y la usa la
// navegacion en todas las rutas de la pila.
export function BackButton({ onPress, testID = BackButton.key }: { onPress?: () => void; testID?: string }) {
  const navigation = useNavigation();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      hitSlop={AppTokens.gapS}
      onPress={onPress ?? (() => navigation.goBack())}
      style={styles.button}
    >
      <MaterialIcons name="arrow-back" size={24} color={AppColors.ink} />
    </Pressable>
  );
}

BackButton.key = "BackButton";

const styles = StyleSheet.create({
  button: { paddingRight: AppTokens.gapL },
});
