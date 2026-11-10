import { Project } from "../entities/Project";
import { ProjectStage } from "../entities/ProjectStage";

// `IProjectRepository` de Flutter. La UI depende de esto, nunca de Roble.
export interface ProjectRepository {
  getProjects(): Promise<Project[]>;

  createProject(project: Project): Promise<Project>;

  closeRecruitment(projectId: string): Promise<void>;

  // Suma un miembro al equipo. Se llama al aceptar una postulacion: sin esto el
  // contador de miembros y `isFull` serian decorativos. Un equipo lleno no crece.
  addMember(projectId: string): Promise<void>;

  // Resta un miembro cuando alguien sale o el lider lo remueve. Es el inverso de
  // `addMember` y nunca baja de 1, que es el lider.
  removeMember(projectId: string): Promise<void>;

  // Cambia la etapa del proyecto. Solo el lider la cambia.
  updateStage(projectId: string, stage: ProjectStage): Promise<void>;
}
