import { guardRoble } from "@/src/core/roble/guard";
import { Follow, newFollow } from "../../domain/entities/Follow";
import { FollowFailure } from "../../domain/FollowFailure";
import { FollowRepository } from "../../domain/repositories/FollowRepository";
import { FollowDataSource } from "../datasources/FollowDataSource";
import { FollowMapper } from "../mappers/FollowMapper";

const failure = (m: string) => new FollowFailure(m);

// Los seguimientos: decide y traduce, no habla.
export class FollowRepositoryImpl implements FollowRepository {
  constructor(private readonly source: FollowDataSource) {}

  getFollowsByUser(userId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readFollows({ user_id: userId, active: true });
      return rows.map(FollowMapper.fromRow);
    }, failure);
  }

  getFollow(userId: string, projectId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readFollows({ user_id: userId, project_id: projectId });
      return rows.length > 0 ? FollowMapper.fromRow(rows[0]) : null;
    }, failure);
  }

  // Dejar de seguir no borra la fila: la reusa, como `setFollow` de Flutter.
  // Solo se escribe si el estado cambia.
  toggleFollow(userId: string, projectId: string, active: boolean): Promise<Follow> {
    return guardRoble(async () => {
      const rows = await this.source.readFollows({ user_id: userId, project_id: projectId });
      if (rows.length > 0) {
        const existing = FollowMapper.fromRow(rows[0]);
        if (existing.active !== active && existing.id != null) {
          await this.source.updateFollow(existing.id, { active });
        }
        return { ...existing, active };
      }
      const created = await this.source.createFollow(FollowMapper.toNewRow(newFollow({ projectId, userId, active })));
      return FollowMapper.fromRow(created);
    }, failure);
  }
}
