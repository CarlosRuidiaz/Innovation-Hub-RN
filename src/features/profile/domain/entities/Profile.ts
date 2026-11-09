// El perfil del estudiante de la sesion: el `Profile` de `profile.dart`.
//
// No tiene tabla: viaja en el `extra` de la cuenta de Roble, que se manda al
// registrarse.
export type Profile = {
  // El `userId` de la sesion, nunca el `id` de la fila: de este valor depende
  // quien es el lider de cada proyecto.
  id: string | null;
  fullName: string;
  academicProgram: string;
  semester: number;
  skills: string[];
  // Presentacion corta. Opcional: no cuenta para `isComplete`.
  bio: string | null;
};

export const isComplete = (p: Profile) =>
  p.fullName.length > 0 && p.academicProgram.length > 0 && p.semester > 0 && p.skills.length > 0;
