import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { FollowInMemoryDataSource } from "./data/datasources/FollowInMemoryDataSource";
import { FollowRemoteDataSource } from "./data/datasources/FollowRemoteDataSource";
import { FollowRepositoryImpl } from "./data/repositories/FollowRepositoryImpl";

// Registra el repositorio de los proyectos seguidos, como `registerFollow()` en
// `lib/features/follow/follow_dependencies.dart` de Flutter. `appContainer.ts`
// y `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerFollow(c: Container, client: RobleClient) {
  c.register(TOKENS.FollowRepo, new FollowRepositoryImpl(new FollowRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerFollowLocal(c: Container, data: DummyData) {
  c.register(TOKENS.FollowRepo, new FollowRepositoryImpl(new FollowInMemoryDataSource(data)));
}
