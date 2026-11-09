import AsyncStorage from "@react-native-async-storage/async-storage";
import { RobleApiClient } from "roble-client";

// El cliente de Roble, uno solo para toda la app.
//
// Se crea una vez (en `appContainer.ts`) y se comparte: crear uno por pantalla
// le daria a cada copia su propia sesion. Solo lo usan los datasources.
export class RobleClient {
  readonly db: RobleApiClient;

  constructor(params: { baseUrl: string; contractId: string } | { db: RobleApiClient }) {
    this.db =
      "db" in params
        ? params.db
        : new RobleApiClient({
            baseUrl: params.baseUrl,
            contractId: params.contractId,
            // En React Native no hay localStorage: sin esto la sesion se pierde
            // al cerrar la app.
            storage: AsyncStorage,
          });
  }

  // Nombres de las tablas en un solo sitio: un typo aqui es un 404, no un
  // error de compilacion.
  //
  // Las diez primeras las creo la app Flutter, que sigue en uso sobre este
  // mismo proyecto: se leen y se escriben con el formato que ella usa, y nunca
  // se cambian ni se renombran.
  static readonly projects = "projects";
  static readonly applications = "applications";
  static readonly follows = "follows";
  static readonly milestones = "milestones";
  static readonly progressUpdates = "progress_updates";
  static readonly tasks = "tasks";
  static readonly polls = "polls";
  static readonly pollResponses = "poll_responses";
  static readonly comments = "comments";
  static readonly feedback = "feedback";

  // Las dos de la segunda fase. Van aparte para no tocar `projects` ni
  // `applications`: el tipo de innovacion de un proyecto y el mensaje de una
  // postulacion, una fila por cada uno.
  static readonly projectTypes = "project_types";
  static readonly applicationMessages = "application_messages";

  // El `userId` de la sesion, sacado del token sin ir al servidor.
  get currentUserId(): string | null {
    return this.db.currentUserId();
  }

  get isLoggedIn(): boolean {
    return this.db.isLoggedIn;
  }
}
