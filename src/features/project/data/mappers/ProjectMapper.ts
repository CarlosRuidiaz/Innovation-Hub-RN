import { Row } from "@/src/core/roble/guard";
import { boolOf, idOf, intOf, listOf, textOf } from "@/src/core/roble/rowFormat";
import { Project } from "../../domain/entities/Project";
import { stageFromName } from "../../domain/entities/ProjectStage";

// La tabla `projects`, como la leen y la escriben `Project.fromJson` y
// `Project.toJsonNoId` de Flutter.
export const ProjectMapper = {
  // `innovationType` no esta en la fila: sale de `project_types` y el
  // repositorio lo junta.
  fromRow(row: Row, innovationType: Project["innovationType"] = null): Project {
    return {
      id: idOf(row),
      title: textOf(row.title),
      problem: textOf(row.problem),
      description: textOf(row.description),
      stage: stageFromName(row.stage),
      academicProgram: textOf(row.academic_program),
      currentMembers: intOf(row.current_members),
      maxMembers: intOf(row.max_members),
      skillsWanted: listOf(row.skills_wanted),
      tags: listOf(row.tags),
      leaderId: textOf(row.leader_id),
      recruitmentOpen: boolOf(row.recruitment_open, true),
      innovationType,
    };
  },

  // Lo que se le manda a Roble al crear. Las listas van como texto JSON y no
  // como lista: la columna jsonb convierte una lista en un array de PostgreSQL,
  // que no es JSON valido, y responde 400. Sin `innovationType`: Flutter no lo
  // conoce y no va en esta tabla.
  toNewRow(p: Project): Row {
    return {
      title: p.title,
      problem: p.problem,
      description: p.description,
      stage: p.stage,
      academic_program: p.academicProgram,
      current_members: p.currentMembers,
      max_members: p.maxMembers,
      skills_wanted: JSON.stringify(p.skillsWanted),
      tags: JSON.stringify(p.tags),
      leader_id: p.leaderId,
      recruitment_open: p.recruitmentOpen,
    };
  },
};
