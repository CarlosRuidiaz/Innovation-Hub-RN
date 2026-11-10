import { Row, textOrNull } from "@/src/core/roble/guard";
import { dateOrNull, idOf, intOf, textOf, toFlutterIso } from "@/src/core/roble/rowFormat";
import { ProgressUpdate } from "../../domain/entities/ProgressUpdate";

// La tabla `progress_updates`, como la leen y la escriben
// `ProgressUpdate.fromJson` y `ProgressUpdate.toJsonNoId` de Flutter.
export const ProgressUpdateMapper = {
  fromRow(row: Row): ProgressUpdate {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      authorId: textOf(row.author_id),
      authorName: textOf(row.author_name),
      title: textOf(row.title),
      description: textOf(row.description),
      createdAt: dateOrNull(row.created_at) ?? new Date(0),
      completionPercentage: Math.min(100, Math.max(0, intOf(row.completion_percentage))),
      // Vacio y ausente son lo mismo: no hay valor que mostrar.
      videoUrl: textOrNull(row.video_url),
      milestoneId: textOrNull(row.milestone_id),
    };
  },

  // La fecha viaja como texto ISO 8601 en hora local, y los dos opcionales como
  // texto vacio cuando no hay valor.
  toNewRow(u: ProgressUpdate): Row {
    return {
      project_id: u.projectId,
      author_id: u.authorId,
      author_name: u.authorName,
      title: u.title,
      description: u.description,
      created_at: toFlutterIso(u.createdAt),
      completion_percentage: u.completionPercentage,
      video_url: u.videoUrl ?? "",
      milestone_id: u.milestoneId ?? "",
    };
  },
};
