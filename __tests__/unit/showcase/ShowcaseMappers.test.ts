import { ProjectCommentMapper } from "@/src/features/showcase/data/mappers/ProjectCommentMapper";
import { ProjectFeedbackMapper } from "@/src/features/showcase/data/mappers/ProjectFeedbackMapper";
import { summarizeFeedback } from "@/src/features/showcase/domain/entities/FeedbackSummary";
import { isReply, newProjectComment } from "@/src/features/showcase/domain/entities/ProjectComment";
import { newProjectFeedback } from "@/src/features/showcase/domain/entities/ProjectFeedback";

// Las tablas `comments` y `feedback` contra los modelos de Flutter
// (`project_comment_test.dart` y `project_feedback_test.dart`).
describe("ProjectCommentMapper", () => {
  it("toNewRow sin respuesta no manda parent_id", () => {
    expect(
      ProjectCommentMapper.toNewRow(
        newProjectComment({ projectId: "p1", authorId: "u1", authorName: "Carlos", text: "Pregunta sobre la tecnologia", createdAt: new Date(2026, 4, 1, 14, 30) }),
      ),
    ).toStrictEqual({
      project_id: "p1",
      author_id: "u1",
      author_name: "Carlos",
      text: "Pregunta sobre la tecnologia",
      is_team: false,
      created_at: "2026-05-01T14:30:00.000",
    });
  });

  it("toNewRow de una respuesta del equipo", () => {
    expect(
      ProjectCommentMapper.toNewRow(
        newProjectComment({
          projectId: "p1",
          authorId: "u2",
          authorName: "Ana Lopez",
          text: "Excelente propuesta.",
          parentId: "c1",
          isTeam: true,
          createdAt: new Date(2026, 4, 2, 9, 0),
        }),
      ),
    ).toStrictEqual({
      project_id: "p1",
      author_id: "u2",
      author_name: "Ana Lopez",
      text: "Excelente propuesta.",
      parent_id: "c1",
      is_team: true,
      created_at: "2026-05-02T09:00:00.000",
    });
  });

  it("fromRow con datos que faltan: parent_id vacio no es respuesta", () => {
    // `ProjectComment.fromJson` en Dart: "" false true.
    const c = ProjectCommentMapper.fromRow({ parent_id: "", is_team: "TRUE" });
    expect(c.parentId).toBe("");
    expect(isReply(c)).toBe(false);
    expect(c.isTeam).toBe(true);
    expect(ProjectCommentMapper.fromRow({}).parentId).toBeNull();
  });

  it("ida y vuelta", () => {
    const c = newProjectComment({ projectId: "p1", authorId: "u2", authorName: "Ana", text: "Hola", parentId: "c1", isTeam: true, createdAt: new Date(2026, 4, 2, 9, 0) });
    const back = ProjectCommentMapper.fromRow({ _id: "c2", ...ProjectCommentMapper.toNewRow(c) });
    expect(back).toEqual({ ...c, id: "c2" });
    expect(isReply(back)).toBe(true);
  });
});

describe("ProjectFeedbackMapper", () => {
  it("toNewRow escribe exactamente lo que toJsonNoId de Flutter", () => {
    expect(
      ProjectFeedbackMapper.toNewRow(
        newProjectFeedback({
          projectId: "p1",
          authorId: "u3",
          authorName: "Laura",
          usability: 4,
          innovation: 5,
          visualDesign: 3,
          feasibility: 2,
          comment: "Muy buena idea de diseno.",
          createdAt: new Date(2026, 5, 10, 18, 45),
        }),
      ),
    ).toStrictEqual({
      project_id: "p1",
      author_id: "u3",
      author_name: "Laura",
      usability: 4,
      innovation: 5,
      visual_design: 3,
      feasibility: 2,
      comment: "Muy buena idea de diseno.",
      created_at: "2026-06-10T18:45:00.000",
    });
  });

  it("toNewRow sin comentario no manda la columna", () => {
    const row = ProjectFeedbackMapper.toNewRow(
      newProjectFeedback({ projectId: "p1", authorId: "u3", authorName: "Laura", usability: 1, innovation: 1, visualDesign: 1, feasibility: 1, createdAt: new Date(2026, 5, 10) }),
    );
    expect(row).toStrictEqual({
      project_id: "p1",
      author_id: "u3",
      author_name: "Laura",
      usability: 1,
      innovation: 1,
      visual_design: 1,
      feasibility: 1,
      created_at: "2026-06-10T00:00:00.000",
    });
  });

  it("fromRow con notas que faltan o vienen mal da 1, y el comentario vacio se queda", () => {
    // `ProjectFeedback.fromJson` en Dart: 1 1 "".
    const f = ProjectFeedbackMapper.fromRow({ usability: "x", comment: "" });
    expect(f.usability).toBe(1);
    expect(f.innovation).toBe(1);
    expect(f.comment).toBe("");
    expect(ProjectFeedbackMapper.fromRow({}).comment).toBeNull();
  });

  it("ida y vuelta", () => {
    const f = newProjectFeedback({ projectId: "p1", authorId: "u3", authorName: "Laura", usability: 4, innovation: 5, visualDesign: 3, feasibility: 2, comment: "Bien", createdAt: new Date(2026, 5, 10, 18, 45) });
    expect(ProjectFeedbackMapper.fromRow({ _id: "fb1", ...ProjectFeedbackMapper.toNewRow(f) })).toEqual({ ...f, id: "fb1" });
  });

  it("el resumen redondea cada promedio a un decimal", () => {
    const f = (usability: number) =>
      newProjectFeedback({ projectId: "p1", authorId: "u", authorName: "", usability, innovation: 4, visualDesign: 3, feasibility: 5 });
    expect(summarizeFeedback([f(4), f(5), f(5)])).toEqual({
      usabilityAverage: 4.7,
      innovationAverage: 4,
      visualDesignAverage: 3,
      feasibilityAverage: 5,
      overallAverage: 4.2,
      totalCount: 3,
    });
    expect(summarizeFeedback([]).totalCount).toBe(0);
  });
});
