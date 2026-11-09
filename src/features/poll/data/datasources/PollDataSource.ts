import { Row } from "@/src/core/roble/guard";

// `IPollSource` de Flutter, pero en filas: tablas `polls` y `poll_responses`.
export interface PollDataSource {
  readPolls(filters: Row): Promise<Row[]>;
  createPoll(row: Row): Promise<Row>;
  readResponses(filters: Row): Promise<Row[]>;
  createResponse(row: Row): Promise<Row>;
}
