import { Follow } from "../entities/Follow";

// `IFollowRepository` de Flutter.
export interface FollowRepository {
  // Solo los activos.
  getFollowsByUser(userId: string): Promise<Follow[]>;

  // El de ese proyecto, activo o no, o `null` si nunca lo siguio.
  getFollow(userId: string, projectId: string): Promise<Follow | null>;

  // Sigue o deja de seguir. Reusa la fila si ya existe.
  toggleFollow(userId: string, projectId: string, active: boolean): Promise<Follow>;
}
