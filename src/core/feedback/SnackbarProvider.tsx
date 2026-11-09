import React, { createContext, useCallback, useContext, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Snackbar } from "react-native-paper";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// `title` es el primer argumento de `Get.snackbar` en Flutter: "Entrar",
// "Crear cuenta", "Publicar idea"... Sin el, el aviso es solo el mensaje.
type Show = (text: string, options?: { title?: string }) => void;

const SnackbarContext = createContext<Show | null>(null);

// La barra de avisos de abajo, una para toda la app. Los view models no pintan
// nada: llaman a `useSnackbar()` y la barra lo muestra.
//
// Se ve como los `Get.snackbar` de Flutter: abajo, fondo de tarjeta y texto de
// tinta, con el titulo arriba en negrita. Los errores se ven igual que el resto,
// como alla.
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<{ text: string; title?: string; key: number } | null>(null);

  const show = useCallback<Show>((text, options) => {
    setCurrent({ text, title: options?.title, key: Date.now() });
  }, []);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      <Snackbar
        key={current?.key}
        visible={current != null}
        onDismiss={() => setCurrent(null)}
        duration={3500}
        style={styles.bar}
      >
        {current?.title ? <Text style={styles.title}>{current.title}</Text> : null}
        <Text style={styles.text}>{current?.text ?? ""}</Text>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): Show {
  // Fuera del provider (en pruebas de una pieza suelta) no hay barra: se ignora.
  return useContext(SnackbarContext) ?? noop;
}

const noop: Show = () => {};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
  },
  title: { ...AppTypography.labelLarge },
  text: { ...AppTypography.bodyMedium },
});
