import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { ProjectInMemoryDataSource } from "./data/datasources/ProjectInMemoryDataSource";
import { ProjectRemoteDataSource } from "./data/datasources/ProjectRemoteDataSource";
import { ProjectRepositoryImpl } from "./data/repositories/ProjectRepositoryImpl";

// Registra el repositorio de proyectos, como `registerProject()` en
// `lib/features/project/project_dependencies.dart` de Flutter.
// `appContainer.ts` y `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerProject(c: Container, client: RobleClient) {
  c.register(TOKENS.ProjectRepo, new ProjectRepositoryImpl(new ProjectRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerProjectLocal(c: Container, data: DummyData) {
  c.register(TOKENS.ProjectRepo, new ProjectRepositoryImpl(new ProjectInMemoryDataSource(data)));
}
