import { Row } from "@/src/core/roble/guard";
import { boolOf, dateOrNull, idOf, textOf, toFlutterIso } from "@/src/core/roble/rowFormat";
import { Milestone } from "../../domain/entities/Milestone";

// La tabla `milestones`, como la leen y la escriben `Milestone.fromJson` y
// `Milestone.toJsonNoId` de Flutter.
export const MilestoneMapper = {
  fromRow(row: Row): Milestone {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      title: textOf(row.title),
      // Sin fecha, o una que no se lee: el 1 de enero de 1970.
      dueDate: dateOrNull(row.due_date) ?? new Date(0),
      done: boolOf(row.done),
    };
  },

  // La fecha viaja como texto ISO 8601, en hora local.
  toNewRow(m: Milestone): Row {
    return {
      project_id: m.projectId,
      title: m.title,
      due_date: toFlutterIso(m.dueDate),
      done: m.done,
    };
  },
};
