import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { RobleClient } from "@/src/core/roble/RobleClient";

// Registra el repositorio de hitos, avances y tareas, como `registerWorkspace()` en
// `lib/features/workspace/workspace_dependencies.dart` de Flutter. `appContainer.ts` y
// `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerWorkspace(c: Container, client: RobleClient) {}

// Con los datos en memoria.
export function registerWorkspaceLocal(c: Container, data: DummyData) {}
