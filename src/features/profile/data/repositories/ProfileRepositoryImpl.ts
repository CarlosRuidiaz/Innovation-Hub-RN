import { guardRoble } from "@/src/core/roble/guard";
import { Profile } from "../../domain/entities/Profile";
import { ProfileFailure } from "../../domain/ProfileFailure";
import { ProfileRepository } from "../../domain/repositories/ProfileRepository";
import { ProfileDataSource } from "../datasources/ProfileDataSource";
import { ProfileMapper } from "../mappers/ProfileMapper";

const failure = (m: string) => new ProfileFailure(m);

// El perfil de la sesion: decide y traduce, no habla.
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private readonly source: ProfileDataSource) {}

  // Sin sesion no hay perfil. Devolver uno vacio dejaria proyectos sin lider y
  // postulaciones sin dueño, que es peor que fallar aqui.
  getCurrentProfile(): Promise<Profile> {
    if (!this.source.isLoggedIn) {
      return Promise.reject(failure("No hay sesión activa: no se puede resolver el perfil actual."));
    }
    return guardRoble(async () => ProfileMapper.fromRow(await this.source.currentUser()), failure);
  }
}
