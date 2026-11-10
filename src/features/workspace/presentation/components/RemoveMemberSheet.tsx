import React from "react";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { TeamMember } from "../viewmodels/TeamMember";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";

// Hoja de confirmacion para que el lider remueva a un miembro:
// `remove_member_sheet.dart`. Sin miembro elegido no se ve.
export function RemoveMemberSheet({ member, onDismiss }: { member: TeamMember | null; onDismiss: () => void }) {
  const vm = useWorkspace();
  const { refresh: refreshProjects } = useProjects();

  const confirm = async () => {
    if (member == null) return;
    try {
      await vm.removeMember(member);
    } catch {
      // Como en Flutter: si falla, la hoja se queda abierta.
      return;
    }
    // Como `refrescarListasDeProyectos` de Flutter: la cartelera y el detalle
    // guardan su propia copia de los proyectos.
    refreshProjects();
    onDismiss();
  };

  return (
    <BottomSheet
      testID={RemoveMemberSheet.key}
      visible={member != null}
      onDismiss={onDismiss}
      title={`¿Remover a ${member?.name ?? ""}?`}
      message="Saldrá del equipo y perderá el acceso al espacio de trabajo. No podrá volver a postularse a este proyecto."
    >
      <PrimaryButton testID={RemoveMemberSheet.confirmKey} label="Sí, remover" onPress={confirm} />
      <SecondaryButton testID={RemoveMemberSheet.cancelKey} label="Cancelar" onPress={onDismiss} />
    </BottomSheet>
  );
}

RemoveMemberSheet.key = "workspace.removeSheet";
RemoveMemberSheet.confirmKey = "workspace.removeSheet.confirm";
RemoveMemberSheet.cancelKey = "workspace.removeSheet.cancel";
