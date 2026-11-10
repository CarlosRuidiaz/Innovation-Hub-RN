import { Row, textOrNull } from "@/src/core/roble/guard";
import { idOf, textOf } from "@/src/core/roble/rowFormat";

// La tabla nueva `application_messages` (segunda fase): el mensaje de una
// postulacion. Va aparte para no tocar `applications`, que comparte la app
// Flutter.
export type ApplicationMessageRow = {
  id: string | null;
  applicationId: string;
  // Vacio y ausente son lo mismo: no hay mensaje.
  message: string | null;
};

export const ApplicationMessageMapper = {
  fromRow(row: Row): ApplicationMessageRow {
    return { id: idOf(row), applicationId: textOf(row.application_id), message: textOrNull(row.message) };
  },

  toNewRow(applicationId: string, message: string): Row {
    return { application_id: applicationId, message };
  },
};
