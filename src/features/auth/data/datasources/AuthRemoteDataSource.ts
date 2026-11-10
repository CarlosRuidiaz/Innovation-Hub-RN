import { Row } from "@/src/core/roble/guard";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { AuthDataSource } from "./AuthDataSource";

// Habla con Roble sobre cuentas (`roble_authentication_source.dart`). No decide
// nada y deja subir las excepciones. El paquete guarda y renueva los tokens.
export class AuthRemoteDataSource implements AuthDataSource {
  constructor(private readonly client: RobleClient) {}

  restoreSession() {
    return this.client.db.restoreSession();
  }

  currentUser() {
    return this.client.db.currentUser();
  }

  login(email: string, password: string) {
    return this.client.db.login({ email, password });
  }

  // Activacion directa: no se pide codigo por correo, y la sesion queda abierta.
  register(params: { email: string; password: string; name: string; extra: Row }) {
    return this.client.db.register({ ...params, autoLogin: true });
  }

  logout() {
    return this.client.db.logout();
  }

  onSessionExpired(listener: () => void) {
    return this.client.db.onSessionExpired(listener);
  }
}
