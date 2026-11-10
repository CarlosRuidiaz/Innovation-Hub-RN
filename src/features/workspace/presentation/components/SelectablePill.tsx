import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { Pill } from "@/src/core/components/Pill";
import { AppColors, AppTokens } from "@/src/theme/tokens";

// Una pildora que se toca: el `InkWell` con un `Pill` dentro que usan en
// Flutter el selector de etapa, el responsable de una tarea y el hito de un
// avance. Elegida se pinta con `selectedColor`; si no, papel de tarjeta.
export function SelectablePill({
  label,
  selected,
  selectedColor = AppColors.persimmon,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  selectedColor?: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.touch}
    >
      <Pill label={label} background={selected ? selectedColor : AppColors.card} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touch: { borderRadius: AppTokens.pillRadius },
});
