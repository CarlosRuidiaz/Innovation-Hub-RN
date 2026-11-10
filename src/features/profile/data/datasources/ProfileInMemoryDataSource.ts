import { DummyData } from "@/src/core/data/dummyData";
import { ProfileDataSource } from "./ProfileDataSource";

// El perfil de la sesion en memoria: la cuenta con la que se entro en `DummyData`.
export class ProfileInMemoryDataSource implements ProfileDataSource {
  constructor(private readonly data: DummyData) {}

  get isLoggedIn() {
    return this.data.session != null;
  }

  async currentUser() {
    await this.data.delay(0.5);
    if (!this.data.session) throw new Error("No hay sesión");
    return this.data.session;
  }
}
