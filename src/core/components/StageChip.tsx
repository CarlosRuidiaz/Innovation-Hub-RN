import React from "react";

import { ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { AppStageColors } from "@/src/theme/tokens";
import { Pill } from "./Pill";

// La etapa de un proyecto, pintada como pildora. En Flutter vivia en `project`
// (`stage_chip.dart`), pero la usan varias funcionalidades: la cartelera, el
// detalle, el espacio de trabajo, la vitrina y Mis proyectos.
//
// Traducir la etapa y darle color es trabajo de la interfaz: la entidad no sabe
// de idiomas ni de colores.
export function StageChip({ stage, testID }: { stage: ProjectStage; testID?: string }) {
  return <Pill label={stageLabelOf(stage)} background={stageColorOf(stage)} testID={testID} />;
}

const LABELS: Record<ProjectStage, string> = {
  idea: "Idea",
  teamFormation: "Formando equipo",
  research: "Investigación",
  prototype: "Prototipo",
  testing: "Pruebas",
  finished: "Terminado",
};

// Publicas a proposito, como `StageChip.labelOf` y `StageChip.colorOf` de
// Flutter: los filtros y crear idea pintan las mismas seis etapas y tienen que
// usar esta traduccion y este color, no una copia suya.
export function stageLabelOf(stage: ProjectStage): string {
  return LABELS[stage];
}

export function stageColorOf(stage: ProjectStage): string {
  return AppStageColors[stage];
}
