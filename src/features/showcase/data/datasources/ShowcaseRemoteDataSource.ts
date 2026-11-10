import { Row } from "@/src/core/roble/guard";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { ShowcaseDataSource } from "./ShowcaseDataSource";

// Habla con Roble sobre la vitrina (`roble_showcase_source.dart`). No decide
// nada y deja subir las excepciones.
export class ShowcaseRemoteDataSource implements ShowcaseDataSource {
  constructor(private readonly client: RobleClient) {}

  readComments(filters: Row) {
    return this.client.db.read(RobleClient.comments, filters);
  }

  createComment(row: Row) {
    return this.client.db.create(RobleClient.comments, row);
  }

  readFeedback(filters: Row) {
    return this.client.db.read(RobleClient.feedback, filters);
  }

  createFeedback(row: Row) {
    return this.client.db.create(RobleClient.feedback, row);
  }

  updateFeedback(id: string, row: Row) {
    return this.client.db.update(RobleClient.feedback, id, row);
  }
}
