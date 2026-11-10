import { Row } from "@/src/core/roble/guard";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { ProjectDataSource } from "./ProjectDataSource";

// Habla con Roble sobre proyectos (`roble_project_source.dart`). No decide nada
// y deja subir las excepciones.
export class ProjectRemoteDataSource implements ProjectDataSource {
  constructor(private readonly client: RobleClient) {}

  readProjects() {
    return this.client.db.read(RobleClient.projects);
  }

  projectById(id: string) {
    return this.client.db.getById(RobleClient.projects, id);
  }

  createProject(row: Row) {
    return this.client.db.create(RobleClient.projects, row);
  }

  async updateProject(id: string, changes: Row) {
    await this.client.db.update(RobleClient.projects, id, changes);
  }

  // Roble filtra solo por igualdad, y la cartelera carga todos los proyectos:
  // se lee la tabla entera, que tiene a lo sumo una fila por proyecto.
  readProjectTypes() {
    return this.client.db.read(RobleClient.projectTypes);
  }

  createProjectType(row: Row) {
    return this.client.db.create(RobleClient.projectTypes, row);
  }
}
