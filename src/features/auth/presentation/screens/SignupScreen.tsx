import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { TextField } from "@/src/core/components/TextField";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { EMAIL_HINT, emailError, passwordError } from "../validators";

type Errors = { email: string | null; password: string | null; confirmation: string | null };

// Paso 1 de 2 del registro: solo las credenciales (`signup_page.dart`).
//
// Aqui no se crea la cuenta. El perfil viaja en el `extra` del registro y
// `extra` solo se manda al crearla, asi que se crea al terminar el paso 2.
export default function SignupScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<Errors>({ email: null, password: null, confirmation: null });

  const proceed = () => {
    Keyboard.dismiss();
    const next: Errors = {
      email: emailError(email),
      password: passwordError(password),
      confirmation: confirmation !== password ? "Las contraseñas no coinciden" : null,
    };
    setErrors(next);
    if (next.email || next.password || next.confirmation) return;
    navigation.navigate("CompleteProfile", { email: email.trim(), password });
  };

  return (
    <ScrollView testID={SignupScreen.key} style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.step}>Paso 1 de 2</Text>
      <Text style={styles.title}>Tus credenciales</Text>
      <Text style={styles.body}>Usa tu correo institucional. En el siguiente paso completas tu perfil.</Text>
      <View style={styles.fields}>
        <TextField
          testID={SignupScreen.emailFieldKey}
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
          testID={SignupScreen.passwordFieldKey}
          label="Contraseña"
          placeholder="Al menos 7 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />
        <TextField
          testID={SignupScreen.confirmationFieldKey}
          label="Repite la contraseña"
          secureTextEntry
          value={confirmation}
          onChangeText={setConfirmation}
          onSubmitEditing={proceed}
          error={errors.confirmation}
        />
      </View>
      <PrimaryButton testID={SignupScreen.continueButtonKey} label="Continuar" onPress={proceed} />
    </ScrollView>
  );
}

SignupScreen.key = "SignUpPage";
SignupScreen.emailFieldKey = "TextFormFieldSignUpEmail";
SignupScreen.passwordFieldKey = "TextFormFieldSignUpPassword";
SignupScreen.confirmationFieldKey = "TextFormFieldSignUpPasswordConfirm";
SignupScreen.continueButtonKey = "ButtonSignUpContinue";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.paper },
  container: { padding: AppTokens.gapL },
  step: { ...AppTypography.bodySmall },
  title: { ...AppTypography.titleLarge, marginTop: AppTokens.gapXs },
  body: { ...AppTypography.bodyMedium, marginTop: AppTokens.gapS },
  fields: { gap: AppTokens.gapM, marginVertical: AppTokens.gapXl },
});
