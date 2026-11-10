// Un miembro visible en el espacio de trabajo: el `TeamMember` de
// `team_member.dart`.
//
// No es una entidad propia ni sale de ningun repositorio: el view model la arma
// con el lider del proyecto y las postulaciones aceptadas. Por eso vive en
// `presentation/viewmodels` y no en `domain`.
export type TeamMember = {
  id: string;
  name: string;
  // Puede venir vacio: del lider no se conoce el programa si no es quien tiene
  // la sesion.
  academicProgram: string;
  isLeader: boolean;
  // La postulacion aceptada de la que sale este miembro. El lider no tiene: es
  // quien publico el proyecto, no quien se postulo. Hace falta para salir o
  // remover a alguien.
  applicationId: string | null;
};

export const roleOf = (member: TeamMember) => (member.isLeader ? "Líder" : "Miembro");
