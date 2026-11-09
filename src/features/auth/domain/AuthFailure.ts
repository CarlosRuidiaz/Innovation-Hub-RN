// Lo que el repositorio de sesion lanza cuando el servidor rechaza al usuario.
// El mensaje ya es el de `error_message.dart`.
export class AuthFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthFailure";
  }
}
