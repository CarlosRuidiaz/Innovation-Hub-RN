import { guardRoble, Row } from "@/src/core/roble/guard";
import { Application, ApplicationStatus } from "../../domain/entities/Application";
import { ApplicationFailure } from "../../domain/ApplicationFailure";
import { ApplicationRepository } from "../../domain/repositories/ApplicationRepository";
import { ApplicationDataSource } from "../datasources/ApplicationDataSource";
import { ApplicationMapper } from "../mappers/ApplicationMapper";
import { ApplicationMessageMapper } from "../mappers/ApplicationMessageMapper";

const failure = (m: string) => new ApplicationFailure(m);

// Las que cuentan como postulacion viva: con una de estas no se crea otra. La
// removida esta a proposito: un removido no vuelve a postularse.
const LIVE: ApplicationStatus[] = ["pending", "accepted", "removed"];

// Las postulaciones: decide y traduce, no habla. La regla de no duplicar, que
// en Flutter vive en la fuente, esta aqui y vale igual con Roble y en memoria.
export class ApplicationRepositoryImpl implements ApplicationRepository {
  constructor(private readonly source: ApplicationDataSource) {}

  getMyApplications(applicantId: string) {
    return guardRoble(() => this.read({ applicant_id: applicantId }), failure);
  }

  getApplicationsFor(projectId: string) {
    return guardRoble(() => this.read({ project_id: projectId }), failure);
  }

  // Si el estudiante ya tiene una viva en ese proyecto, se devuelve esa: la
  // pantalla de postulantes mostraria al mismo candidato repetido.
  apply(application: Application) {
    return guardRoble(async () => {
      const existing = await this.read({ project_id: application.projectId, applicant_id: application.applicantId });
      const live = existing.find(
        (a) =>
          a.projectId === application.projectId &&
          a.applicantId === application.applicantId &&
          LIVE.includes(a.status),
      );
      if (live) return live;

      // La fila de `applications` exactamente como Flutter; el mensaje, si lo
      // hay, despues en su propia tabla.
      const created = ApplicationMapper.fromRow(
        await this.source.createApplication(ApplicationMapper.toNewRow(application)),
      );
      const message = application.message?.trim();
      if (!message || created.id == null) return created;
      try {
        await this.source.createApplicationMessage(ApplicationMessageMapper.toNewRow(created.id, message));
        return { ...created, message };
      } catch {
        return { ...created, message: null };
      }
    }, failure);
  }

  withdraw(applicationId: string) {
    return this.setStatus(applicationId, "withdrawn");
  }

  leave(applicationId: string) {
    return this.setStatus(applicationId, "left");
  }

  decide(applicationId: string, decision: ApplicationStatus) {
    return this.setStatus(applicationId, decision);
  }

  private setStatus(applicationId: string, status: ApplicationStatus) {
    return guardRoble(() => this.source.updateApplication(applicationId, { status }), failure);
  }

  // Las filas con su mensaje de la segunda fase, si tienen. Si hay dos para la
  // misma postulacion, vale la ultima.
  private async read(filters: Row): Promise<Application[]> {
    const [rows, messageRows] = await Promise.all([
      this.source.readApplications(filters),
      this.source.readApplicationMessages(),
    ]);
    const messageOf = new Map(
      messageRows.map(ApplicationMessageMapper.fromRow).map((m) => [m.applicationId, m.message] as const),
    );
    return rows.map((row) => {
      const application = ApplicationMapper.fromRow(row);
      return { ...application, message: messageOf.get(application.id ?? "") ?? null };
    });
  }
}
