import { Row } from "@/src/core/roble/guard";

// `IApplicationSource` de Flutter, pero en filas.
export interface ApplicationDataSource {
  readApplications(filters: Row): Promise<Row[]>;
  createApplication(row: Row): Promise<Row>;
  updateApplication(id: string, changes: Row): Promise<void>;
  // La tabla `application_messages` de la segunda fase.
  readApplicationMessages(): Promise<Row[]>;
  createApplicationMessage(row: Row): Promise<Row>;
}
