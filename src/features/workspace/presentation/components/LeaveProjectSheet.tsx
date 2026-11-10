import { StackActions, useNavigation } from "@react-navigation/native";
import React from "react";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";

// Hoja de confirmacion para salir de un proyecto: `leave_project_sheet.dart`.
// No tiene ruta: se abre desde el Resumen del espacio de trabajo.
export function LeaveProjectSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const vm = useWorkspace();
  const navigation = useNavigation();

  const confirm = async () => {
    let left: boolean;
    try {
      left = await vm.leave();
    } catch {
      // Como en Flutter: si falla, la hoja se queda abierta.
      return;
    }
    onDismiss();
    // De vuelta a la pantalla principal: este espacio de trabajo ya no es suyo.
    if (left) navigation.dispatch(StackActions.popToTop());
  };

  return (
    <BottomSheet
      testID={LeaveProjectSheet.key}
      visible={visible}
      onDismiss={onDismiss}
      title="¿Salir del proyecto?"
      message="Dejarás el equipo y ya no verás su espacio de trabajo. Podrás volver a postularte mientras el reclutamiento siga abierto."
    >
      <PrimaryButton testID={LeaveProjectSheet.confirmKey} label="Sí, salir del proyecto" onPress={confirm} />
      <SecondaryButton testID={LeaveProjectSheet.stayKey} label="Quedarme" onPress={onDismiss} />
    </BottomSheet>
  );
}

LeaveProjectSheet.key = "workspace.leaveSheet";
LeaveProjectSheet.confirmKey = "workspace.leaveSheet.confirm";
LeaveProjectSheet.stayKey = "workspace.leaveSheet.stay";
