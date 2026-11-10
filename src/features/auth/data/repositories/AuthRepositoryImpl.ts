import { errorMessage } from "@/src/core/roble/errorMessage";
import { AuthFailure } from "../../domain/AuthFailure";
import { AppUser, SignUpData } from "../../domain/entities/AppUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthDataSource } from "../datasources/AuthDataSource";
import { AccountMapper } from "../mappers/AccountMapper";

// Sesion: decide y traduce, no habla. Cualquier fallo sale como `AuthFailure`
// con el mensaje de `error_message.dart`.
export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly source: AuthDataSource) {}

  onSessionExpired(listener: () => void) {
    return this.source.onSessionExpired(listener);
  }

  restoreSession(): Promise<AppUser | null> {
    return this.guard(async () => {
      if (!(await this.source.restoreSession())) return null;
      return AccountMapper.toUser(await this.source.currentUser());
    });
  }

  login(email: string, password: string) {
    return this.guard(async () => AccountMapper.toUser(await this.source.login(email.trim(), password)));
  }

  // Todo junto, credenciales y perfil: el perfil viaja en `extra`, y `extra`
  // solo se manda al crear la cuenta. Partirlo en dos llamadas dejaria cuentas
  // sin perfil.
  signUp(data: SignUpData) {
    return this.guard(async () => {
      const user = await this.source.register({
        email: data.email.trim(),
        password: data.password,
        name: data.name.trim(),
        extra: AccountMapper.toExtra(data),
      });
      return AccountMapper.toUser(user);
    });
  }

  logout() {
    return this.guard(() => this.source.logout());
  }

  private async guard<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (e) {
      throw new AuthFailure(errorMessage(e));
    }
  }
}
