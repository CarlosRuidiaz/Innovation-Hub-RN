import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { WorkspaceDataSource } from "@/src/features/workspace/data/datasources/WorkspaceDataSource";
import { WorkspaceInMemoryDataSource } from "@/src/features/workspace/data/datasources/WorkspaceInMemoryDataSource";
import { WorkspaceRepositoryImpl } from "@/src/features/workspace/data/repositories/WorkspaceRepositoryImpl";
import { newMilestone } from "@/src/features/workspace/domain/entities/Milestone";
import { newProgressUpdate } from "@/src/features/workspace/domain/entities/ProgressUpdate";
import { newProjectTask } from "@/src/features/workspace/domain/entities/ProjectTask";
import { fake } from "@/__tests__/support/fake";

const update = (createdAt: Date, milestoneId: string | null = null) =>
  newProgressUpdate({
    projectId: "p1",
    authorId: "a1",
    authorName: "Ana",
    title: "Avance",
    description: "d",
    createdAt,
    completionPercentage: 50,
    milestoneId,
  });

// `roble_workspace_source_test.dart`: lo que el repositorio le manda a la fuente.
describe("WorkspaceRepository con una fuente falsa", () => {
  function source() {
    const calls: [string, ...unknown[]][] = [];
    const record =
      (name: string, result: unknown = undefined) =>
      async (...args: unknown[]) => {
        calls.push([name, ...args]);
        return typeof result === "function" ? result(...args) : result;
      };
    const ds = fake<WorkspaceDataSource>({
      readMilestones: record("readMilestones", []) as WorkspaceDataSource["readMilestones"],
      createMilestone: record("createMilestone", (row: Row) => ({ ...row, _id: "m_nuevo" })) as WorkspaceDataSource["createMilestone"],
      updateMilestone: record("updateMilestone") as WorkspaceDataSource["updateMilestone"],
      readUpdates: record("readUpdates", [
        { _id: "viejo", created_at: "2026-01-01T00:00:00.000" },
        { _id: "nuevo", created_at: "2026-03-01T00:00:00.000" },
      ]) as WorkspaceDataSource["readUpdates"],
      createUpdate: record("createUpdate", (row: Row) => ({ ...row, _id: "u_nuevo" })) as WorkspaceDataSource["createUpdate"],
      readTasks: record("readTasks", []) as WorkspaceDataSource["readTasks"],
      createTask: record("createTask", (row: Row) => ({ ...row, _id: "t_nuevo" })) as WorkspaceDataSource["createTask"],
      updateTask: record("updateTask") as WorkspaceDataSource["updateTask"],
    });
    return { repo: new WorkspaceRepositoryImpl(ds), calls };
  }

  it("cada lectura filtra por project_id", async () => {
    const { repo, calls } = source();
    await repo.getMilestones("p1");
    await repo.getTasks("p1");
    await repo.getUpdates("p1");
    expect(calls).toEqual([
      ["readMilestones", { project_id: "p1" }],
      ["readTasks", { project_id: "p1" }],
      ["readUpdates", { project_id: "p1" }],
    ]);
  });

  it("getUpdates devuelve el mas nuevo primero", async () => {
    const { repo } = source();
    expect((await repo.getUpdates("p1")).map((u) => u.id)).toEqual(["nuevo", "viejo"]);
  });

  it("addMilestone y addTask mandan las columnas de la tabla y devuelven el _id", async () => {
    const { repo, calls } = source();
    const m = await repo.addMilestone(newMilestone({ projectId: "p1", title: "Hito", dueDate: new Date(2026, 0, 2) }));
    const t = await repo.addTask(newProjectTask({ projectId: "p1", title: "Tarea", assigneeName: "Luis" }));
    expect(m.id).toBe("m_nuevo");
    expect(t.id).toBe("t_nuevo");
    expect(calls[0]).toEqual(["createMilestone", { project_id: "p1", title: "Hito", due_date: "2026-01-02T00:00:00.000", done: false }]);
    expect(calls[1]).toEqual(["createTask", { project_id: "p1", title: "Tarea", assignee_name: "Luis", done: false }]);
  });

  it("setMilestoneDone y setTaskDone actualizan la columna done", async () => {
    const { repo, calls } = source();
    await repo.setMilestoneDone("m1", true);
    await repo.setTaskDone("t1", false);
    expect(calls).toEqual([
      ["updateMilestone", "m1", { done: true }],
      ["updateTask", "t1", { done: false }],
    ]);
  });

  it("publishUpdate manda el porcentaje, y con hito lo marca cumplido", async () => {
    const { repo, calls } = source();
    await repo.publishUpdate(update(new Date(2026, 0, 1)));
    expect(calls).toHaveLength(1);
    expect((calls[0][1] as Row).completion_percentage).toBe(50);
    await repo.publishUpdate(update(new Date(2026, 0, 1), "m1"));
    expect(calls[2]).toEqual(["updateMilestone", "m1", { done: true }]);
  });
});

// `local_workspace_source_test.dart`, sobre los datos en memoria.
describe("WorkspaceRepository en memoria", () => {
  let repo: WorkspaceRepositoryImpl;

  beforeEach(() => {
    repo = new WorkspaceRepositoryImpl(new WorkspaceInMemoryDataSource(new DummyData({ latencyMs: 0 })));
  });

  it("addMilestone asigna un id y getMilestones filtra por proyecto", async () => {
    const m = await repo.addMilestone(newMilestone({ projectId: "p9", title: "Hito", dueDate: new Date(2026, 0, 2) }));
    expect(m.id).toBeTruthy();
    expect((await repo.getMilestones("p9")).map((x) => x.id)).toEqual([m.id]);
    await repo.setMilestoneDone(m.id!, true);
    expect((await repo.getMilestones("p9"))[0].done).toBe(true);
  });

  it("addTask asigna un id y setTaskDone la marca", async () => {
    const t = await repo.addTask(newProjectTask({ projectId: "p9", title: "Tarea", assigneeName: "Luis" }));
    await repo.setTaskDone(t.id!, true);
    expect(await repo.getTasks("p9")).toEqual([{ ...t, done: true }]);
  });

  it("publishUpdate ordena por fecha descendente y cumple el hito que referencia", async () => {
    const m = await repo.addMilestone(newMilestone({ projectId: "p1", title: "Hito", dueDate: new Date(2026, 0, 2) }));
    await repo.publishUpdate(update(new Date(2026, 0, 1)));
    await repo.publishUpdate(update(new Date(2026, 2, 1), m.id));
    const updates = await repo.getUpdates("p1");
    expect(updates.map((u) => u.createdAt)).toEqual([new Date(2026, 2, 1), new Date(2026, 0, 1)]);
    expect((await repo.getMilestones("p1"))[0].done).toBe(true);
  });
});
