import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { SecondaryButton } from "./Buttons";

// El mismo vacio en todas las listas: icono de 48 en gris, titulo, frase y, si
// aplica, una salida con el boton secundario. Es el `_emptyState` que repetian
// la cartelera, Mis proyectos, las notificaciones y la vitrina en Flutter.
type Props = {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export function EmptyState({ icon, title, message, actionLabel, onAction, testID }: Props) {
  return (
    <View testID={testID} style={styles.container}>
      <MaterialIcons name={icon} size={AppTokens.emptyIconSize} color={AppColors.secondary} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <SecondaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: AppTokens.gapXl },
  title: { ...AppTypography.titleMedium, textAlign: "center", marginTop: AppTokens.gapM },
  message: { ...AppTypography.bodyMedium, textAlign: "center", marginTop: AppTokens.gapS },
  action: { marginTop: AppTokens.gapL },
});
