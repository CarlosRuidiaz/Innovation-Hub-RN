import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// La frase de la comunidad (Kora, 04KA): arriba de "Para tus habilidades", un
// bloque persimmon con borde y sombra dura. Va como encabezado de la lista, asi
// que se va con ella al deslizar.
export function CommunityBanner() {
  return (
    <PaperCard testID={CommunityBanner.key} background={AppColors.persimmon} padding={AppTokens.gapM} margin={styles.margin}>
      <View style={styles.body}>
        <Text style={AppTypography.communityKicker}>COMUNIDAD DE INNOVACIÓN</Text>
        <Text style={AppTypography.communityPhrase} numberOfLines={1} adjustsFontSizeToFit>
          Conectamos ideas, personas y soluciones
        </Text>
      </View>
    </PaperCard>
  );
}

CommunityBanner.key = "CommunityBanner";

const styles = StyleSheet.create({
  margin: { marginBottom: AppTokens.gapXs + AppTokens.shadowOffset },
  body: { minHeight: AppTokens.communityBannerHeight - 2 * AppTokens.gapM, justifyContent: "center", gap: AppTokens.gapXs },
});
