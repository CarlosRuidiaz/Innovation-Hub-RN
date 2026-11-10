import { Row } from "@/src/core/roble/guard";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { WorkspaceDataSource } from "./WorkspaceDataSource";

// Habla con Roble sobre el espacio de trabajo (`roble_workspace_source.dart`).
// No decide nada y deja subir las excepciones.
export class WorkspaceRemoteDataSource implements WorkspaceDataSource {
  constructor(private readonly client: RobleClient) {}

  readMilestones(filters: Row) {
    return this.client.db.read(RobleClient.milestones, filters);
  }

  createMilestone(row: Row) {
    return this.client.db.create(RobleClient.milestones, row);
  }

  async updateMilestone(id: string, changes: Row) {
    await this.client.db.update(RobleClient.milestones, id, changes);
  }

  readUpdates(filters: Row) {
    return this.client.db.read(RobleClient.progressUpdates, filters);
  }

  createUpdate(row: Row) {
    return this.client.db.create(RobleClient.progressUpdates, row);
  }

  readTasks(filters: Row) {
    return this.client.db.read(RobleClient.tasks, filters);
  }

  createTask(row: Row) {
    return this.client.db.create(RobleClient.tasks, row);
  }

  async updateTask(id: string, changes: Row) {
    await this.client.db.update(RobleClient.tasks, id, changes);
  }
}
