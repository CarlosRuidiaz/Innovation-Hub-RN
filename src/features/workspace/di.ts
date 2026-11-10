import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { WorkspaceInMemoryDataSource } from "./data/datasources/WorkspaceInMemoryDataSource";
import { WorkspaceRemoteDataSource } from "./data/datasources/WorkspaceRemoteDataSource";
import { WorkspaceRepositoryImpl } from "./data/repositories/WorkspaceRepositoryImpl";

// Registra el repositorio de hitos, avances y tareas, como `registerWorkspace()`
// en `lib/features/workspace/workspace_dependencies.dart` de Flutter.
// `appContainer.ts` y `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerWorkspace(c: Container, client: RobleClient) {
  c.register(TOKENS.WorkspaceRepo, new WorkspaceRepositoryImpl(new WorkspaceRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerWorkspaceLocal(c: Container, data: DummyData) {
  c.register(TOKENS.WorkspaceRepo, new WorkspaceRepositoryImpl(new WorkspaceInMemoryDataSource(data)));
}
