import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { PendingScreen } from "@/src/core/components/PendingScreen";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { AppTokens, AppTypography } from "@/src/theme/tokens";
import { useProfile } from "../context/ProfileContext";

// Provisional: reemplaza a `profile_view.dart`. La migra el carril 2.
//
// Por ahora muestra el nombre y el programa del perfil de la sesion y deja
// cerrar sesion con la misma confirmacion de Flutter: con eso se comprueba que
// la autenticacion y el perfil funcionan.
export default function ProfileScreen() {
  const { profile, isLoading } = useProfile();
  const session = useSession();
  const [confirming, setConfirming] = useState(false);

  return (
    <View testID={ProfileScreen.key} style={styles.flex}>
      <PendingScreen name="ProfileScreen" replaces="profile_view.dart">
        <View style={styles.profile}>
          {isLoading ? <Text style={styles.program}>Cargando el perfil…</Text> : null}
          {profile ? (
            <>
              <Text testID={ProfileScreen.nameKey} style={styles.name}>
                {profile.fullName}
              </Text>
              <Text testID={ProfileScreen.programKey} style={styles.program}>
                {profile.academicProgram}
              </Text>
            </>
          ) : null}
        </View>
        <SecondaryButton testID={ProfileScreen.logoutButtonKey} label="Cerrar sesión" onPress={() => setConfirming(true)} />
      </PendingScreen>
      <BottomSheet
        visible={confirming}
        onDismiss={() => setConfirming(false)}
        title="¿Cerrar sesión?"
        message="Volverás a la pantalla de inicio de sesión. Tus ideas y postulaciones se quedan como están."
      >
        <PrimaryButton
          testID={ProfileScreen.logoutConfirmButtonKey}
          label="Sí, cerrar sesión"
          onPress={async () => {
            await session.logout();
            setConfirming(false);
          }}
        />
        <SecondaryButton label="Volver" onPress={() => setConfirming(false)} />
      </BottomSheet>
    </View>
  );
}

ProfileScreen.key = "ProfileView";
ProfileScreen.nameKey = "ProfileName";
ProfileScreen.programKey = "ProfileProgram";
ProfileScreen.logoutButtonKey = "ButtonLogout";
ProfileScreen.logoutConfirmButtonKey = "ButtonLogoutConfirm";

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profile: { alignItems: "center", gap: AppTokens.gapXs, marginVertical: AppTokens.gapL },
  name: { ...AppTypography.titleLarge, textAlign: "center" },
  program: { ...AppTypography.bodyMedium, textAlign: "center" },
});
