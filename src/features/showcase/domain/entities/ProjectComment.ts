// Un comentario de la vitrina sobre un prototipo: el `ProjectComment` de
// `project_comment.dart`. Una respuesta lleva el `parentId` del comentario que
// contesta.
export type ProjectComment = {
  id: string | null;
  projectId: string;
  authorId: string;
  authorName: string;
  text: string;
  parentId: string | null;
  // Lo escribio alguien del equipo del proyecto.
  isTeam: boolean;
  createdAt: Date;
};

// El constructor de Flutter: sin fecha, ahora mismo.
export function newProjectComment(
  fields: Omit<ProjectComment, "id" | "parentId" | "isTeam" | "createdAt"> &
    Partial<Pick<ProjectComment, "id" | "parentId" | "isTeam" | "createdAt">>,
): ProjectComment {
  return { id: null, parentId: null, isTeam: false, createdAt: new Date(), ...fields };
}

export const isReply = (c: ProjectComment) => c.parentId != null && c.parentId.length > 0;
