import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// Los dos botones de la app, traducidos de `elevatedButtonTheme` y
// `outlinedButtonTheme` de `app_theme.dart`:
// - el principal es persimmon con texto blanco y borde de tinta;
// - el secundario es papel de tarjeta con texto y borde de tinta.
// Los dos con esquinas de 4, borde de 1.5 y sin sombra.

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type Props = {
  label: string;
  onPress?: () => void;
  // Sin `onPress`, o con `disabled`, el boton se ve apagado y no responde,
  // como un `onPressed: null` de Flutter.
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton(props: Props) {
  return <AppButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Props) {
  return <AppButton {...props} variant="secondary" />;
}

function AppButton({ label, onPress, disabled, loading, icon, testID, style, variant }: Props & { variant: "primary" | "secondary" }) {
  const off = disabled || loading || !onPress;
  const primary = variant === "primary";
  const background = off && primary ? AppColors.disabledBackground : primary ? AppColors.persimmon : AppColors.card;
  const color = off ? AppColors.disabledText : primary ? AppColors.white : AppColors.ink;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      onPress={onPress}
      style={[styles.button, { backgroundColor: background }, style]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={color} /> : null}
        {!loading && icon ? <MaterialIcons name={icon} size={AppTokens.buttonIconSize} color={color} /> : null}
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: AppTokens.borderWidth,
    borderColor: AppColors.ink,
    borderRadius: AppTokens.radius,
    paddingHorizontal: AppTokens.buttonPaddingH,
    paddingVertical: AppTokens.buttonPaddingV,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: AppTokens.gapS,
  },
  label: { ...AppTypography.button, textAlign: "center" },
});
