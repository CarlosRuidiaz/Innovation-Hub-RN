import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { RobleClient } from "@/src/core/roble/RobleClient";

// Registra el repositorio de el perfil de la sesion, como `registerProfile()` en
// `lib/features/profile/profile_dependencies.dart` de Flutter. `appContainer.ts` y
// `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerProfile(c: Container, client: RobleClient) {}

// Con los datos en memoria.
export function registerProfileLocal(c: Container, data: DummyData) {}
