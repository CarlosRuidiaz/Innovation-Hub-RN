import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton } from "@/src/core/components/Buttons";
import { TextField } from "@/src/core/components/TextField";
import { AppTokens, AppTypography } from "@/src/theme/tokens";
import { TeamMember } from "../viewmodels/TeamMember";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";
import { SelectablePill } from "./SelectablePill";

// Hoja para añadir una tarea: `add_task_sheet.dart`. El responsable se elige
// de la lista de miembros, con las mismas pildoras seleccionables que usan los
// filtros de la cartelera; arranca en el primero, que es el lider.
export function AddTaskSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const vm = useWorkspace();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<TeamMember | null>(null);
  const { members } = vm;

  // Cada vez que se abre empieza vacia, como la hoja nueva de Flutter. Solo al
  // abrirse: recargar el equipo con la hoja abierta no borra lo elegido.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setTitle("");
      setAssignee(members.length > 0 ? members[0] : null);
    }
  }

  const add = async () => {
    const text = title.trim();
    if (text.length === 0 || assignee == null) return;
    try {
      await vm.addTask(text, assignee.name);
    } catch {
      // Como en Flutter: si falla, la hoja se queda abierta.
      return;
    }
    onDismiss();
  };

  return (
    <BottomSheet testID={AddTaskSheet.key} visible={visible} onDismiss={onDismiss} title="Nueva tarea">
      <View style={styles.form}>
        <TextField testID={AddTaskSheet.titleFieldKey} label="Título" value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Responsable</Text>
        <View style={styles.wrap}>
          {members.map((m) => (
            <SelectablePill
              key={m.id}
              testID={AddTaskSheet.assigneeKey(m.id)}
              label={m.name}
              selected={assignee?.id === m.id}
              onPress={() => setAssignee(m)}
            />
          ))}
        </View>
        <PrimaryButton testID={AddTaskSheet.submitKey} label="Añadir tarea" onPress={add} style={styles.submit} />
      </View>
    </BottomSheet>
  );
}

AddTaskSheet.key = "workspace.taskSheet";
AddTaskSheet.titleFieldKey = "workspace.taskSheet.title";
AddTaskSheet.submitKey = "workspace.taskSheet.submit";
AddTaskSheet.assigneeKey = (memberId: string) => `workspace.taskSheet.assignee.${memberId}`;

const styles = StyleSheet.create({
  form: { marginTop: AppTokens.gapXs },
  label: { ...AppTypography.bodyMedium, marginTop: AppTokens.gapM, marginBottom: AppTokens.gapS },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  submit: { marginTop: AppTokens.gapXl },
});
