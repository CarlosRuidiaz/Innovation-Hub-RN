// Una tarea del equipo, dentro del espacio de trabajo: el `ProjectTask` de
// `project_task.dart`. Se llama asi y no `Task` para no confundirla con nada del
// propio lenguaje.
export type ProjectTask = {
  id: string | null;
  projectId: string;
  title: string;
  assigneeName: string;
  done: boolean;
};

export function newProjectTask(
  fields: Omit<ProjectTask, "id" | "done"> & Partial<Pick<ProjectTask, "id" | "done">>,
): ProjectTask {
  return { id: null, done: false, ...fields };
}
