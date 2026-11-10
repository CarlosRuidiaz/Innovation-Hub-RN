import React from "react";
import { StyleSheet, View } from "react-native";

import { StageChip, stageColorOf, stageLabelOf } from "@/src/core/components/StageChip";
import { PROJECT_STAGES, ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { AppTokens } from "@/src/theme/tokens";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";
import { SelectablePill } from "./SelectablePill";

// La etapa actual del proyecto: `stage_selector.dart`. Para el equipo es una
// etiqueta; para el lider, las seis etapas como pildoras seleccionables, con la
// misma traduccion y el mismo color que usan los filtros de la cartelera.
export function StageSelector({ stage }: { stage: ProjectStage }) {
  const vm = useWorkspace();
  const { refresh: refreshProjects } = useProjects();

  if (!vm.isLeader) return <StageChip stage={stage} />;

  const choose = async (next: ProjectStage) => {
    if (next === stage) return;
    try {
      await vm.updateStage(next);
      // Como `refrescarListasDeProyectos` de Flutter: la cartelera y el detalle
      // guardan su propia copia de los proyectos.
      refreshProjects();
    } catch {
      // Como en Flutter: si falla, la etapa se queda como estaba.
    }
  };

  return (
    <View style={styles.wrap}>
      {PROJECT_STAGES.map((s) => (
        <SelectablePill
          key={s}
          testID={StageSelector.stageKey(s)}
          label={stageLabelOf(s)}
          selected={s === stage}
          selectedColor={stageColorOf(s)}
          onPress={() => choose(s)}
        />
      ))}
    </View>
  );
}

StageSelector.stageKey = (stage: ProjectStage) => `workspace.stage.${stage}`;

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
});
