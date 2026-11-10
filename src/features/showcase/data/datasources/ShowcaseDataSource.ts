import { Row } from "@/src/core/roble/guard";

// `IShowcaseSource` de Flutter, pero en filas: tablas `comments` y `feedback`.
export interface ShowcaseDataSource {
  readComments(filters: Row): Promise<Row[]>;
  createComment(row: Row): Promise<Row>;
  readFeedback(filters: Row): Promise<Row[]>;
  createFeedback(row: Row): Promise<Row>;
  // Devuelve la fila ya cambiada, como `update` de Roble.
  updateFeedback(id: string, row: Row): Promise<Row>;
}
