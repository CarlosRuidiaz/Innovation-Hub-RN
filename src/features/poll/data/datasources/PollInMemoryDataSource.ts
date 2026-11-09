import { DummyData, matchesRow } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { PollDataSource } from "./PollDataSource";

// Las mismas filas, servidas desde memoria (`local_poll_source.dart`).
export class PollInMemoryDataSource implements PollDataSource {
  constructor(private readonly data: DummyData) {}

  async readPolls(filters: Row) {
    await this.data.delay();
    return this.data.polls.filter((r) => matchesRow(r, filters));
  }

  async createPoll(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("poll") };
    this.data.polls.push(stored);
    return stored;
  }

  async readResponses(filters: Row) {
    await this.data.delay();
    return this.data.pollResponses.filter((r) => matchesRow(r, filters));
  }

  async createResponse(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("pr") };
    this.data.pollResponses.push(stored);
    return stored;
  }
}
