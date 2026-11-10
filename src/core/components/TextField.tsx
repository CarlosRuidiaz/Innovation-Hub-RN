import React from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInputProps, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";

// El campo de texto de la app: el `TextFormField` con el `inputDecorationTheme`
// de `app_theme.dart`. Fondo de tarjeta, borde de tinta de 1.5 y esquinas de 4;
// con el foco, el borde pasa a persimmon de 2. El error va debajo, como el
// `validator` de Flutter, y con `maxLength` se ve el contador.
type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  // El mensaje del `validator`, o nada si el campo esta bien.
  error?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  onSubmitEditing?: () => void;
  testID?: string;
};

export function TextField({ label, error, maxLength, value, multiline, numberOfLines, ...rest }: Props) {
  return (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        error={!!error}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textColor={AppColors.ink}
        placeholderTextColor={AppColors.secondary}
        outlineColor={AppColors.ink}
        activeOutlineColor={AppColors.persimmon}
        outlineStyle={styles.outline}
        style={[styles.input, multiline ? styles.multiline : null]}
        contentStyle={styles.content}
        {...rest}
      />
      {error ? (
        <HelperText type="error" visible style={styles.error}>
          {error}
        </HelperText>
      ) : null}
      {maxLength != null ? (
        <Text style={styles.counter}>
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: AppColors.card, fontFamily: AppFonts.body },
  multiline: { minHeight: AppTokens.gapXl * 4 },
  content: { paddingHorizontal: AppTokens.fieldPadding, fontFamily: AppFonts.body },
  outline: { borderRadius: AppTokens.radius, borderWidth: AppTokens.borderWidth },
  error: { ...AppTypography.bodySmall, color: AppColors.persimmon, paddingHorizontal: 0 },
  counter: { ...AppTypography.bodySmall, textAlign: "right", marginTop: AppTokens.gapXs },
});
