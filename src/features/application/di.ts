import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { RobleClient } from "@/src/core/roble/RobleClient";

// Registra el repositorio de las postulaciones (y sus mensajes), como `registerApplication()` en
// `lib/features/application/application_dependencies.dart` de Flutter. `appContainer.ts` y
// `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerApplication(c: Container, client: RobleClient) {}

// Con los datos en memoria.
export function registerApplicationLocal(c: Container, data: DummyData) {}
