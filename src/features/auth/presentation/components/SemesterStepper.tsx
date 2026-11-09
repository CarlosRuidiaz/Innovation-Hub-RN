import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

export const MIN_SEMESTER = 1;
export const MAX_SEMESTER = 12;

// El selector de semestre del paso 2: un recuadro de tarjeta con "-", el
// numero y "+", de 1 a 12.
export function SemesterStepper({
  value,
  onChange,
  testID,
}: {
  value: number;
  onChange: (value: number) => void;
  testID?: string;
}) {
  const canLower = value > MIN_SEMESTER;
  const canRaise = value < MAX_SEMESTER;
  return (
    <View testID={testID} style={styles.box}>
      <Pressable
        testID={`${testID}-remove`}
        accessibilityRole="button"
        accessibilityLabel="Bajar semestre"
        accessibilityState={{ disabled: !canLower }}
        disabled={!canLower}
        onPress={() => onChange(value - 1)}
        style={styles.button}
      >
        <MaterialIcons name="remove" size={AppTokens.iconSize} color={canLower ? AppColors.ink : AppColors.disabledText} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        testID={`${testID}-add`}
        accessibilityRole="button"
        accessibilityLabel="Subir semestre"
        accessibilityState={{ disabled: !canRaise }}
        disabled={!canRaise}
        onPress={() => onChange(value + 1)}
        style={styles.button}
      >
        <MaterialIcons name="add" size={AppTokens.iconSize} color={canRaise ? AppColors.ink : AppColors.disabledText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
  },
  button: { padding: AppTokens.gapS },
  value: { ...AppTypography.titleMedium },
});
