// Vocabulario cerrado de la aplicacion: la traduccion de
// `lib/core/app_catalogs.dart`, con los mismos valores en el mismo orden. Que
// las habilidades salgan de una lista y no de un campo de texto es lo que
// permite emparejar proyectos con estudiantes.
//
// TypeScript puro: no importa React ni ninguna funcionalidad. Ningun otro
// archivo escribe una habilidad, un tag o un programa a mano; quien siembra
// datos de prueba usa las constantes con nombre, no el indice de la lista.

export const AppCatalogs = {
  skillUx: "Diseño UX",
  skillWeb: "Desarrollo web",
  skillPython: "Python",
  skillResearch: "Investigación",
  skillMarketing: "Marketing",
  skillData: "Análisis de datos",
  skillManagement: "Gestión",

  tagEducation: "Educación",
  tagTutoring: "Tutorías",
  tagSustainability: "Sostenibilidad",
  tagSocial: "Social",
  tagCommunity: "Comunidad",
  tagTechnology: "Tecnología",

  programSystems: "Ing. de Sistemas",
  programIndustrialDesign: "Diseño Industrial",
  programBusiness: "Administración",
  programArchitecture: "Arquitectura",
  programPsychology: "Psicología",
} as const;

export const skills: readonly string[] = [
  AppCatalogs.skillUx,
  AppCatalogs.skillWeb,
  AppCatalogs.skillPython,
  AppCatalogs.skillResearch,
  AppCatalogs.skillMarketing,
  AppCatalogs.skillData,
  AppCatalogs.skillManagement,
];

export const tags: readonly string[] = [
  AppCatalogs.tagEducation,
  AppCatalogs.tagTutoring,
  AppCatalogs.tagSustainability,
  AppCatalogs.tagSocial,
  AppCatalogs.tagCommunity,
  AppCatalogs.tagTechnology,
];

export const academicPrograms: readonly string[] = [
  AppCatalogs.programSystems,
  AppCatalogs.programIndustrialDesign,
  AppCatalogs.programBusiness,
  AppCatalogs.programArchitecture,
  AppCatalogs.programPsychology,
];

// ── Tipos de innovacion (segunda fase) ───────────────────────────────────
//
// No existen en Flutter: el tipo de un proyecto vive en la tabla nueva
// `project_types`, que la app Flutter no lee. La clave es lo que viaja a Roble;
// la etiqueta y el icono son de la interfaz.

export type InnovationTypeKey = "social" | "tecnologica" | "ambiental" | "educativa" | "empresarial" | "otros";

// Nombres de `MaterialIcons` de `@expo/vector-icons`.
export type InnovationTypeIcon = "groups" | "memory" | "eco" | "menu-book" | "work-outline" | "lightbulb-outline";

export type InnovationType = {
  key: InnovationTypeKey;
  label: string;
  icon: InnovationTypeIcon;
};

export const innovationTypes: readonly InnovationType[] = [
  { key: "social", label: "Social", icon: "groups" },
  { key: "tecnologica", label: "Tecnológica", icon: "memory" },
  { key: "ambiental", label: "Ambiental", icon: "eco" },
  { key: "educativa", label: "Educativa", icon: "menu-book" },
  { key: "empresarial", label: "Empresarial", icon: "work-outline" },
  { key: "otros", label: "Otros", icon: "lightbulb-outline" },
];

const OTROS = innovationTypes[innovationTypes.length - 1];

// El tipo de una clave. Una clave nula, vacia o desconocida es "Otros": un
// proyecto sin tipo (todos los de la primera fase) se pinta igual que uno que
// eligio "Otros".
export function innovationTypeOf(key: string | null | undefined): InnovationType {
  return innovationTypes.find((t) => t.key === key) ?? OTROS;
}
