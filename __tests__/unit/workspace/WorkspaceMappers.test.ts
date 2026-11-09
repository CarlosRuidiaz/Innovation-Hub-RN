import { MilestoneMapper } from "@/src/features/workspace/data/mappers/MilestoneMapper";
import { ProgressUpdateMapper } from "@/src/features/workspace/data/mappers/ProgressUpdateMapper";
import { ProjectTaskMapper } from "@/src/features/workspace/data/mappers/ProjectTaskMapper";
import { newMilestone } from "@/src/features/workspace/domain/entities/Milestone";
import { newProgressUpdate } from "@/src/features/workspace/domain/entities/ProgressUpdate";
import { newProjectTask } from "@/src/features/workspace/domain/entities/ProjectTask";

// Las tablas `milestones`, `progress_updates` y `tasks` contra los modelos de
// Flutter (`workspace_models_test.dart`).
describe("MilestoneMapper", () => {
  it("toNewRow manda la fecha como texto ISO 8601 en hora local y sin _id", () => {
    expect(MilestoneMapper.toNewRow(newMilestone({ id: "m1", projectId: "p1", title: "Prototipo", dueDate: new Date(2026, 9, 30) }))).toStrictEqual({
      project_id: "p1",
      title: "Prototipo",
      due_date: "2026-10-30T00:00:00.000",
      done: false,
    });
  });

  it("fromRow lee las columnas de la tabla", () => {
    expect(
      MilestoneMapper.fromRow({ _id: "m1", project_id: "p1", title: "Prototipo", due_date: "2026-10-30T00:00:00.000", done: true }),
    ).toEqual({ id: "m1", projectId: "p1", title: "Prototipo", dueDate: new Date(2026, 9, 30), done: true });
  });

  it("con datos que faltan o vienen mal no revienta", () => {
    const m = MilestoneMapper.fromRow({ title: null, due_date: null, done: "invalido" });
    expect(m).toEqual({ id: null, projectId: "", title: "", dueDate: new Date(0), done: false });
    expect(MilestoneMapper.fromRow({ id: "m2", done: "true" })).toMatchObject({ id: "m2", done: true });
  });

  it("ida y vuelta", () => {
    const m = newMilestone({ projectId: "p1", title: "Entrega final", dueDate: new Date(2026, 11, 1, 8, 30), done: true });
    expect(MilestoneMapper.fromRow({ _id: "m9", ...MilestoneMapper.toNewRow(m) })).toEqual({ ...m, id: "m9" });
  });
});

describe("ProgressUpdateMapper", () => {
  const update = newProgressUpdate({
    projectId: "p1",
    authorId: "a1",
    authorName: "Ana",
    title: "Primer avance",
    description: "Arrancamos",
    createdAt: new Date(2026, 8, 23, 10, 15),
    completionPercentage: 60,
  });

  it("toNewRow manda los opcionales como texto vacio", () => {
    expect(ProgressUpdateMapper.toNewRow(update)).toStrictEqual({
      project_id: "p1",
      author_id: "a1",
      author_name: "Ana",
      title: "Primer avance",
      description: "Arrancamos",
      created_at: "2026-09-23T10:15:00.000",
      completion_percentage: 60,
      video_url: "",
      milestone_id: "",
    });
  });

  it("toNewRow con video y hito", () => {
    expect(
      ProgressUpdateMapper.toNewRow({ ...update, title: "t", description: "d", completionPercentage: 100, videoUrl: "https://video.test/1", milestoneId: "m1" }),
    ).toStrictEqual({
      project_id: "p1",
      author_id: "a1",
      author_name: "Ana",
      title: "t",
      description: "d",
      created_at: "2026-09-23T10:15:00.000",
      completion_percentage: 100,
      video_url: "https://video.test/1",
      milestone_id: "m1",
    });
  });

  it("fromRow con datos que faltan o vienen mal da los valores por omision de Flutter", () => {
    // `ProgressUpdate.fromJson` en Dart: 100 null 0.
    const u = ProgressUpdateMapper.fromRow({ completion_percentage: "150", video_url: "  ", created_at: "no_es_fecha" });
    expect(u.completionPercentage).toBe(100);
    expect(u.videoUrl).toBeNull();
    expect(u.createdAt.getTime()).toBe(0);
    expect(ProgressUpdateMapper.fromRow({ completion_percentage: "no_es_numero" }).completionPercentage).toBe(0);
    expect(ProgressUpdateMapper.fromRow({ milestone_id: "   " }).milestoneId).toBeNull();
  });

  it("ida y vuelta", () => {
    const full = { ...update, videoUrl: "https://video.test/1", milestoneId: "m1" };
    expect(ProgressUpdateMapper.fromRow({ _id: "u1", ...ProgressUpdateMapper.toNewRow(full) })).toEqual({ ...full, id: "u1" });
  });
});

describe("ProjectTaskMapper", () => {
  it("toNewRow escribe exactamente lo que toJsonNoId de Flutter", () => {
    expect(ProjectTaskMapper.toNewRow(newProjectTask({ projectId: "p1", title: "Diseñar logo", assigneeName: "Luis", done: true }))).toStrictEqual({
      project_id: "p1",
      title: "Diseñar logo",
      assignee_name: "Luis",
      done: true,
    });
  });

  it("fromRow con datos que faltan no revienta", () => {
    expect(ProjectTaskMapper.fromRow({ title: null, assignee_name: null })).toEqual({
      id: null,
      projectId: "",
      title: "",
      assigneeName: "",
      done: false,
    });
  });

  it("ida y vuelta", () => {
    const t = newProjectTask({ projectId: "p1", title: "Crear pruebas", assigneeName: "Carlos" });
    expect(ProjectTaskMapper.fromRow({ _id: "t1", ...ProjectTaskMapper.toNewRow(t) })).toEqual({ ...t, id: "t1" });
  });
});
