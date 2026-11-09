import { Row } from "@/src/core/roble/guard";
import { boolOf, dateOrNull, idOf, textOf, toFlutterIso } from "@/src/core/roble/rowFormat";
import { ProjectComment } from "../../domain/entities/ProjectComment";

// La tabla `comments`, como la leen y la escriben `ProjectComment.fromJson` y
// `ProjectComment.toJsonNoId` de Flutter.
export const ProjectCommentMapper = {
  fromRow(row: Row): ProjectComment {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      authorId: textOf(row.author_id),
      authorName: textOf(row.author_name),
      text: textOf(row.text),
      parentId: row.parent_id == null ? null : String(row.parent_id),
      isTeam: boolOf(row.is_team),
      // Sin fecha, o una que no se lee: ahora mismo, como Flutter.
      createdAt: dateOrNull(row.created_at) ?? new Date(),
    };
  },

  // `parent_id` solo va cuando es una respuesta.
  toNewRow(c: ProjectComment): Row {
    return {
      project_id: c.projectId,
      author_id: c.authorId,
      author_name: c.authorName,
      text: c.text,
      ...(c.parentId != null ? { parent_id: c.parentId } : {}),
      is_team: c.isTeam,
      created_at: toFlutterIso(c.createdAt),
    };
  },
};
