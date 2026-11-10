import { RobleApiHttpException } from "roble-client";

import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { FollowDataSource } from "@/src/features/follow/data/datasources/FollowDataSource";
import { FollowInMemoryDataSource } from "@/src/features/follow/data/datasources/FollowInMemoryDataSource";
import { FollowRepositoryImpl } from "@/src/features/follow/data/repositories/FollowRepositoryImpl";
import { FollowFailure } from "@/src/features/follow/domain/FollowFailure";
import { fake } from "@/__tests__/support/fake";

// `roble_follow_source_test.dart`: lo que el repositorio le manda a la fuente.
describe("FollowRepository con una fuente falsa", () => {
  function sourceWith(rows: Row[]) {
    const reads: Row[] = [];
    const created: Row[] = [];
    const updates: [string, Row][] = [];
    const source = fake<FollowDataSource>({
      readFollows: async (filters) => {
        reads.push(filters);
        return rows;
      },
      createFollow: async (row) => {
        created.push(row);
        return { ...row, _id: "f_nuevo" };
      },
      updateFollow: async (id, changes) => {
        updates.push([id, changes]);
      },
    });
    return { repo: new FollowRepositoryImpl(source), reads, created, updates };
  }

  it("getFollowsByUser pide los activos de ese usuario", async () => {
    const { repo, reads } = sourceWith([{ _id: "f1", project_id: "p1", user_id: "u1", active: true }]);
    expect(await repo.getFollowsByUser("u1")).toHaveLength(1);
    expect(reads).toEqual([{ user_id: "u1", active: true }]);
  });

  it("getFollowsByUser traduce el error de Roble", async () => {
    const repo = new FollowRepositoryImpl(
      fake<FollowDataSource>({
        readFollows: async () => {
          throw new RobleApiHttpException(500, "caido");
        },
      }),
    );
    await expect(repo.getFollowsByUser("u1")).rejects.toBeInstanceOf(FollowFailure);
  });

  it("getFollow pide por user_id y project_id, y sin filas es null", async () => {
    const { repo, reads } = sourceWith([]);
    expect(await repo.getFollow("u1", "p1")).toBeNull();
    expect(reads).toEqual([{ user_id: "u1", project_id: "p1" }]);
  });

  it("toggleFollow crea la fila de Flutter si no existe", async () => {
    const { repo, created } = sourceWith([]);
    const f = await repo.toggleFollow("u1", "p1", true);
    expect(created).toEqual([{ project_id: "p1", user_id: "u1", active: true }]);
    expect(f.id).toBe("f_nuevo");
  });

  it("toggleFollow actualiza solo active en la que existe, sin duplicar", async () => {
    const { repo, created, updates } = sourceWith([{ _id: "f1", project_id: "p1", user_id: "u1", active: true }]);
    expect((await repo.toggleFollow("u1", "p1", false)).active).toBe(false);
    expect(updates).toEqual([["f1", { active: false }]]);
    expect(created).toEqual([]);
    // Si no cambia, no escribe.
    await repo.toggleFollow("u1", "p1", true);
    expect(updates).toHaveLength(1);
  });
});

// `local_follow_source_test.dart`: seguir y dejar de seguir no duplica fila.
describe("FollowRepository en memoria", () => {
  it("seguir y dejar de seguir no duplica fila", async () => {
    const data = new DummyData({ latencyMs: 0 });
    const repo = new FollowRepositoryImpl(new FollowInMemoryDataSource(data));
    await repo.toggleFollow("1", "3", true);
    await repo.toggleFollow("1", "3", false);
    await repo.toggleFollow("1", "3", true);
    expect(data.follows.filter((f) => f.user_id === "1" && f.project_id === "3")).toHaveLength(1);
    expect((await repo.getFollowsByUser("1")).map((f) => f.projectId)).toEqual(["3"]);
    await repo.toggleFollow("u8", "2", false);
    expect(await repo.getFollowsByUser("u8")).toEqual([]);
    expect((await repo.getFollow("u8", "2"))?.active).toBe(false);
  });
});
