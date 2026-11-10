import { Profile } from "../entities/Profile";

// `IProfileRepository` de Flutter. Sin sesion lanza `ProfileFailure`: un perfil
// vacio dejaria proyectos sin lider y postulaciones sin dueño.
export interface ProfileRepository {
  getCurrentProfile(): Promise<Profile>;
}
