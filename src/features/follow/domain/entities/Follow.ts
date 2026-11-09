// Que un estudiante sigue un proyecto: el `Follow` de `follow.dart`.
//
// Dejar de seguir no borra la fila: la deja con `active` en falso, como Flutter.
export type Follow = {
  id: string | null;
  projectId: string;
  userId: string;
  active: boolean;
};

export function newFollow(fields: Omit<Follow, "id" | "active"> & Partial<Pick<Follow, "id" | "active">>): Follow {
  return { id: null, active: true, ...fields };
}
