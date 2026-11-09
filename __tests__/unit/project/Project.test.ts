import { acceptsApplications, acceptsApplicationsFrom, isFull, matchesAnySkill, newProject } from "@/src/features/project/domain/entities/Project";

// Las reglas de `Project` (`project_model_test.dart` y `project_test.dart`).
const base = newProject({
  id: "p1",
  title: "Proyecto Abierto",
  problem: "",
  description: "",
  stage: "idea",
  academicProgram: "",
  currentMembers: 1,
  maxMembers: 4,
  skillsWanted: ["Diseño UX", " Python "],
  leaderId: "lider1",
});

describe("Project", () => {
  it("isFull cuando los miembros llegan al maximo o lo superan", () => {
    expect(isFull({ ...base, currentMembers: 4 })).toBe(true);
    expect(isFull({ ...base, currentMembers: 5 })).toBe(true);
    expect(isFull({ ...base, currentMembers: 2 })).toBe(false);
  });

  it("acepta postulaciones si esta abierto y con cupo", () => {
    expect(acceptsApplications(base)).toBe(true);
    expect(acceptsApplications({ ...base, recruitmentOpen: false })).toBe(false);
    expect(acceptsApplications({ ...base, currentMembers: 4 })).toBe(false);
  });

  it("el lider no puede postularse a su propio proyecto", () => {
    expect(acceptsApplicationsFrom(base, "lider1")).toBe(false);
    expect(acceptsApplicationsFrom(base, "otro_usuario")).toBe(true);
    expect(acceptsApplicationsFrom(base, null)).toBe(true);
    expect(acceptsApplicationsFrom({ ...base, recruitmentOpen: false }, "otro_usuario")).toBe(false);
  });

  it("matchesAnySkill no distingue mayusculas ni espacios de sobra", () => {
    expect(matchesAnySkill(base, ["diseño ux"])).toBe(true);
    expect(matchesAnySkill(base, ["PYTHON"])).toBe(true);
    expect(matchesAnySkill(base, ["Marketing"])).toBe(false);
  });

  it("sin habilidades del estudiante no encaja con nada", () => {
    expect(matchesAnySkill(base, [])).toBe(false);
    expect(matchesAnySkill(base, ["  "])).toBe(false);
    expect(matchesAnySkill({ ...base, skillsWanted: [] }, ["Python"])).toBe(false);
  });

  it("los dos campos de la segunda fase arrancan vacios", () => {
    expect(base.innovationType).toBeNull();
    expect(base.tags).toEqual([]);
    expect(base.recruitmentOpen).toBe(true);
  });
});
