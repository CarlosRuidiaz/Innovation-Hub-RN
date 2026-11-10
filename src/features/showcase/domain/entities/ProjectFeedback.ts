// La retroalimentacion de un estudiante sobre un prototipo, del 1 al 5 en
// cuatro criterios: el `ProjectFeedback` de `project_feedback.dart`. Cada
// autor deja una por proyecto; volver a enviarla la reemplaza.
export type ProjectFeedback = {
  id: string | null;
  projectId: string;
  authorId: string;
  authorName: string;
  usability: number;
  innovation: number;
  visualDesign: number;
  feasibility: number;
  comment: string | null;
  createdAt: Date;
};

// El constructor de Flutter: sin fecha, ahora mismo.
export function newProjectFeedback(
  fields: Omit<ProjectFeedback, "id" | "comment" | "createdAt"> &
    Partial<Pick<ProjectFeedback, "id" | "comment" | "createdAt">>,
): ProjectFeedback {
  return { id: null, comment: null, createdAt: new Date(), ...fields };
}
