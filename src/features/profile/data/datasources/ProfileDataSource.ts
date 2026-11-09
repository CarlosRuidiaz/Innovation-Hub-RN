import { Row } from "@/src/core/roble/guard";

// `IProfileSource` de Flutter. El perfil sale de la sesion, no de una tabla:
// la fuente devuelve lo que da `currentUser()`.
export interface ProfileDataSource {
  readonly isLoggedIn: boolean;
  currentUser(): Promise<Row>;
}
