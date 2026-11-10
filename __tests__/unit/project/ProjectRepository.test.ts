import { RobleApiHttpException } from "roble-client";

import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { ProjectDataSource } from "@/src/features/project/data/datasources/ProjectDataSource";
import { ProjectInMemoryDataSource } from "@/src/features/project/data/datasources/ProjectInMemoryDataSource";
import { ProjectRepositoryImpl } from "@/src/features/project/data/repositories/ProjectRepositoryImpl";
import { acceptsApplications, isFull, newProject, Project } from "@/src/features/project/domain/entities/Project";
import { PROJECT_STAGES } from "@/src/features/project/domain/entities/ProjectStage";
import { ProjectFailure } from "@/src/features/project/domain/ProjectFailure";
import { fake } from "@/__tests__/support/fake";

const draft = newProject({
  title: "Nueva",
  problem: "P",
  description: "D",
  stage: "idea",
  academicProgram: "Psicología",
  currentMembers: 1,
  maxMembers: 3,
  skillsWanted: ["Python"],
  tags: ["Social"],
  leaderId: "u_lider",
});

// `roble_project_source_test.dart`: lo que el repositorio le manda a la fuente.
describe("ProjectRepository con una fuente falsa", () => {
  function sourceWith(rows: Row[], typeRows: Row[] = []) {
    const updates: [string, Row][] = [];
    const created: Row[] = [];
    const createdTypes: Row[] = [];
    const source = fake<ProjectDataSource>({
      readProjects: async () => rows,
      readProjectTypes: async () => typeRows,
      projectById: async (id) => rows.find((r) => r._id === id) ?? null,
      updateProject: async (id, changes) => {
        updates.push([id, changes]);
      },
      createProject: async (row) => {
        created.push(row);
        return { ...row, _id: "nuevo_1" };
      },
      createProjectType: async (row) => {
        createdTypes.push(row);
        return { ...row, _id: "tipo_1" };
      },
    });
    return { repo: new ProjectRepositoryImpl(source), updates, created, createdTypes };
  }

  it("getProjects devuelve la lista convertida, en el orden de la fuente, con su tipo", async () => {
    const { repo } = sourceWith(
      [
        { _id: "b", title: "B", skills_wanted: '["Python"]' },
        { _id: "a", title: "A" },
      ],
      [{ project_id: "a", innovation_type: "social" }],
    );
    const projects = await repo.getProjects();
    expect(projects.map((p) => [p.id, p.title, p.innovationType])).toEqual([
      ["b", "B", null],
      ["a", "A", "social"],
    ]);
    expect(projects[0].skillsWanted).toEqual(["Python"]);
  });

  it("getProjects traduce el error de Roble", async () => {
    const repo = new ProjectRepositoryImpl(
      fake<ProjectDataSource>({
        readProjects: async () => {
          throw new RobleApiHttpException(500, "caido");
        },
        readProjectTypes: async () => [],
      }),
    );
    await expect(repo.getProjects()).rejects.toBeInstanceOf(ProjectFailure);
  });

  it("createProject inserta la fila de Flutter, y el tipo aparte solo si lo hay", async () => {
    const { repo, created, createdTypes } = sourceWith([]);
    const sinTipo = await repo.createProject(draft);
    expect(created[0].skills_wanted).toBe('["Python"]');
    expect(created[0]).not.toHaveProperty("innovation_type");
    expect(sinTipo.id).toBe("nuevo_1");
    expect(createdTypes).toEqual([]);

    const conTipo = await repo.createProject({ ...draft, innovationType: "social" });
    expect(createdTypes).toEqual([{ project_id: "nuevo_1", innovation_type: "social" }]);
    expect(conTipo.innovationType).toBe("social");
  });

  it("closeRecruitment actualiza recruitment_open a false", async () => {
    const { repo, updates } = sourceWith([]);
    await repo.closeRecruitment("p1");
    expect(updates).toEqual([["p1", { recruitment_open: false }]]);
  });

  it("addMember suma uno si no esta lleno, y no toca un equipo lleno", async () => {
    const { repo, updates } = sourceWith([
      { _id: "p1", current_members: 2, max_members: 4 },
      { _id: "p2", current_members: "4", max_members: "4" },
    ]);
    await repo.addMember("p1");
    await repo.addMember("p2");
    expect(updates).toEqual([["p1", { current_members: 3 }]]);
  });

  it("removeMember resta uno y nunca baja de 1, que es el lider", async () => {
    const { repo, updates } = sourceWith([
      { _id: "p1", current_members: 3, max_members: 4 },
      { _id: "p2", current_members: 1, max_members: 4 },
    ]);
    await repo.removeMember("p1");
    await repo.removeMember("p2");
    await repo.removeMember("no_existe");
    expect(updates).toEqual([["p1", { current_members: 2 }]]);
  });

  it("updateStage escribe el nombre de la etapa en la columna stage", async () => {
    const { repo, updates } = sourceWith([]);
    await repo.updateStage("p1", "teamFormation");
    expect(updates).toEqual([["p1", { stage: "teamFormation" }]]);
  });
});

// `local_project_source_test.dart`, sobre los datos en memoria.
describe("ProjectRepository en memoria", () => {
  let data: DummyData;
  let repo: ProjectRepositoryImpl;
  const byId = async (id: string) => (await repo.getProjects()).find((p) => p.id === id) as Project;

  beforeEach(() => {
    data = new DummyData({ latencyMs: 0 });
    repo = new ProjectRepositoryImpl(new ProjectInMemoryDataSource(data));
  });

  it("devuelve los seis proyectos de Flutter, con titulo y programa", async () => {
    const projects = await repo.getProjects();
    expect(projects).toHaveLength(6);
    for (const p of projects) {
      expect(p.title).not.toBe("");
      expect(p.academicProgram).not.toBe("");
    }
  });

  it("las seis etapas estan representadas, hay uno lleno y uno sin habilidades", async () => {
    const projects = await repo.getProjects();
    expect(new Set(projects.map((p) => p.stage))).toEqual(new Set(PROJECT_STAGES));
    const full = projects.find((p) => p.id === "4")!;
    expect(isFull(full)).toBe(true);
    expect(acceptsApplications(full)).toBe(false);
    expect(projects.some((p) => p.skillsWanted.length === 0)).toBe(true);
  });

  it("createProject asigna un id nuevo y lo deja primero en la lista", async () => {
    const created = await repo.createProject(draft);
    expect(created.id).toBeTruthy();
    const projects = await repo.getProjects();
    expect(projects[0].id).toBe(created.id);
    expect(projects).toHaveLength(7);
  });

  it("un proyecto con reclutamiento cerrado no acepta postulaciones", async () => {
    await repo.closeRecruitment("1");
    expect(acceptsApplications(await byId("1"))).toBe(false);
  });

  it("addMember sube el contador sin pasar de maxMembers", async () => {
    await repo.addMember("2");
    expect((await byId("2")).currentMembers).toBe(3);
    await repo.addMember("2");
    await repo.addMember("2");
    const full = await byId("2");
    expect(full.currentMembers).toBe(4);
    expect(acceptsApplications(full)).toBe(false);
  });

  it("removeMember resta uno, nunca baja de 1, y deja cupo en un equipo lleno", async () => {
    await repo.removeMember("4");
    expect(acceptsApplications(await byId("4"))).toBe(true);
    for (let i = 0; i < 10; i++) await repo.removeMember("5");
    expect((await byId("5")).currentMembers).toBe(1);
    await expect(repo.removeMember("no_existe")).resolves.toBeUndefined();
  });

  it("updateStage cambia solo la etapa y deja el orden de la lista como estaba", async () => {
    const before = await repo.getProjects();
    await repo.updateStage("2", "prototype");
    const after = await repo.getProjects();
    expect(after.map((p) => p.id)).toEqual(before.map((p) => p.id));
    expect(after[1]).toEqual({ ...before[1], stage: "prototype" });
  });

  it("los tipos sembrados en project_types llegan al proyecto", async () => {
    expect((await byId("3")).innovationType).toBe("tecnologica");
    expect((await byId("2")).innovationType).toBeNull();
  });
});
