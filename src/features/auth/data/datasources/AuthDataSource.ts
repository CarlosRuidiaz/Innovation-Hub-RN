import { Row } from "@/src/core/roble/guard";

// Lo que la funcionalidad necesita que alguien sepa hablar sobre cuentas
// (`IAuthenticationSource` de Flutter). Devuelve el usuario tal como llega;
// convertirlo es del repositorio.
export interface AuthDataSource {
  restoreSession(): Promise<boolean>;
  currentUser(): Promise<Row>;
  login(email: string, password: string): Promise<Row>;
  // Registra y deja la sesion abierta, como `register` con `autoLogin`.
  register(params: { email: string; password: string; name: string; extra: Row }): Promise<Row>;
  logout(): Promise<void>;
  onSessionExpired(listener: () => void): () => void;
}
