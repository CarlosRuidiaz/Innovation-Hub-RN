import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { ProjectDataSource } from "./ProjectDataSource";

// Las mismas filas, servidas desde memoria (`local_project_source.dart`). El
// `_id` lo pone la fuente, como el servidor.
export class ProjectInMemoryDataSource implements ProjectDataSource {
  constructor(private readonly data: DummyData) {}

  async readProjects() {
    await this.data.delay();
    return [...this.data.projects];
  }

  async projectById(id: string) {
    await this.data.delay(0.5);
    return this.data.projects.find((r) => r._id === id) ?? null;
  }

  // Como la fuente local de Flutter, lo recien creado va primero.
  async createProject(row: Row) {
    await this.data.delay();
    const stored = { ...row, _id: this.data.nextId("p") };
    this.data.projects.unshift(stored);
    return stored;
  }

  async updateProject(id: string, changes: Row) {
    await this.data.delay(0.5);
    const index = this.data.projects.findIndex((r) => r._id === id);
    if (index < 0) throw new Error(`No existe el proyecto ${id}`);
    this.data.projects[index] = { ...this.data.projects[index], ...changes };
  }

  async readProjectTypes() {
    await this.data.delay(0.5);
    return [...this.data.projectTypes];
  }

  async createProjectType(row: Row) {
    await this.data.delay(0.5);
    const stored = { ...row, _id: this.data.nextId("pt") };
    this.data.projectTypes.push(stored);
    return stored;
  }
}
