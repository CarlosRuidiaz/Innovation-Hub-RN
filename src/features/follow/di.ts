import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { RobleClient } from "@/src/core/roble/RobleClient";

// Registra el repositorio de los proyectos seguidos, como `registerFollow()` en
// `lib/features/follow/follow_dependencies.dart` de Flutter. `appContainer.ts` y
// `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerFollow(c: Container, client: RobleClient) {}

// Con los datos en memoria.
export function registerFollowLocal(c: Container, data: DummyData) {}
