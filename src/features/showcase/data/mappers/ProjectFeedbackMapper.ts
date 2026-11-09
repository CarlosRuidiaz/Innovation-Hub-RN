import { Row } from "@/src/core/roble/guard";
import { dateOrNull, idOf, intOf, textOf, toFlutterIso } from "@/src/core/roble/rowFormat";
import { ProjectFeedback } from "../../domain/entities/ProjectFeedback";

// La tabla `feedback`, como la leen y la escriben `ProjectFeedback.fromJson` y
// `ProjectFeedback.toJsonNoId` de Flutter.
export const ProjectFeedbackMapper = {
  fromRow(row: Row): ProjectFeedback {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      authorId: textOf(row.author_id),
      authorName: textOf(row.author_name),
      // Una nota que falta o no se lee es 1, la mas baja.
      usability: intOf(row.usability, 1),
      innovation: intOf(row.innovation, 1),
      visualDesign: intOf(row.visual_design, 1),
      feasibility: intOf(row.feasibility, 1),
      comment: row.comment == null ? null : String(row.comment),
      createdAt: dateOrNull(row.created_at) ?? new Date(),
    };
  },

  // `comment` solo va cuando hay uno.
  toNewRow(f: ProjectFeedback): Row {
    return {
      project_id: f.projectId,
      author_id: f.authorId,
      author_name: f.authorName,
      usability: f.usability,
      innovation: f.innovation,
      visual_design: f.visualDesign,
      feasibility: f.feasibility,
      ...(f.comment != null ? { comment: f.comment } : {}),
      created_at: toFlutterIso(f.createdAt),
    };
  },
};
