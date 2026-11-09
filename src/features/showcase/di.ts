import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { RobleClient } from "@/src/core/roble/RobleClient";

// Registra el repositorio de los comentarios y la retroalimentacion de la vitrina, como `registerShowcase()` en
// `lib/features/showcase/showcase_dependencies.dart` de Flutter. `appContainer.ts` y
// `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerShowcase(c: Container, client: RobleClient) {}

// Con los datos en memoria.
export function registerShowcaseLocal(c: Container, data: DummyData) {}
