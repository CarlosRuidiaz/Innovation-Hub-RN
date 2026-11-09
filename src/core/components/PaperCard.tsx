import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { AppColors, AppTokens } from "@/src/theme/tokens";

// Tarjeta de papel del sistema "Cartelera": fondo crema, borde de 1.5 y sombra
// dura de 3 sin difuminado. Reemplaza a `lib/core/widgets/paper_card.dart`.
//
// La sombra no es `elevation`: en Android esa no se deja desplazar sin
// difuminarla. Es una vista del color del borde, detras de la tarjeta y corrida
// 3 puntos, que se ve igual en Android y en el navegador.
type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  // Por omision, los mismos de Flutter: 16 a la izquierda, 16 + 3 a la derecha
  // y 12 + 3 abajo, para que la sombra no se corte contra el borde.
  margin?: StyleProp<ViewStyle>;
  padding?: number;
  borderColor?: string;
  background?: string;
  testID?: string;
  accessibilityLabel?: string;
};

export function PaperCard({
  children,
  onPress,
  margin,
  padding = AppTokens.gapL,
  borderColor = AppColors.ink,
  background = AppColors.card,
  testID,
  accessibilityLabel,
}: Props) {
  const body = (
    <View style={[styles.body, { padding, borderColor, backgroundColor: background }]}>{children}</View>
  );

  return (
    <View style={[styles.margin, margin]}>
      <View>
        <View style={[styles.shadow, { backgroundColor: borderColor }]} />
        {onPress ? (
          <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}>
            {body}
          </Pressable>
        ) : (
          <View testID={testID}>{body}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  margin: {
    marginLeft: AppTokens.gapL,
    marginRight: AppTokens.gapL + AppTokens.shadowOffset,
    marginBottom: AppTokens.gapM + AppTokens.shadowOffset,
  },
  shadow: {
    position: "absolute",
    top: AppTokens.shadowOffset,
    left: AppTokens.shadowOffset,
    right: -AppTokens.shadowOffset,
    bottom: -AppTokens.shadowOffset,
    borderRadius: AppTokens.radius,
  },
  body: {
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
  },
});
