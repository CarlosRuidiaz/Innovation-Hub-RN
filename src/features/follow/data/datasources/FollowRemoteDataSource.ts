import { Row } from "@/src/core/roble/guard";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { FollowDataSource } from "./FollowDataSource";

// Habla con Roble sobre seguimientos (`roble_follow_source.dart`). No decide
// nada y deja subir las excepciones.
export class FollowRemoteDataSource implements FollowDataSource {
  constructor(private readonly client: RobleClient) {}

  readFollows(filters: Row) {
    return this.client.db.read(RobleClient.follows, filters);
  }

  createFollow(row: Row) {
    return this.client.db.create(RobleClient.follows, row);
  }

  async updateFollow(id: string, changes: Row) {
    await this.client.db.update(RobleClient.follows, id, changes);
  }
}
