// Los estados de una postulacion, con el `.name` de `ApplicationStatus` en
// Dart: es lo que viaja a la columna `status`.
//
// `left`: el miembro salio por su cuenta. `removed`: el lider lo saco, y por
// eso no puede volver a postularse a ese proyecto.
export const APPLICATION_STATUSES = ["pending", "accepted", "rejected", "withdrawn", "left", "removed"] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Un estado desconocido o nulo es "pending", como `_parseStatus` de Flutter.
export function applicationStatusFromName(value: unknown): ApplicationStatus {
  const text = value == null ? "" : String(value);
  return (APPLICATION_STATUSES as readonly string[]).includes(text) ? (text as ApplicationStatus) : "pending";
}

// La postulacion de un estudiante a un proyecto: el `Application` de
// `application.dart`.
//
// No guarda el titulo ni la etapa del proyecto: las pantallas los piden al
// repositorio de proyectos con `projectId`. Asi no hay dos copias del mismo dato.
export type Application = {
  id: string | null;
  projectId: string;
  applicantId: string;
  applicantName: string;
  // Pantalla 18: "Diseño Industrial".
  applicantProgram: string;
  // Pantalla 18: "7.º semestre".
  applicantSemester: number;
  skillsOffered: string[];
  status: ApplicationStatus;
  // Segunda fase: lo que el estudiante le escribe al lider al postularse. No va
  // en `applications` sino en `application_messages`; en la primera fase nadie
  // lo llena.
  message: string | null;
};

// El constructor de Flutter, con sus valores por omision.
export function newApplication(
  fields: Omit<Application, "id" | "status" | "message"> & Partial<Pick<Application, "id" | "status" | "message">>,
): Application {
  return { id: null, status: "pending", message: null, ...fields };
}

export const isPending = (a: Application) => a.status === "pending";

// La pantalla de la postulacion muestra "Cancelar postulación" solo mientras
// esto es verdadero.
export const canWithdraw = (a: Application) => a.status === "pending";
