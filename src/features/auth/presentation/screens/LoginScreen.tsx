import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { TextField } from "@/src/core/components/TextField";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useSession } from "../context/SessionContext";
import { EMAIL_HINT, emailError, passwordError } from "../validators";

// Entrar con el correo institucional: `login_page.dart`.
export default function LoginScreen() {
  const navigation = useNavigation();
  const session = useSession();
  const snackbar = useSnackbar();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email: string | null; password: string | null }>({ email: null, password: null });
  const { clearError } = session;

  useEffect(() => {
    clearError();
  }, [clearError]);

  const submit = async () => {
    Keyboard.dismiss();
    const next = { email: emailError(email), password: passwordError(password) };
    setErrors(next);
    if (next.email || next.password) return;
    const loggedIn = await session.login(email, password);
    // Si entro, la puerta de sesion cambia sola a la app.
    if (!loggedIn) snackbar(session.lastError(), { title: "Entrar" });
  };

  return (
    <SafeAreaView testID={LoginScreen.key} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Innovation Hub</Text>
        <Text style={styles.subtitle}>Entra con tu correo institucional para ver la cartelera.</Text>
        <View style={styles.fields}>
          <TextField
            testID={LoginScreen.emailFieldKey}
            label="Correo institucional"
            placeholder={EMAIL_HINT}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <TextField
            testID={LoginScreen.passwordFieldKey}
            label="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
            error={errors.password}
          />
        </View>
        <PrimaryButton
          testID={LoginScreen.submitButtonKey}
          label={session.isLoading ? "Entrando..." : "Entrar"}
          onPress={session.isLoading ? undefined : submit}
        />
        <SecondaryButton
          testID={LoginScreen.createAccountButtonKey}
          label="Crear cuenta"
          onPress={() => navigation.navigate("Signup")}
          style={styles.secondary}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Las `Key` de Flutter, como `testID`: las pruebas llegan a cada control sin
// depender de su texto.
LoginScreen.key = "LoginPage";
LoginScreen.emailFieldKey = "TextFormFieldLoginEmail";
LoginScreen.passwordFieldKey = "TextFormFieldLoginPassword";
LoginScreen.submitButtonKey = "ButtonLoginSubmit";
LoginScreen.createAccountButtonKey = "ButtonLoginCreateAccount";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.paper },
  container: { flexGrow: 1, justifyContent: "center", padding: AppTokens.gapXl },
  title: { ...AppTypography.headlineMedium, textAlign: "center" },
  subtitle: { ...AppTypography.bodyMedium, textAlign: "center", marginTop: AppTokens.gapS },
  fields: { gap: AppTokens.gapM, marginVertical: AppTokens.gapXl },
  secondary: { marginTop: AppTokens.gapS },
});
