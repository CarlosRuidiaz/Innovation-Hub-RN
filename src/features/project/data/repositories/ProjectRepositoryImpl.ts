import { guardRoble } from "@/src/core/roble/guard";
import { idOf } from "@/src/core/roble/rowFormat";
import { isFull, Project } from "../../domain/entities/Project";
import { ProjectStage } from "../../domain/entities/ProjectStage";
import { ProjectFailure } from "../../domain/ProjectFailure";
import { ProjectRepository } from "../../domain/repositories/ProjectRepository";
import { ProjectDataSource } from "../datasources/ProjectDataSource";
import { ProjectMapper } from "../mappers/ProjectMapper";
import { ProjectTypeMapper } from "../mappers/ProjectTypeMapper";

const failure = (m: string) => new ProjectFailure(m);

// Los proyectos: decide y traduce, no habla. Las reglas que en Flutter viven
// en la fuente (un equipo lleno no crece, nunca baja de 1) estan aqui, asi
// valen igual con Roble y en memoria.
export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(private readonly source: ProjectDataSource) {}

  // En el orden en que los devuelve la fuente, como Flutter. El tipo de
  // innovacion se junta desde `project_types`; si hay dos filas para el mismo
  // proyecto, vale la ultima.
  async getProjects(): Promise<Project[]> {
    const [rows, typeRows] = await guardRoble(
      () => Promise.all([this.source.readProjects(), this.source.readProjectTypes()]),
      failure,
    );
    const typeOf = new Map(
      typeRows.map(ProjectTypeMapper.fromRow).map((t) => [t.projectId, t.innovationType] as const),
    );
    return rows.map((row) => ProjectMapper.fromRow(row, typeOf.get(idOf(row) ?? "") ?? null));
  }

  // Se escribe la fila de `projects` exactamente como Flutter. El tipo, si lo
  // hay, va despues en su propia tabla.
  //
  // Si el tipo no se puede guardar, la idea ya quedo publicada: no se deshace.
  // Se devuelve sin tipo (`innovationType: null`) y la pantalla lo avisa.
  async createProject(project: Project): Promise<Project> {
    return guardRoble(async () => {
      const created = ProjectMapper.fromRow(await this.source.createProject(ProjectMapper.toNewRow(project)));
      if (project.innovationType == null || created.id == null) return created;
      try {
        await this.source.createProjectType(ProjectTypeMapper.toNewRow(created.id, project.innovationType));
      } catch {
        return { ...created, innovationType: null };
      }
      return { ...created, innovationType: project.innovationType };
    }, failure);
  }

  closeRecruitment(projectId: string) {
    return guardRoble(() => this.source.updateProject(projectId, { recruitment_open: false }), failure);
  }

  // Un equipo lleno no crece: `maxMembers` es el tope y nadie lo pasa.
  addMember(projectId: string) {
    return guardRoble(async () => {
      const row = await this.source.projectById(projectId);
      if (row == null) return;
      const project = ProjectMapper.fromRow(row);
      if (isFull(project)) return;
      await this.source.updateProject(projectId, { current_members: project.currentMembers + 1 });
    }, failure);
  }

  // El 1 es el lider: el equipo nunca baja de ahi.
  removeMember(projectId: string) {
    return guardRoble(async () => {
      const row = await this.source.projectById(projectId);
      if (row == null) return;
      const project = ProjectMapper.fromRow(row);
      if (project.currentMembers <= 1) return;
      await this.source.updateProject(projectId, { current_members: project.currentMembers - 1 });
    }, failure);
  }

  updateStage(projectId: string, stage: ProjectStage) {
    return guardRoble(() => this.source.updateProject(projectId, { stage }), failure);
  }
}
