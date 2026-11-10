import { Row } from "@/src/core/roble/guard";
import { RobleClient } from "@/src/core/roble/RobleClient";
import { ApplicationDataSource } from "./ApplicationDataSource";

// Habla con Roble sobre postulaciones (`roble_application_source.dart`). No
// decide nada y deja subir las excepciones.
export class ApplicationRemoteDataSource implements ApplicationDataSource {
  constructor(private readonly client: RobleClient) {}

  readApplications(filters: Row) {
    return this.client.db.read(RobleClient.applications, filters);
  }

  createApplication(row: Row) {
    return this.client.db.create(RobleClient.applications, row);
  }

  async updateApplication(id: string, changes: Row) {
    await this.client.db.update(RobleClient.applications, id, changes);
  }

  // Roble filtra solo por igualdad: pedir el mensaje de cada postulacion seria
  // una peticion por fila. Se lee la tabla entera y el repositorio elige.
  readApplicationMessages() {
    return this.client.db.read(RobleClient.applicationMessages);
  }

  createApplicationMessage(row: Row) {
    return this.client.db.create(RobleClient.applicationMessages, row);
  }
}
