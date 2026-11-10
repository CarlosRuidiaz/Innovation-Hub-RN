// Un hito del proyecto: lo unico de donde sale el porcentaje de avance. El
// `Milestone` de `milestone.dart`.
//
// El porcentaje no se guarda en ningun lado: se cuenta a partir de cuantos
// hitos estan cumplidos. Asi la barra nunca miente ni retrocede sin motivo.
export type Milestone = {
  id: string | null;
  projectId: string;
  title: string;
  dueDate: Date;
  done: boolean;
};

export function newMilestone(fields: Omit<Milestone, "id" | "done"> & Partial<Pick<Milestone, "id" | "done">>): Milestone {
  return { id: null, done: false, ...fields };
}
