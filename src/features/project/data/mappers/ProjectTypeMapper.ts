import { InnovationTypeKey, innovationTypes } from "@/src/core/catalogs";
import { Row } from "@/src/core/roble/guard";
import { idOf, textOf } from "@/src/core/roble/rowFormat";

// La tabla nueva `project_types` (segunda fase): una fila por proyecto con su
// tipo de innovacion. Va aparte para no tocar `projects`, que comparte la app
// Flutter.
export type ProjectTypeRow = {
  id: string | null;
  projectId: string;
  innovationType: InnovationTypeKey;
};

const keys = new Set<string>(innovationTypes.map((t) => t.key));

export const ProjectTypeMapper = {
  // Una clave que no esta en el catalogo es "otros", como `innovationTypeOf`.
  fromRow(row: Row): ProjectTypeRow {
    const key = textOf(row.innovation_type).trim();
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      innovationType: keys.has(key) ? (key as InnovationTypeKey) : "otros",
    };
  },

  toNewRow(projectId: string, innovationType: InnovationTypeKey): Row {
    return { project_id: projectId, innovation_type: innovationType };
  },
};
