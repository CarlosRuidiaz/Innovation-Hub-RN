import { Row } from "@/src/core/roble/guard";
import { AppUser, SignUpData } from "../../domain/entities/AppUser";

// La cuenta de Roble, de ida y de vuelta.
export const AccountMapper = {
  // Lo que devuelve `currentUser()`, como lo lee `getLoggedUser` de Flutter.
  // `userId` y nunca `id`: `id` es la fila del perfil, y de este valor depende
  // quien es el lider de cada proyecto.
  toUser(user: Row): AppUser {
    return {
      userId: user.userId == null ? "" : String(user.userId),
      email: typeof user.email === "string" ? user.email : "",
      name: typeof user.name === "string" ? user.name : "",
    };
  },

  // El `extra` del registro, con los mismos nombres que manda `signUp` en
  // `roble_authentication_source.dart`: la app Flutter lee el perfil de aqui,
  // asi que una cuenta creada en React Native se ve completa alla. La bio va
  // recortada y solo si tiene algo.
  toExtra(data: Pick<SignUpData, "academicProgram" | "semester" | "skills" | "bio">): Row {
    const bio = data.bio?.trim();
    return {
      academicProgram: data.academicProgram,
      semester: data.semester,
      skills: [...data.skills],
      ...(bio ? { bio } : {}),
    };
  },
};
