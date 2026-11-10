import { RobleApiHttpException } from "roble-client";

import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { ShowcaseDataSource } from "@/src/features/showcase/data/datasources/ShowcaseDataSource";
import { ShowcaseInMemoryDataSource } from "@/src/features/showcase/data/datasources/ShowcaseInMemoryDataSource";
import { ShowcaseRepositoryImpl } from "@/src/features/showcase/data/repositories/ShowcaseRepositoryImpl";
import { newProjectComment } from "@/src/features/showcase/domain/entities/ProjectComment";
import { newProjectFeedback } from "@/src/features/showcase/domain/entities/ProjectFeedback";
import { ShowcaseFailure } from "@/src/features/showcase/domain/ShowcaseFailure";
import { fake } from "@/__tests__/support/fake";

const feedback = (usability: number) =>
  newProjectFeedback({ projectId: "p1", authorId: "u3", authorName: "Laura", usability, innovation: 4, visualDesign: 4, feasibility: 4, createdAt: new Date(2026, 0, 1) });

// `roble_showcase_source_test.dart`: lo que el repositorio le manda a la fuente.
describe("ShowcaseRepository con una fuente falsa", () => {
  it("addComment inserta con la fila de Flutter y getComments filtra por project_id", async () => {
    const calls: [string, Row][] = [];
    const repo = new ShowcaseRepositoryImpl(
      fake<ShowcaseDataSource>({
        createComment: async (row) => (calls.push(["create", row]), { ...row, _id: "c_nuevo" }),
        readComments: async (f) => (calls.push(["read", f]), []),
      }),
    );
    const c = await repo.addComment(newProjectComment({ projectId: "p1", authorId: "u1", authorName: "Ana", text: "Hola", createdAt: new Date(2026, 0, 1) }));
    await repo.getComments("p1");
    expect(c.id).toBe("c_nuevo");
    expect(calls[0][1]).not.toHaveProperty("parent_id");
    expect(calls[1]).toEqual(["read", { project_id: "p1" }]);
  });

  it("getComments y getFeedback traducen el error de Roble", async () => {
    const boom = async () => {
      throw new RobleApiHttpException(500, "caido");
    };
    const repo = new ShowcaseRepositoryImpl(fake<ShowcaseDataSource>({ readComments: boom, readFeedback: boom }));
    await expect(repo.getComments("p1")).rejects.toBeInstanceOf(ShowcaseFailure);
    await expect(repo.getFeedback("p1")).rejects.toBeInstanceOf(ShowcaseFailure);
  });

  it("saveFeedback crea si no hay, y reemplaza la del mismo autor sin duplicar", async () => {
    const rows: Row[] = [];
    const updates: [string, Row][] = [];
    const repo = new ShowcaseRepositoryImpl(
      fake<ShowcaseDataSource>({
        readFeedback: async (f) => rows.filter((r) => r.project_id === f.project_id && r.author_id === f.author_id),
        createFeedback: async (row) => {
          const stored = { ...row, _id: "fb1" };
          rows.push(stored);
          return stored;
        },
        updateFeedback: async (id, row) => {
          updates.push([id, row]);
          return { ...row, _id: id };
        },
      }),
    );
    const first = await repo.saveFeedback(feedback(2));
    const second = await repo.saveFeedback(feedback(5));
    expect(rows).toHaveLength(1);
    expect(first.id).toBe("fb1");
    expect(second).toMatchObject({ id: "fb1", usability: 5 });
    expect(updates[0][0]).toBe("fb1");
    // Con id, se reemplaza esa directamente.
    await repo.saveFeedback({ ...feedback(3), id: "fb1" });
    expect(updates).toHaveLength(2);
  });

  it("si la actualizacion no devuelve la fila, vale la que se mando", async () => {
    const repo = new ShowcaseRepositoryImpl(fake<ShowcaseDataSource>({ updateFeedback: async () => ({}) }));
    expect(await repo.saveFeedback({ ...feedback(3), id: "fb9" })).toEqual({ ...feedback(3), id: "fb9" });
  });
});

describe("ShowcaseRepository en memoria", () => {
  it("los comentarios sembrados del prototipo traen la respuesta del equipo", async () => {
    const repo = new ShowcaseRepositoryImpl(new ShowcaseInMemoryDataSource(new DummyData({ latencyMs: 0 })));
    const comments = await repo.getComments("3");
    expect(comments.map((c) => [c.id, c.parentId, c.isTeam])).toEqual([
      ["c1", null, false],
      ["c2", "c1", true],
    ]);
  });

  it("guardar dos veces la retroalimentacion del mismo autor no duplica fila", async () => {
    const data = new DummyData({ latencyMs: 0 });
    const repo = new ShowcaseRepositoryImpl(new ShowcaseInMemoryDataSource(data));
    await repo.saveFeedback({ ...feedback(1), projectId: "3", authorId: "u8" });
    expect(data.feedback.filter((f) => f.project_id === "3" && f.author_id === "u8")).toHaveLength(1);
    expect((await repo.getFeedback("3"))[0].usability).toBe(1);
  });
});
