import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { RobleClient } from "@/src/core/roble/RobleClient";

// Registra el repositorio de la sesion, como `registerAuth()` en
// `lib/features/auth/auth_dependencies.dart` de Flutter. `appContainer.ts` y
// `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerAuth(c: Container, client: RobleClient) {}

// Con los datos en memoria.
export function registerAuthLocal(c: Container, data: DummyData) {}
