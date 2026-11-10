import { Row } from "@/src/core/roble/guard";

// `IWorkspaceSource` de Flutter, pero en filas: tablas `milestones`,
// `progress_updates` y `tasks`.
export interface WorkspaceDataSource {
  readMilestones(filters: Row): Promise<Row[]>;
  createMilestone(row: Row): Promise<Row>;
  updateMilestone(id: string, changes: Row): Promise<void>;
  readUpdates(filters: Row): Promise<Row[]>;
  createUpdate(row: Row): Promise<Row>;
  readTasks(filters: Row): Promise<Row[]>;
  createTask(row: Row): Promise<Row>;
  updateTask(id: string, changes: Row): Promise<void>;
}
