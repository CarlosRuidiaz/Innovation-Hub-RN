import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { useProfile } from "@/src/features/profile/presentation/context/ProfileContext";
import { acceptsApplicationsFrom, Project } from "@/src/features/project/domain/entities/Project";
import { AppTokens, AppTypography } from "@/src/theme/tokens";
import { Application } from "../../domain/entities/Application";
import { useMyApplication } from "../hooks/useMyApplication";
import { useApplicationViewModel } from "../viewmodels/useApplicationViewModel";
import { ApplySheet } from "./ApplySheet";

// Reemplaza la parte de `_buildFooterButtons` en `project_detail_page.dart`
// que depende de la postulacion del estudiante. La pone el pie del detalle del
// proyecto, junto a `FollowButton`.
//
// Tiene que mostrar una de tres cosas:
// - "Ver mi postulación" si hay una viva (pendiente o aceptada): abre
//   `ApplicationStatus` con esa postulacion.
// - "Te removieron de este proyecto." si el lider lo saco: no puede volver a
//   postularse.
// - "Postularme" si `acceptsApplicationsFrom(project, perfil.id)`: abre la hoja
//   para postularse y al enviar crea la postulacion y abre `ApplicationStatus`.
//   Sin perfil cargado, el boton se ve deshabilitado.
// Si no toca ninguna, nada.
export function ApplicationAction({ project }: { project: Project }) {
  const navigation = useNavigation();
  const { user } = useSession();
  const { profile } = useProfile();
  const { application, refresh } = useMyApplication(project.id ?? "");
  const { apply } = useApplicationViewModel();
  const [sheetVisible, setSheetVisible] = useState(false);

  const miId = profile?.id ?? user?.userId ?? null;
  const esLider = miId != null && project.leaderId === miId;

  // El lider no ve postularse ni su estado.
  if (esLider) {
    return null;
  }

  const vigente =
    application && (application.status === "pending" || application.status === "accepted")
      ? application
      : null;
  const removido = application?.status === "removed";

  const handleApplySubmit = async (newApp: Application) => {
    const created = await apply(newApp);
    if (created) {
      await refresh();
      navigation.navigate("ApplicationStatus", { application: created });
    }
    return created;
  };

  if (vigente) {
    return (
      <View style={styles.container}>
        <PrimaryButton
          testID={ApplicationAction.viewButtonKey}
          label="Ver mi postulación"
          onPress={() => navigation.navigate("ApplicationStatus", { application: vigente })}
        />
      </View>
    );
  }

  if (removido) {
    return (
      <View style={styles.container}>
        <Text testID={ApplicationAction.removedTextKey} style={styles.removedText}>
          Te removieron de este proyecto.
        </Text>
      </View>
    );
  }

  if (acceptsApplicationsFrom(project, miId)) {
    return (
      <View style={styles.container}>
        <PrimaryButton
          testID={ApplicationAction.applyButtonKey}
          label="Postularme"
          disabled={miId == null}
          onPress={() => setSheetVisible(true)}
        />
        {profile ? (
          <ApplySheet
            visible={sheetVisible}
            project={project}
            profile={profile}
            onDismiss={() => setSheetVisible(false)}
            onSubmit={handleApplySubmit}
          />
        ) : null}
      </View>
    );
  }

  return null;
}

ApplicationAction.key = "ApplicationAction";
ApplicationAction.applyButtonKey = "ButtonApply";
ApplicationAction.viewButtonKey = "ButtonViewMyApplication";
ApplicationAction.removedTextKey = "TextRemoved";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  removedText: {
    ...AppTypography.bodySmall,
    textAlign: "center",
    paddingVertical: AppTokens.gapS,
  },
});
