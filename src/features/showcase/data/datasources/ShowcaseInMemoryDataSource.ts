import { DummyData, matchesRow } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { ShowcaseDataSource } from "./ShowcaseDataSource";

// Las mismas filas, servidas desde memoria (`local_showcase_source.dart`).
export class ShowcaseInMemoryDataSource implements ShowcaseDataSource {
  constructor(private readonly data: DummyData) {}

  async readComments(filters: Row) {
    await this.data.delay();
    return this.data.comments.filter((r) => matchesRow(r, filters));
  }

  async createComment(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("c") };
    this.data.comments.push(stored);
    return stored;
  }

  async readFeedback(filters: Row) {
    await this.data.delay();
    return this.data.feedback.filter((r) => matchesRow(r, filters));
  }

  async createFeedback(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("fb") };
    this.data.feedback.push(stored);
    return stored;
  }

  async updateFeedback(id: string, row: Row) {
    await this.data.delay(0.5);
    const index = this.data.feedback.findIndex((r) => r._id === id);
    if (index < 0) throw new Error(`No existe la retroalimentación ${id}`);
    this.data.feedback[index] = { ...this.data.feedback[index], ...row };
    return this.data.feedback[index];
  }
}
