import { Row } from "@/src/core/roble/guard";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { PollDataSource } from "./PollDataSource";

// Habla con Roble sobre encuestas (`roble_poll_source.dart`). No decide nada y
// deja subir las excepciones.
export class PollRemoteDataSource implements PollDataSource {
  constructor(private readonly client: RobleClient) {}

  readPolls(filters: Row) {
    return this.client.db.read(RobleClient.polls, filters);
  }

  createPoll(row: Row) {
    return this.client.db.create(RobleClient.polls, row);
  }

  readResponses(filters: Row) {
    return this.client.db.read(RobleClient.pollResponses, filters);
  }

  createResponse(row: Row) {
    return this.client.db.create(RobleClient.pollResponses, row);
  }
}
