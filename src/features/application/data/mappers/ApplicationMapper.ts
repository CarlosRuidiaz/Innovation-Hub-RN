import { Row } from "@/src/core/roble/guard";
import { idOf, intOf, listOf, textOf } from "@/src/core/roble/rowFormat";
import { Application, applicationStatusFromName } from "../../domain/entities/Application";

// La tabla `applications`, como la leen y la escriben `Application.fromJson` y
// `Application.toJsonNoId` de Flutter.
export const ApplicationMapper = {
  // `message` no esta en la fila: sale de `application_messages` y el
  // repositorio lo junta.
  fromRow(row: Row, message: string | null = null): Application {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      applicantId: textOf(row.applicant_id),
      applicantName: textOf(row.applicant_name),
      applicantProgram: textOf(row.applicant_program),
      applicantSemester: intOf(row.applicant_semester),
      skillsOffered: listOf(row.skills_offered),
      status: applicationStatusFromName(row.status),
      message,
    };
  },

  // Lo que se le manda a Roble al postularse. `skills_offered` va como texto
  // JSON por lo mismo que en `projects`. Sin `message`: va en su propia tabla.
  toNewRow(a: Application): Row {
    return {
      project_id: a.projectId,
      applicant_id: a.applicantId,
      applicant_name: a.applicantName,
      applicant_program: a.applicantProgram,
      applicant_semester: a.applicantSemester,
      skills_offered: JSON.stringify(a.skillsOffered),
      status: a.status,
    };
  },
};
