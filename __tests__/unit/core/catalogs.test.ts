import fs from "fs";
import path from "path";

import { academicPrograms, AppCatalogs, innovationTypeOf, innovationTypes, skills, tags } from "@/src/core/catalogs";
import { DummyData } from "@/src/core/data/dummyData";
import { listOf } from "@/src/core/roble/rowFormat";

// El emparejamiento entre proyectos y estudiantes depende de que unos y otros
// hablen el mismo vocabulario (`app_catalogs_test.dart`). Estas pruebas son
// baratas y evitan que alguien siembre "Flutter" o "Ingeniería Civil" y rompa
// el emparejamiento sin enterarse.
describe("catalogos", () => {
  const data = new DummyData({ latencyMs: 0 });

  it("tiene los mismos valores que Flutter, en el mismo orden", () => {
    expect(skills).toEqual(["Diseño UX", "Desarrollo web", "Python", "Investigación", "Marketing", "Análisis de datos", "Gestión"]);
    expect(tags).toEqual(["Educación", "Tutorías", "Sostenibilidad", "Social", "Comunidad", "Tecnología"]);
    expect(academicPrograms).toEqual(["Ing. de Sistemas", "Diseño Industrial", "Administración", "Arquitectura", "Psicología"]);
  });

  it("no hay valores repetidos en ninguna lista", () => {
    for (const list of [skills, tags, academicPrograms]) expect(new Set(list).size).toBe(list.length);
  });

  it("todas las habilidades sembradas estan en el catalogo", () => {
    const seeded = [
      ...data.projects.flatMap((p) => listOf(p.skills_wanted)),
      ...data.applications.flatMap((a) => listOf(a.skills_offered)),
      ...data.users.flatMap((u) => u.extra.skills as string[]),
    ];
    for (const skill of seeded) expect(skills).toContain(skill);
  });

  it("todos los programas sembrados estan en el catalogo", () => {
    const seeded = [
      ...data.projects.map((p) => p.academic_program),
      ...data.applications.map((a) => a.applicant_program),
      ...data.users.map((u) => u.extra.academicProgram),
    ];
    for (const program of seeded) expect(academicPrograms).toContain(program);
  });

  it("todos los tags sembrados estan en el catalogo", () => {
    for (const tag of data.projects.flatMap((p) => listOf(p.tags))) expect(tags).toContain(tag);
  });

  it("el perfil de la demo comparte habilidad con algun proyecto", () => {
    // Si esto falla, la pestaña "Para tus habilidades" sale vacia siempre y la
    // app parece rota aunque el codigo este bien.
    const demo = data.users.find((u) => u.email === DummyData.demoEmail)!;
    const mine = new Set<string>(demo.extra.skills);
    expect(data.projects.some((p) => listOf(p.skills_wanted).some((s) => mine.has(s)))).toBe(true);
  });

  describe("tipos de innovacion", () => {
    it("son los seis de la segunda fase, con su etiqueta e icono", () => {
      expect(innovationTypes.map((t) => [t.key, t.label, t.icon])).toEqual([
        ["social", "Social", "groups"],
        ["tecnologica", "Tecnológica", "memory"],
        ["ambiental", "Ambiental", "eco"],
        ["educativa", "Educativa", "menu-book"],
        ["empresarial", "Empresarial", "work-outline"],
        ["otros", "Otros", "lightbulb-outline"],
      ]);
    });

    it("una clave nula, vacia o desconocida es otros", () => {
      expect(innovationTypeOf("ambiental").label).toBe("Ambiental");
      expect(innovationTypeOf(null).key).toBe("otros");
      expect(innovationTypeOf(undefined).key).toBe("otros");
      expect(innovationTypeOf("").key).toBe("otros");
      expect(innovationTypeOf("espacial").key).toBe("otros");
    });

    it("cada icono existe en MaterialIcons", () => {
      const glyphs = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialIcons.json"),
          "utf8",
        ),
      );
      for (const type of innovationTypes) expect(glyphs).toHaveProperty([type.icon]);
    });

    it("los tipos sembrados son claves del catalogo", () => {
      for (const row of data.projectTypes) expect(innovationTypes.map((t) => t.key)).toContain(row.innovation_type);
    });
  });

  it("las constantes con nombre son los mismos textos", () => {
    expect(AppCatalogs.skillUx).toBe("Diseño UX");
    expect(AppCatalogs.programSystems).toBe("Ing. de Sistemas");
    expect(AppCatalogs.tagTechnology).toBe("Tecnología");
  });
});
