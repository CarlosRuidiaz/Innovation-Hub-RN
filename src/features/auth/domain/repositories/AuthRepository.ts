import { AppUser, SignUpData } from "../entities/AppUser";

// El contrato de sesion (`IAuthRepository` de Flutter). La UI depende de esto,
// nunca de Roble.
//
// No estan `validate`, `validateToken` ni `forgotPassword`: ninguna pantalla de
// Flutter los usa, porque el registro activa la cuenta sin codigo.
export interface AuthRepository {
  // El usuario de la sesion guardada, o `null` si no hay ninguna.
  restoreSession(): Promise<AppUser | null>;

  // Avisa cuando la sesion se cae sola, no cuando se cierra a proposito.
  // Devuelve la funcion para dejar de escuchar.
  onSessionExpired(listener: () => void): () => void;

  login(email: string, password: string): Promise<AppUser>;

  // Crea la cuenta con el perfil en `extra` y deja la sesion abierta.
  signUp(data: SignUpData): Promise<AppUser>;

  logout(): Promise<void>;
}
