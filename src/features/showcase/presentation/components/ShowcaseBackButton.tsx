import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";

import { BackButton } from "@/src/core/components/BackButton";
import { PaperCard } from "@/src/core/components/PaperCard";
import { AppColors, AppTokens } from "@/src/theme/tokens";

// El boton de volver de la vitrina y del detalle del prototipo: un cuadro de
// papel con sombra dura y el chevron, no la flecha de la barra de arriba. Lleva
// la misma clave que la flecha comun, para que las pruebas vuelvan igual.
export function ShowcaseBackButton() {
  const navigation = useNavigation();
  return (
    <View style={styles.wrap}>
      <PaperCard
        onPress={() => navigation.goBack()}
        padding={AppTokens.gapS}
        margin={styles.noMargin}
        testID={BackButton.key}
        accessibilityLabel="Volver"
      >
        <MaterialIcons name="chevron-left" size={AppTokens.iconSize} color={AppColors.ink} />
      </PaperCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "flex-start" },
  noMargin: { marginLeft: 0, marginRight: AppTokens.shadowOffset, marginBottom: AppTokens.shadowOffset },
});
