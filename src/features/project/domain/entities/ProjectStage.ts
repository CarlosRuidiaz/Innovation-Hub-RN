// Las seis etapas de un proyecto, en el orden de Flutter
// (`enum ProjectStage` de `project.dart`). El texto es exactamente el `.name` de
// Dart: es lo que viaja a la columna `stage` de Roble.
export const PROJECT_STAGES = ["idea", "teamFormation", "research", "prototype", "testing", "finished"] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

// Una etapa desconocida o nula es "idea", como `_parseStage` de Flutter.
export function stageFromName(value: unknown): ProjectStage {
  const text = value == null ? "" : String(value);
  return (PROJECT_STAGES as readonly string[]).includes(text) ? (text as ProjectStage) : "idea";
}
