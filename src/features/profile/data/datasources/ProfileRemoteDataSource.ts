import { RobleClient } from "@/src/core/roble/RobleClient";
import { ProfileDataSource } from "./ProfileDataSource";

// El perfil de la sesion de Roble (`roble_profile_source.dart`). Programa,
// semestre y habilidades vienen en el `extra` que se mando al registrarse.
export class ProfileRemoteDataSource implements ProfileDataSource {
  constructor(private readonly client: RobleClient) {}

  get isLoggedIn() {
    return this.client.isLoggedIn;
  }

  currentUser() {
    return this.client.db.currentUser();
  }
}
