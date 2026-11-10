import { Row } from "@/src/core/roble/guard";

// `IFollowSource` de Flutter, pero en filas.
export interface FollowDataSource {
  readFollows(filters: Row): Promise<Row[]>;
  createFollow(row: Row): Promise<Row>;
  updateFollow(id: string, changes: Row): Promise<void>;
}
