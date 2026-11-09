import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { ShowcaseInMemoryDataSource } from "./data/datasources/ShowcaseInMemoryDataSource";
import { ShowcaseRemoteDataSource } from "./data/datasources/ShowcaseRemoteDataSource";
import { ShowcaseRepositoryImpl } from "./data/repositories/ShowcaseRepositoryImpl";

// Registra el repositorio de los comentarios y la retroalimentacion de la
// vitrina, como `registerShowcase()` en
// `lib/features/showcase/showcase_dependencies.dart` de Flutter.
// `appContainer.ts` y `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerShowcase(c: Container, client: RobleClient) {
  c.register(TOKENS.ShowcaseRepo, new ShowcaseRepositoryImpl(new ShowcaseRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerShowcaseLocal(c: Container, data: DummyData) {
  c.register(TOKENS.ShowcaseRepo, new ShowcaseRepositoryImpl(new ShowcaseInMemoryDataSource(data)));
}
