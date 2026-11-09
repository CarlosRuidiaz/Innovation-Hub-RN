import { RobleApiHttpException } from "roble-client";

import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { AuthDataSource } from "./AuthDataSource";

// Los simbolos que Roble acepta en una contraseña.
const SYMBOL = /[!@#$_-]/;

// La regla de Roble: al menos 8 caracteres, con mayuscula, minuscula, numero y
// uno de `! @ # $ _ -`. La app no la valida (pide 7 caracteres, como Flutter):
// es el servidor quien la exige.
export function robleAcceptsPassword(password: string) {
  return (
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && SYMBOL.test(password)
  );
}

// Cuentas en memoria. Imita lo que de Roble se nota desde la app, con los
// mismos errores HTTP que el servidor: correo o contraseña malos (401), una
// contraseña que no cumple su regla (400) y un correo que ya tiene cuenta
// (409). Asi el repositorio los traduce igual que con Roble.
//
// La sesion no sobrevive a cerrar la app: `restoreSession` solo encuentra algo
// dentro de la misma corrida.
export class AuthInMemoryDataSource implements AuthDataSource {
  constructor(private readonly data: DummyData) {}

  async restoreSession() {
    await this.data.delay(0.5);
    return this.data.session != null;
  }

  async currentUser() {
    if (!this.data.session) throw new RobleApiHttpException(401, "No hay sesión");
    return this.data.session;
  }

  async login(email: string, password: string) {
    await this.data.delay();
    const user = this.find(email);
    if (!user || this.data.passwords[user.email] !== password) {
      throw new RobleApiHttpException(401, "Credenciales inválidas");
    }
    this.data.session = user;
    return user;
  }

  async register(params: { email: string; password: string; name: string; extra: Row }) {
    await this.data.delay();
    const email = params.email.trim().toLowerCase();
    if (!robleAcceptsPassword(params.password)) {
      throw new RobleApiHttpException(400, "La contraseña no cumple la política");
    }
    if (this.find(email)) throw new RobleApiHttpException(409, "El correo ya está registrado");
    const user: Row = { userId: this.data.nextId("u"), email, name: params.name, role: "user", extra: params.extra };
    this.data.users.push(user);
    this.data.passwords[email] = params.password;
    // Como `register` con `autoLogin`: la sesion queda abierta.
    this.data.session = user;
    return user;
  }

  async logout() {
    await this.data.delay(0.5);
    this.data.session = null;
  }

  // Una sesion en memoria no caduca sola: nunca avisa.
  onSessionExpired() {
    return () => {};
  }

  private find(email: string) {
    const wanted = email.trim().toLowerCase();
    return this.data.users.find((u) => String(u.email).toLowerCase() === wanted);
  }
}
