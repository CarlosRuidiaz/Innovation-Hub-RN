import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { innovationTypeOf } from "@/src/core/catalogs";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

type Props = {
  // La clave del tipo, tal como viene del proyecto: nula o desconocida es "Otros".
  type: string | null | undefined;
  // Con `onPress` se puede tocar (crear idea y filtros); marcada va en tinta.
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
};

// El tipo de innovacion de un proyecto en una pildora con su icono (Kora): en
// el detalle junto a la etapa, y como opcion al crear una idea y en los filtros.
export function InnovationTypeChip({ type, selected = false, onPress, testID }: Props) {
  const kind = innovationTypeOf(type);
  const color = selected ? AppColors.white : AppColors.ink;
  const body = (
    <View style={[styles.chip, selected ? styles.selected : null]}>
      <MaterialIcons name={kind.icon} size={AppTokens.counterIconSize} color={color} />
      <Text style={[styles.label, { color }]}>{kind.label}</Text>
    </View>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessibilityLabel={`Tipo de innovación: ${kind.label}`}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={kind.label}
    >
      {body}
    </Pressable>
  );
}

InnovationTypeChip.keyFor = (prefix: string, type: string) => `${prefix}-${type}`;

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: AppTokens.gapXs,
    paddingHorizontal: AppTokens.pillPaddingH,
    paddingVertical: AppTokens.gapXs,
    borderRadius: AppTokens.pillRadius,
    borderWidth: AppTokens.borderWidth,
    borderColor: AppColors.ink,
    backgroundColor: AppColors.card,
  },
  selected: { backgroundColor: AppColors.ink },
  label: AppTypography.pill,
});
