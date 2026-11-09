import { RobleApiHttpException } from "roble-client";

import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { PollDataSource } from "@/src/features/poll/data/datasources/PollDataSource";
import { PollInMemoryDataSource } from "@/src/features/poll/data/datasources/PollInMemoryDataSource";
import { PollRepositoryImpl } from "@/src/features/poll/data/repositories/PollRepositoryImpl";
import { newPoll } from "@/src/features/poll/domain/entities/Poll";
import { newPollResponse } from "@/src/features/poll/domain/entities/PollResponse";
import { PollFailure } from "@/src/features/poll/domain/PollFailure";
import { fake } from "@/__tests__/support/fake";

const poll = newPoll({
  projectId: "p1",
  authorId: "u1",
  title: "Encuesta",
  description: "",
  questions: [{ text: "¿Sirve?", options: ["Sí", "No"] }],
  closesAt: new Date(2030, 0, 1),
});

// `roble_poll_source_test.dart`: lo que el repositorio le manda a la fuente.
describe("PollRepository con una fuente falsa", () => {
  it("lee las encuestas por project_id y las respuestas por poll_id", async () => {
    const reads: [string, Row][] = [];
    const repo = new PollRepositoryImpl(
      fake<PollDataSource>({
        readPolls: async (f) => (reads.push(["polls", f]), []),
        readResponses: async (f) => (reads.push(["responses", f]), []),
      }),
    );
    await repo.getPollsForProject("p1");
    await repo.getResponsesForPoll("poll1");
    expect(reads).toEqual([
      ["polls", { project_id: "p1" }],
      ["responses", { poll_id: "poll1" }],
    ]);
  });

  it("guarda como texto las preguntas y las respuestas, y devuelve el _id", async () => {
    const created: Row[] = [];
    const repo = new PollRepositoryImpl(
      fake<PollDataSource>({
        createPoll: async (row) => (created.push(row), { ...row, _id: "poll_nueva" }),
        createResponse: async (row) => (created.push(row), { ...row, _id: "r_nueva" }),
      }),
    );
    expect((await repo.createPoll(poll)).id).toBe("poll_nueva");
    expect((await repo.createResponse(newPollResponse({ pollId: "poll_nueva", respondentId: "u2", answers: [1] }))).id).toBe("r_nueva");
    expect(created[0].questions).toBe('[{"text":"¿Sirve?","options":["Sí","No"]}]');
    expect(created[1].answers).toBe("[1]");
  });

  it("traduce el error de Roble", async () => {
    const repo = new PollRepositoryImpl(
      fake<PollDataSource>({
        readPolls: async () => {
          throw new RobleApiHttpException(500, "caido");
        },
      }),
    );
    await expect(repo.getPollsForProject("p1")).rejects.toBeInstanceOf(PollFailure);
  });
});

describe("PollRepository en memoria", () => {
  it("crea una encuesta y su respuesta, y las lee de vuelta", async () => {
    const repo = new PollRepositoryImpl(new PollInMemoryDataSource(new DummyData({ latencyMs: 0 })));
    const created = await repo.createPoll(poll);
    await repo.createResponse(newPollResponse({ pollId: created.id!, respondentId: "u2", answers: [0] }));
    expect((await repo.getPollsForProject("p1")).map((p) => p.id)).toEqual([created.id]);
    expect((await repo.getResponsesForPoll(created.id!)).map((r) => r.answers)).toEqual([[0]]);
  });
});
