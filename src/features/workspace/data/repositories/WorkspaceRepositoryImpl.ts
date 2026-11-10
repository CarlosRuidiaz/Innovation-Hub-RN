import { guardRoble } from "@/src/core/roble/guard";
import { Milestone } from "../../domain/entities/Milestone";
import { ProgressUpdate } from "../../domain/entities/ProgressUpdate";
import { ProjectTask } from "../../domain/entities/ProjectTask";
import { WorkspaceRepository } from "../../domain/repositories/WorkspaceRepository";
import { WorkspaceFailure } from "../../domain/WorkspaceFailure";
import { WorkspaceDataSource } from "../datasources/WorkspaceDataSource";
import { MilestoneMapper } from "../mappers/MilestoneMapper";
import { ProgressUpdateMapper } from "../mappers/ProgressUpdateMapper";
import { ProjectTaskMapper } from "../mappers/ProjectTaskMapper";

const failure = (m: string) => new WorkspaceFailure(m);

// El espacio de trabajo: decide y traduce, no habla. Cada lectura filtra por
// `project_id`.
export class WorkspaceRepositoryImpl implements WorkspaceRepository {
  constructor(private readonly source: WorkspaceDataSource) {}

  getMilestones(projectId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readMilestones({ project_id: projectId });
      return rows.map(MilestoneMapper.fromRow);
    }, failure);
  }

  addMilestone(milestone: Milestone) {
    return guardRoble(
      async () => MilestoneMapper.fromRow(await this.source.createMilestone(MilestoneMapper.toNewRow(milestone))),
      failure,
    );
  }

  setMilestoneDone(milestoneId: string, done: boolean) {
    return guardRoble(() => this.source.updateMilestone(milestoneId, { done }), failure);
  }

  // El mas reciente primero, como las dos fuentes de Flutter.
  getUpdates(projectId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readUpdates({ project_id: projectId });
      return rows.map(ProgressUpdateMapper.fromRow).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, failure);
  }

  // Publicar un avance que cumple un hito marca ese hito: es lo que sube la barra.
  publishUpdate(update: ProgressUpdate) {
    return guardRoble(async () => {
      const created = await this.source.createUpdate(ProgressUpdateMapper.toNewRow(update));
      if (update.milestoneId != null) {
        await this.source.updateMilestone(update.milestoneId, { done: true });
      }
      return ProgressUpdateMapper.fromRow(created);
    }, failure);
  }

  getTasks(projectId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readTasks({ project_id: projectId });
      return rows.map(ProjectTaskMapper.fromRow);
    }, failure);
  }

  addTask(task: ProjectTask) {
    return guardRoble(
      async () => ProjectTaskMapper.fromRow(await this.source.createTask(ProjectTaskMapper.toNewRow(task))),
      failure,
    );
  }

  setTaskDone(taskId: string, done: boolean) {
    return guardRoble(() => this.source.updateTask(taskId, { done }), failure);
  }
}
