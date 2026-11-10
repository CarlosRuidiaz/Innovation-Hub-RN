import { DummyData, matchesRow } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { ApplicationDataSource } from "./ApplicationDataSource";

// Las mismas filas, servidas desde memoria (`local_application_source.dart`).
export class ApplicationInMemoryDataSource implements ApplicationDataSource {
  constructor(private readonly data: DummyData) {}

  async readApplications(filters: Row) {
    await this.data.delay();
    return this.data.applications.filter((r) => matchesRow(r, filters));
  }

  async createApplication(row: Row) {
    await this.data.delay();
    const stored = { ...row, _id: this.data.nextId("a") };
    this.data.applications.push(stored);
    return stored;
  }

  async updateApplication(id: string, changes: Row) {
    await this.data.delay(0.5);
    const index = this.data.applications.findIndex((r) => r._id === id);
    if (index < 0) throw new Error(`No existe la postulación ${id}`);
    this.data.applications[index] = { ...this.data.applications[index], ...changes };
  }

  async readApplicationMessages() {
    await this.data.delay(0.5);
    return [...this.data.applicationMessages];
  }

  async createApplicationMessage(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("am") };
    this.data.applicationMessages.push(stored);
    return stored;
  }
}
