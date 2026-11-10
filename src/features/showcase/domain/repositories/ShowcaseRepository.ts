import { ProjectComment } from "../entities/ProjectComment";
import { ProjectFeedback } from "../entities/ProjectFeedback";

// `IShowcaseRepository` de Flutter: comentarios y retroalimentacion de los
// prototipos.
export interface ShowcaseRepository {
  getComments(projectId: string): Promise<ProjectComment[]>;

  addComment(comment: ProjectComment): Promise<ProjectComment>;

  getFeedback(projectId: string): Promise<ProjectFeedback[]>;

  // Una por autor y proyecto: si ya hay una, la reemplaza.
  saveFeedback(feedback: ProjectFeedback): Promise<ProjectFeedback>;
}
