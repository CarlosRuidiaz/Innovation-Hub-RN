import { Milestone } from "../entities/Milestone";
import { ProgressUpdate } from "../entities/ProgressUpdate";
import { ProjectTask } from "../entities/ProjectTask";

// `IWorkspaceRepository` de Flutter: hitos, avances y tareas de un proyecto.
export interface WorkspaceRepository {
  getMilestones(projectId: string): Promise<Milestone[]>;

  addMilestone(milestone: Milestone): Promise<Milestone>;

  setMilestoneDone(milestoneId: string, done: boolean): Promise<void>;

  // El mas reciente primero.
  getUpdates(projectId: string): Promise<ProgressUpdate[]>;

  // Si `milestoneId` viene, marca ese hito cumplido.
  publishUpdate(update: ProgressUpdate): Promise<ProgressUpdate>;

  getTasks(projectId: string): Promise<ProjectTask[]>;

  addTask(task: ProjectTask): Promise<ProjectTask>;

  setTaskDone(taskId: string, done: boolean): Promise<void>;
}
