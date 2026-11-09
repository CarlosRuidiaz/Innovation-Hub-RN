import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { ApplicationInMemoryDataSource } from "./data/datasources/ApplicationInMemoryDataSource";
import { ApplicationRemoteDataSource } from "./data/datasources/ApplicationRemoteDataSource";
import { ApplicationRepositoryImpl } from "./data/repositories/ApplicationRepositoryImpl";

// Registra el repositorio de las postulaciones (y sus mensajes), como
// `registerApplication()` en `lib/features/application/application_dependencies.dart`
// de Flutter. `appContainer.ts` y `localContainer.ts` solo llaman a estas dos
// funciones.

// Contra Roble.
export function registerApplication(c: Container, client: RobleClient) {
  c.register(TOKENS.ApplicationRepo, new ApplicationRepositoryImpl(new ApplicationRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerApplicationLocal(c: Container, data: DummyData) {
  c.register(TOKENS.ApplicationRepo, new ApplicationRepositoryImpl(new ApplicationInMemoryDataSource(data)));
}
