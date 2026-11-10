import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { PollInMemoryDataSource } from "./data/datasources/PollInMemoryDataSource";
import { PollRemoteDataSource } from "./data/datasources/PollRemoteDataSource";
import { PollRepositoryImpl } from "./data/repositories/PollRepositoryImpl";

// Registra el repositorio de las encuestas y sus respuestas, como
// `registerPoll()` en `lib/features/poll/poll_dependencies.dart` de Flutter.
// `appContainer.ts` y `localContainer.ts` solo llaman a estas dos funciones.

// Contra Roble.
export function registerPoll(c: Container, client: RobleClient) {
  c.register(TOKENS.PollRepo, new PollRepositoryImpl(new PollRemoteDataSource(client)));
}

// Con los datos en memoria.
export function registerPollLocal(c: Container, data: DummyData) {
  c.register(TOKENS.PollRepo, new PollRepositoryImpl(new PollInMemoryDataSource(data)));
}
