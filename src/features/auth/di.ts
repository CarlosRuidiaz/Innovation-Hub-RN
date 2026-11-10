import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { AuthInMemoryDataSource } from "./data/datasources/AuthInMemoryDataSource";
import { AuthRemoteDataSource } from "./data/datasources/AuthRemoteDataSource";
import { AuthRepositoryImpl } from "./data/repositories/AuthRepositoryImpl";

// Registra el repositorio de la sesion, como `registerAuth()` en
// `lib/features/auth/auth_dependencies.dart` de Flutter. `appContainer.ts` y
// `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerAuth(c: Container, client: RobleClient) {
  c.register(TOKENS.AuthRepo, new AuthRepositoryImpl(new AuthRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerAuthLocal(c: Container, data: DummyData) {
  c.register(TOKENS.AuthRepo, new AuthRepositoryImpl(new AuthInMemoryDataSource(data)));
}
