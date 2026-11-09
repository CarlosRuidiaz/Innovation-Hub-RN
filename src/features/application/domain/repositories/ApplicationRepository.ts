import { Application, ApplicationStatus } from "../entities/Application";

// `IApplicationRepository` de Flutter.
export interface ApplicationRepository {
  getMyApplications(applicantId: string): Promise<Application[]>;

  getApplicationsFor(projectId: string): Promise<Application[]>;

  // Un estudiante no tiene dos postulaciones vivas al mismo proyecto: si ya hay
  // una pendiente, aceptada o removida, devuelve esa en vez de crear otra. Asi
  // un removido no se vuelve a postular.
  apply(application: Application): Promise<Application>;

  withdraw(applicationId: string): Promise<void>;

  // Un miembro aceptado sale del proyecto: la postulacion pasa a `left`.
  leave(applicationId: string): Promise<void>;

  decide(applicationId: string, decision: ApplicationStatus): Promise<void>;
}
