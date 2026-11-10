import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { DatePickerDialog } from "@/src/core/components/DatePickerDialog";
import { TextField } from "@/src/core/components/TextField";
import { AppTokens } from "@/src/theme/tokens";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";

const DAY = 24 * 3600_000;

// Hoja para que el lider añada un hito nuevo: `add_milestone_sheet.dart`.
//
// No sale en el prototipo, pero hace falta: sin ella un proyecto nuevo nunca
// tendria hitos y la barra de avance se quedaria en 0 para siempre.
export function AddMilestoneSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const vm = useWorkspace();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date());
  const [picking, setPicking] = useState(false);
  // El rango del calendario: desde ayer hasta dentro de dos años. Quien la abre
  // la vuelve a montar cada vez (con otra `key`), asi que empieza vacia y con
  // la fecha de hoy, como la hoja nueva de Flutter.
  const [now] = useState(() => Date.now());

  const add = async () => {
    const text = title.trim();
    if (text.length === 0) return;
    try {
      await vm.addMilestone(text, date);
    } catch {
      // Como en Flutter: si falla, la hoja se queda abierta.
      return;
    }
    onDismiss();
  };

  return (
    <BottomSheet testID={AddMilestoneSheet.key} visible={visible} onDismiss={onDismiss} title="Nuevo hito">
      <View style={styles.form}>
        <TextField testID={AddMilestoneSheet.titleFieldKey} label="Título" value={title} onChangeText={setTitle} />
        <SecondaryButton
          testID={AddMilestoneSheet.dateButtonKey}
          label={`Fecha: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
          onPress={() => setPicking(true)}
        />
        <PrimaryButton testID={AddMilestoneSheet.submitKey} label="Añadir hito" onPress={add} style={styles.submit} />
      </View>
      <DatePickerDialog
        visible={picking}
        initialDate={date}
        firstDate={new Date(now - DAY)}
        lastDate={new Date(now + 730 * DAY)}
        onConfirm={(chosen) => {
          setDate(chosen);
          setPicking(false);
        }}
        onDismiss={() => setPicking(false)}
      />
    </BottomSheet>
  );
}

AddMilestoneSheet.key = "workspace.milestoneSheet";
AddMilestoneSheet.titleFieldKey = "workspace.milestoneSheet.title";
AddMilestoneSheet.dateButtonKey = "workspace.milestoneSheet.date";
AddMilestoneSheet.submitKey = "workspace.milestoneSheet.submit";

const styles = StyleSheet.create({
  form: { gap: AppTokens.gapM, marginTop: AppTokens.gapXs },
  submit: { marginTop: AppTokens.gapM },
});
