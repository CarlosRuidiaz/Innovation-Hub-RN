import { DummyData, matchesRow } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { WorkspaceDataSource } from "./WorkspaceDataSource";

// Las mismas filas, servidas desde memoria (`local_workspace_source.dart`).
export class WorkspaceInMemoryDataSource implements WorkspaceDataSource {
  constructor(private readonly data: DummyData) {}

  async readMilestones(filters: Row) {
    await this.data.delay();
    return this.data.milestones.filter((r) => matchesRow(r, filters));
  }

  async createMilestone(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("m") };
    this.data.milestones.push(stored);
    return stored;
  }

  async updateMilestone(id: string, changes: Row) {
    await this.data.delay(0.5);
    update(this.data.milestones, id, changes, "hito");
  }

  async readUpdates(filters: Row) {
    await this.data.delay();
    return this.data.progressUpdates.filter((r) => matchesRow(r, filters));
  }

  async createUpdate(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("pu") };
    this.data.progressUpdates.push(stored);
    return stored;
  }

  async readTasks(filters: Row) {
    await this.data.delay();
    return this.data.tasks.filter((r) => matchesRow(r, filters));
  }

  async createTask(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("t") };
    this.data.tasks.push(stored);
    return stored;
  }

  async updateTask(id: string, changes: Row) {
    await this.data.delay(0.5);
    update(this.data.tasks, id, changes, "tarea");
  }
}

function update(rows: Row[], id: string, changes: Row, what: string) {
  const index = rows.findIndex((r) => r._id === id);
  if (index < 0) throw new Error(`No existe la ${what} ${id}`);
  rows[index] = { ...rows[index], ...changes };
}
