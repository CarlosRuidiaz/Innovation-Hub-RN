import { Row } from "@/src/core/roble/guard";
import { boolOf, idOf, textOf } from "@/src/core/roble/rowFormat";
import { ProjectTask } from "../../domain/entities/ProjectTask";

// La tabla `tasks`, como la leen y la escriben `ProjectTask.fromJson` y
// `ProjectTask.toJsonNoId` de Flutter.
export const ProjectTaskMapper = {
  fromRow(row: Row): ProjectTask {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      title: textOf(row.title),
      assigneeName: textOf(row.assignee_name),
      done: boolOf(row.done),
    };
  },

  toNewRow(t: ProjectTask): Row {
    return { project_id: t.projectId, title: t.title, assignee_name: t.assigneeName, done: t.done };
  },
};
