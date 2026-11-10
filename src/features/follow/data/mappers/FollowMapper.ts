import { Row } from "@/src/core/roble/guard";
import { boolOf, idOf, textOf } from "@/src/core/roble/rowFormat";
import { Follow } from "../../domain/entities/Follow";

// La tabla `follows`, como la leen y la escriben `Follow.fromJson` y
// `Follow.toJsonNoId` de Flutter.
export const FollowMapper = {
  fromRow(row: Row): Follow {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      userId: textOf(row.user_id),
      // Sin la columna, sigue activo.
      active: boolOf(row.active, true),
    };
  },

  toNewRow(f: Follow): Row {
    return { project_id: f.projectId, user_id: f.userId, active: f.active };
  },
};
