import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// La hoja que sube desde abajo, como el `showModalBottomSheet` de Flutter:
// fondo de tarjeta, borde de tinta y esquinas de arriba redondeadas. La usan
// las confirmaciones (cerrar sesion, retirar una postulacion, salir del
// proyecto, remover a un miembro) y las hojas con formulario (feedback, hitos,
// tareas). Tocar fuera la cierra sin elegir nada.
//
// Una confirmacion se arma asi, como en Flutter:
//   <BottomSheet visible title="¿Cerrar sesión?" message="..." onDismiss={...}>
//     <PrimaryButton label="Sí, cerrar sesión" onPress={...} />
//     <SecondaryButton label="Volver" onPress={...} />
//   </BottomSheet>
type Props = {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  testID?: string;
};

export function BottomSheet({ visible, onDismiss, title, message, children, testID }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onDismiss} accessibilityLabel="Cerrar" />
        <View testID={testID} style={[styles.sheet, { paddingBottom: AppTokens.gapXl + insets.bottom }]}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: AppColors.backdrop },
  sheet: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderBottomWidth: 0,
    borderTopLeftRadius: AppTokens.sheetRadius,
    borderTopRightRadius: AppTokens.sheetRadius,
    paddingHorizontal: AppTokens.gapL,
    paddingTop: AppTokens.gapXl,
    maxHeight: "90%",
  },
  content: { gap: AppTokens.gapS },
  title: { ...AppTypography.titleLarge, textAlign: "center", marginBottom: AppTokens.gapXs },
  message: { ...AppTypography.bodyMedium, textAlign: "center", marginBottom: AppTokens.gapL },
});
