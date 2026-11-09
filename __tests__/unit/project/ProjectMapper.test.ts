import { ProjectMapper } from "@/src/features/project/data/mappers/ProjectMapper";
import { ProjectTypeMapper } from "@/src/features/project/data/mappers/ProjectTypeMapper";
import { newProject } from "@/src/features/project/domain/entities/Project";

// La tabla `projects` contra `Project` de Flutter (`project_model_test.dart`).
// Los objetos esperados son lo que imprime `toJsonNoId` en Dart para los
// mismos datos.
describe("ProjectMapper", () => {
  const project = newProject({
    id: "p1",
    title: "App de movilidad sostenible",
    problem: "Pierden dos horas",
    description: "Rutas compartidas",
    stage: "teamFormation",
    academicProgram: "Arquitectura",
    currentMembers: 1,
    maxMembers: 5,
    skillsWanted: ["Análisis de datos", "Diseño UX"],
    tags: ["Sostenibilidad"],
    leaderId: "u_lider",
    innovationType: "ambiental",
  });

  it("toNewRow escribe exactamente lo que toJsonNoId de Flutter", () => {
    expect(ProjectMapper.toNewRow(project)).toStrictEqual({
      title: "App de movilidad sostenible",
      problem: "Pierden dos horas",
      description: "Rutas compartidas",
      stage: "teamFormation",
      academic_program: "Arquitectura",
      current_members: 1,
      max_members: 5,
      skills_wanted: '["Análisis de datos","Diseño UX"]',
      tags: '["Sostenibilidad"]',
      leader_id: "u_lider",
      recruitment_open: true,
    });
  });

  it("toNewRow con listas vacias y reclutamiento cerrado", () => {
    const row = ProjectMapper.toNewRow(
      newProject({
        title: "T",
        problem: "P",
        description: "D",
        stage: "idea",
        academicProgram: "Ing. de Sistemas",
        currentMembers: 1,
        maxMembers: 4,
        skillsWanted: [],
        leaderId: "l1",
        recruitmentOpen: false,
      }),
    );
    expect(row).toStrictEqual({
      title: "T",
      problem: "P",
      description: "D",
      stage: "idea",
      academic_program: "Ing. de Sistemas",
      current_members: 1,
      max_members: 4,
      skills_wanted: "[]",
      tags: "[]",
      leader_id: "l1",
      recruitment_open: false,
    });
  });

  it("fromRow de una fila escrita por Flutter", () => {
    const p = ProjectMapper.fromRow({
      _id: "p100",
      title: "Proyecto Test",
      problem: "Problema test",
      description: "Descripcion test",
      stage: "research",
      academic_program: "Ingenieria de Sistemas",
      current_members: 2,
      max_members: 4,
      skills_wanted: ["Flutter", "Dart"],
      tags: ["Tech", "Mobile"],
      leader_id: "leader123",
      recruitment_open: true,
    });
    expect(p).toEqual({
      id: "p100",
      title: "Proyecto Test",
      problem: "Problema test",
      description: "Descripcion test",
      stage: "research",
      academicProgram: "Ingenieria de Sistemas",
      currentMembers: 2,
      maxMembers: 4,
      skillsWanted: ["Flutter", "Dart"],
      tags: ["Tech", "Mobile"],
      leaderId: "leader123",
      recruitmentOpen: true,
      innovationType: null,
    });
  });

  it("fromRow lee las listas que llegan como texto JSON", () => {
    const p = ProjectMapper.fromRow({ skills_wanted: '["UI/UX","Figma"]', tags: '["Design"]', recruitment_open: "true" });
    expect(p.skillsWanted).toEqual(["UI/UX", "Figma"]);
    expect(p.tags).toEqual(["Design"]);
    expect(p.recruitmentOpen).toBe(true);
  });

  it("fromRow con datos que faltan o vienen mal da los valores por omision de Flutter", () => {
    const p = ProjectMapper.fromRow({
      current_members: "texto_invalido",
      max_members: null,
      skills_wanted: null,
      tags: "cadena_no_json",
      stage: "etapa_desconocida",
      recruitment_open: "no_es_bool",
    });
    // Lo que da `Project.fromJson` en Dart: null idea 0 0 [] [] false.
    expect(p).toEqual({
      id: null,
      title: "",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "",
      currentMembers: 0,
      maxMembers: 0,
      skillsWanted: [],
      tags: [],
      leaderId: "",
      recruitmentOpen: false,
      innovationType: null,
    });
    // Sin la columna, el reclutamiento sigue abierto.
    expect(ProjectMapper.fromRow({}).recruitmentOpen).toBe(true);
  });

  it("ida y vuelta: lo que se manda vuelve igual", () => {
    const back = ProjectMapper.fromRow({ _id: "p1", ...ProjectMapper.toNewRow(project) }, "ambiental");
    expect(back).toEqual(project);
  });
});

describe("ProjectTypeMapper", () => {
  it("toNewRow es la fila de project_types", () => {
    expect(ProjectTypeMapper.toNewRow("p1", "social")).toStrictEqual({ project_id: "p1", innovation_type: "social" });
  });

  it("fromRow lee la fila, y una clave desconocida es otros", () => {
    expect(ProjectTypeMapper.fromRow({ _id: "t1", project_id: "p1", innovation_type: "educativa" })).toEqual({
      id: "t1",
      projectId: "p1",
      innovationType: "educativa",
    });
    expect(ProjectTypeMapper.fromRow({ project_id: "p1", innovation_type: "espacial" }).innovationType).toBe("otros");
  });

  it("ida y vuelta", () => {
    expect(ProjectTypeMapper.fromRow({ _id: "t9", ...ProjectTypeMapper.toNewRow("p3", "tecnologica") })).toEqual({
      id: "t9",
      projectId: "p3",
      innovationType: "tecnologica",
    });
  });
});
