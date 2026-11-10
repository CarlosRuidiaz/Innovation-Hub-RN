import { Row } from "@/src/core/roble/guard";

// `IProjectSource` de Flutter, pero en filas: lo que viaja por la API. Asi el
// repositorio se prueba con una fuente falsa que devuelve las mismas filas.
export interface ProjectDataSource {
  readProjects(): Promise<Row[]>;
  projectById(id: string): Promise<Row | null>;
  createProject(row: Row): Promise<Row>;
  updateProject(id: string, changes: Row): Promise<void>;
  // La tabla `project_types` de la segunda fase.
  readProjectTypes(): Promise<Row[]>;
  createProjectType(row: Row): Promise<Row>;
}
