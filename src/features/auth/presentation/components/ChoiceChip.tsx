import React from "react";
import { Pressable } from "react-native";

import { Pill } from "@/src/core/components/Pill";
import { AppColors } from "@/src/theme/tokens";

// Una pildora que se marca al tocarla: el `_chip` de `complete_profile_page.dart`.
// Marcada toma el color que le pasan; si no, papel de tarjeta.
export function ChoiceChip({
  label,
  selected,
  selectedColor,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  selectedColor: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label} onPress={onPress}>
      <Pill label={label} background={selected ? selectedColor : AppColors.card} />
    </Pressable>
  );
}
