import { InnovationTypeKey } from "@/src/core/catalogs";
import { ProjectStage } from "./ProjectStage";

// Un proyecto de la cartelera: el `Project` de `project.dart`.
export type Project = {
  // `null` mientras no se ha guardado: lo pone Roble al crear.
  id: string | null;
  title: string;
  // Pantalla 10, "Problema a resolver".
  problem: string;
  // Pantallas 07 y 10, "Descripcion".
  description: string;
  stage: ProjectStage;
  academicProgram: string;
  currentMembers: number;
  maxMembers: number;
  skillsWanted: string[];
  // Pantalla 10, opcional.
  tags: string[];
  // Quien puede abrir la pantalla 18 (postulantes).
  leaderId: string;
  // Pantalla 18, "Cerrar reclutamiento".
  recruitmentOpen: boolean;
  // Segunda fase: el tipo de innovacion, una clave de `innovationTypes`. No va
  // en `projects` sino en `project_types`; en la primera fase nadie lo llena.
  innovationType: InnovationTypeKey | null;
};

// El constructor de Flutter, con sus valores por omision.
export function newProject(
  fields: Omit<Project, "id" | "tags" | "recruitmentOpen" | "innovationType"> &
    Partial<Pick<Project, "id" | "tags" | "recruitmentOpen" | "innovationType">>,
): Project {
  return { id: null, tags: [], recruitmentOpen: true, innovationType: null, ...fields };
}

export const isFull = (p: Project) => p.currentMembers >= p.maxMembers;

// Regla de negocio: el boton "Postularme" del detalle solo aparece si esto es
// verdadero.
export const acceptsApplications = (p: Project) => p.recruitmentOpen && !isFull(p);

// Si `userId` puede postularse: ademas de lo anterior, no es el lider. Quien
// crea el proyecto ya esta en el equipo y gestiona a los postulantes.
export const acceptsApplicationsFrom = (p: Project, userId: string | null | undefined) =>
  acceptsApplications(p) && userId !== p.leaderId;

const normalize = (skill: string) => skill.trim().toLowerCase();

// Un proyecto encaja con un estudiante si alguna habilidad buscada coincide con
// alguna de las suyas, sin distinguir mayusculas ni espacios de sobra.
//
// Sin habilidades del estudiante da falso: no se puede afirmar que un proyecto
// le sirva a nadie.
export function matchesAnySkill(p: Project, studentSkills: string[]): boolean {
  const theirs = new Set(studentSkills.map(normalize).filter((s) => s.length > 0));
  if (theirs.size === 0) return false;
  return p.skillsWanted.map(normalize).some((wanted) => wanted.length > 0 && theirs.has(wanted));
}
