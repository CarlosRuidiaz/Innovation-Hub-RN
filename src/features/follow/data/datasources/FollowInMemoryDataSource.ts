import { DummyData, matchesRow } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { FollowDataSource } from "./FollowDataSource";

// Las mismas filas, servidas desde memoria (`local_follow_source.dart`).
export class FollowInMemoryDataSource implements FollowDataSource {
  constructor(private readonly data: DummyData) {}

  async readFollows(filters: Row) {
    await this.data.delay(0.5);
    return this.data.follows.filter((r) => matchesRow(r, filters));
  }

  async createFollow(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("f") };
    this.data.follows.push(stored);
    return stored;
  }

  async updateFollow(id: string, changes: Row) {
    await this.data.delay(0.5);
    const index = this.data.follows.findIndex((r) => r._id === id);
    if (index < 0) throw new Error(`No existe el seguimiento ${id}`);
    this.data.follows[index] = { ...this.data.follows[index], ...changes };
  }
}
