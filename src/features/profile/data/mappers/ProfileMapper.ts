import { Row } from "@/src/core/roble/guard";
import { intOf } from "@/src/core/roble/rowFormat";
import { Profile } from "../../domain/entities/Profile";

// Lo que devuelve `currentUser()` de Roble, leido como `Profile.fromJson` de
// Flutter. No hay `toNewRow`: el perfil no tiene tabla, viaja en el `extra`
// del registro (lo arma la autenticacion).
export const ProfileMapper = {
  fromRow(user: Row): Profile {
    const extra: Row = user.extra != null && typeof user.extra === "object" ? user.extra : {};
    const bio = typeof extra.bio === "string" ? extra.bio.trim() : "";
    return {
      // `userId` y nunca `id`: `id` es la fila del perfil.
      id: typeof user.userId === "string" ? user.userId : null,
      fullName: typeof user.name === "string" ? user.name : "",
      academicProgram: typeof extra.academicProgram === "string" ? extra.academicProgram : "",
      // El semestre puede volver como texto si alguien lo escribio a mano.
      semester: intOf(extra.semester),
      skills: Array.isArray(extra.skills) ? extra.skills.map((s: unknown) => String(s)) : [],
      // Vacia y ausente son lo mismo: no hay biografia que mostrar.
      bio: bio ? bio : null,
    };
  },
};
