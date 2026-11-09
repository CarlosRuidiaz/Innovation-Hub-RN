import { guardRoble, Row } from "@/src/core/roble/guard";
import { idOf } from "@/src/core/roble/rowFormat";
import { ProjectComment } from "../../domain/entities/ProjectComment";
import { ProjectFeedback } from "../../domain/entities/ProjectFeedback";
import { ShowcaseRepository } from "../../domain/repositories/ShowcaseRepository";
import { ShowcaseFailure } from "../../domain/ShowcaseFailure";
import { ShowcaseDataSource } from "../datasources/ShowcaseDataSource";
import { ProjectCommentMapper } from "../mappers/ProjectCommentMapper";
import { ProjectFeedbackMapper } from "../mappers/ProjectFeedbackMapper";

const failure = (m: string) => new ShowcaseFailure(m);

// La vitrina: decide y traduce, no habla. El orden de los hilos de comentarios
// lo pone la pantalla, como `ShowcaseController` en Flutter.
export class ShowcaseRepositoryImpl implements ShowcaseRepository {
  constructor(private readonly source: ShowcaseDataSource) {}

  getComments(projectId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readComments({ project_id: projectId });
      return rows.map(ProjectCommentMapper.fromRow);
    }, failure);
  }

  addComment(comment: ProjectComment) {
    return guardRoble(
      async () => ProjectCommentMapper.fromRow(await this.source.createComment(ProjectCommentMapper.toNewRow(comment))),
      failure,
    );
  }

  getFeedback(projectId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readFeedback({ project_id: projectId });
      return rows.map(ProjectFeedbackMapper.fromRow);
    }, failure);
  }

  // Una por autor y proyecto, como `saveFeedback` de Flutter: con `id` se
  // reemplaza esa; sin `id`, la que ya tenga ese autor en ese proyecto; y si no
  // hay ninguna, se crea.
  saveFeedback(feedback: ProjectFeedback) {
    return guardRoble(async () => {
      const row = ProjectFeedbackMapper.toNewRow(feedback);
      if (feedback.id) return this.replaced(await this.source.updateFeedback(feedback.id, row), feedback, feedback.id);

      const existing = await this.source.readFeedback({ project_id: feedback.projectId, author_id: feedback.authorId });
      const existingId = existing.length > 0 ? idOf(existing[0]) : null;
      if (existingId) return this.replaced(await this.source.updateFeedback(existingId, row), feedback, existingId);

      return ProjectFeedbackMapper.fromRow(await this.source.createFeedback(row));
    }, failure);
  }

  // Si el servidor no devuelve la fila cambiada, vale la que se mando con su id.
  private replaced(updated: Row | null | undefined, sent: ProjectFeedback, id: string): ProjectFeedback {
    return updated != null && Object.keys(updated).length > 0
      ? ProjectFeedbackMapper.fromRow(updated)
      : { ...sent, id };
  }
}
