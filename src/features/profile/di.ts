import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { ProfileInMemoryDataSource } from "./data/datasources/ProfileInMemoryDataSource";
import { ProfileRemoteDataSource } from "./data/datasources/ProfileRemoteDataSource";
import { ProfileRepositoryImpl } from "./data/repositories/ProfileRepositoryImpl";

// Registra el repositorio del perfil de la sesion, como `registerProfile()` en
// `lib/features/profile/profile_dependencies.dart` de Flutter.
// `appContainer.ts` y `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerProfile(c: Container, client: RobleClient) {
  c.register(TOKENS.ProfileRepo, new ProfileRepositoryImpl(new ProfileRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerProfileLocal(c: Container, data: DummyData) {
  c.register(TOKENS.ProfileRepo, new ProfileRepositoryImpl(new ProfileInMemoryDataSource(data)));
}
