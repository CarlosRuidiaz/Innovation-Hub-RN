import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Checkbox } from "react-native-paper";

import { SecondaryButton } from "@/src/core/components/Buttons";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { Milestone } from "../../domain/entities/Milestone";
import { ProjectTask } from "../../domain/entities/ProjectTask";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";
import { AddMilestoneSheet } from "./AddMilestoneSheet";
import { AddTaskSheet } from "./AddTaskSheet";
import { MemberAvatar } from "./MemberAvatar";
import { useRefreshControl } from "./refreshControl";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const dateOf = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

// Si falla, la casilla se queda como estaba, como en Flutter.
const quietly = (action: Promise<void>) => action.catch(() => undefined);

// Pestaña "Tareas": `tasks_tab.dart`. Los hitos, arriba, y las tareas del
// equipo, abajo. Solo el lider marca hitos y añade hitos; las tareas, todo el
// equipo.
export function TasksTab() {
  const vm = useWorkspace();
  const refreshControl = useRefreshControl(vm.reload);
  const [addingTask, setAddingTask] = useState(false);
  const [addingMilestone, setAddingMilestone] = useState(false);
  // La hoja del hito se vuelve a montar en cada apertura: arranca vacia y con
  // la fecha de hoy.
  const [milestoneSheet, setMilestoneSheet] = useState(0);
  const total = vm.totalMilestones;

  return (
    <>
      <ScrollView testID={TasksTab.key} contentContainerStyle={styles.list} refreshControl={refreshControl}>
        <Text style={AppTypography.titleMedium}>
          {total === 0 ? "Hitos · Sin hitos todavía" : `Hitos · ${vm.completedMilestones} de ${total} cumplidos`}
        </Text>
        <View style={styles.gapM} />
        {vm.milestones.length === 0 ? (
          <Text style={[AppTypography.bodySmall, styles.emptyLine]}>
            {vm.isLeader ? "Añade el primer hito para poder medir el avance." : "El líder todavía no ha añadido hitos."}
          </Text>
        ) : (
          vm.milestones.map((m, i) => (
            <MilestoneRow
              key={m.id ?? `${i}`}
              milestone={m}
              enabled={vm.isLeader}
              onToggle={(done) => quietly(vm.setMilestoneDone(m.id ?? "", done))}
            />
          ))
        )}
        <View style={styles.gapXl} />
        <Text style={AppTypography.titleMedium}>Tareas pendientes</Text>
        <View style={styles.gapM} />
        {vm.tasks.length === 0 ? (
          <Text style={[AppTypography.bodySmall, styles.emptyLine]}>
            Todavía no hay tareas. Añade la primera para repartir el trabajo.
          </Text>
        ) : (
          vm.tasks.map((t, i) => (
            <TaskRow key={t.id ?? `${i}`} task={t} onToggle={(done) => quietly(vm.setTaskDone(t.id ?? "", done))} />
          ))
        )}
        <View style={styles.gapXl} />
        <SecondaryButton testID={TasksTab.addTaskKey} label="Añadir tarea" onPress={() => setAddingTask(true)} />
        {vm.isLeader ? (
          <>
            <View style={styles.gapS} />
            <SecondaryButton
              testID={TasksTab.addMilestoneKey}
              label="Añadir hito"
              onPress={() => {
                setMilestoneSheet((k) => k + 1);
                setAddingMilestone(true);
              }}
            />
          </>
        ) : null}
      </ScrollView>
      <AddTaskSheet visible={addingTask} onDismiss={() => setAddingTask(false)} />
      <AddMilestoneSheet key={milestoneSheet} visible={addingMilestone} onDismiss={() => setAddingMilestone(false)} />
    </>
  );
}

TasksTab.key = "workspace.tasks";
TasksTab.addTaskKey = "workspace.tasks.addTask";
TasksTab.addMilestoneKey = "workspace.tasks.addMilestone";
TasksTab.milestoneKey = (id: string) => `workspace.tasks.milestone.${id}`;
TasksTab.taskKey = (id: string) => `workspace.tasks.task.${id}`;

function MilestoneRow({
  milestone,
  enabled,
  onToggle,
}: {
  milestone: Milestone;
  enabled: boolean;
  onToggle: (done: boolean) => void;
}) {
  const color = milestone.done ? AppColors.secondary : AppColors.ink;
  return (
    <View style={styles.row}>
      <Checkbox.Android
        testID={TasksTab.milestoneKey(milestone.id ?? "")}
        status={milestone.done ? "checked" : "unchecked"}
        color={AppColors.petrol}
        uncheckedColor={AppColors.ink}
        disabled={!enabled}
        onPress={() => onToggle(!milestone.done)}
      />
      <View style={styles.rowText}>
        <Text style={[AppTypography.bodyLarge, { color }]}>{milestone.title}</Text>
        <Text style={[AppTypography.bodySmall, { color }]}>{dateOf(milestone.dueDate)}</Text>
      </View>
    </View>
  );
}

function TaskRow({ task, onToggle }: { task: ProjectTask; onToggle: (done: boolean) => void }) {
  const color = task.done ? AppColors.secondary : AppColors.ink;
  return (
    <View style={styles.row}>
      <Checkbox.Android
        testID={TasksTab.taskKey(task.id ?? "")}
        status={task.done ? "checked" : "unchecked"}
        color={AppColors.petrol}
        uncheckedColor={AppColors.ink}
        onPress={() => onToggle(!task.done)}
      />
      <Text style={[AppTypography.bodyLarge, styles.rowText, { color }]}>{task.title}</Text>
      <MemberAvatar name={task.assigneeName} background={AppColors.paper} small />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: AppTokens.gapL },
  gapS: { height: AppTokens.gapS },
  gapM: { height: AppTokens.gapM },
  gapXl: { height: AppTokens.gapXl },
  emptyLine: { paddingVertical: AppTokens.gapS },
  row: { flexDirection: "row", alignItems: "center", marginBottom: AppTokens.gapS },
  rowText: { flex: 1, marginLeft: AppTokens.gapS },
});
