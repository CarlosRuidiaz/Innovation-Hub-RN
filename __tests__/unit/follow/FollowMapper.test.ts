import { FollowMapper } from "@/src/features/follow/data/mappers/FollowMapper";
import { newFollow } from "@/src/features/follow/domain/entities/Follow";

// La tabla `follows` contra `Follow` de Flutter (`follow_model_test.dart`).
describe("FollowMapper", () => {
  it("toNewRow escribe exactamente lo que toJsonNoId de Flutter", () => {
    expect(FollowMapper.toNewRow(newFollow({ id: "f1", projectId: "p1", userId: "u8", active: false }))).toStrictEqual({
      project_id: "p1",
      user_id: "u8",
      active: false,
    });
  });

  it("fromRow de una fila escrita por Flutter", () => {
    expect(FollowMapper.fromRow({ _id: "f1", project_id: "p1", user_id: "u8", active: true })).toEqual({
      id: "f1",
      projectId: "p1",
      userId: "u8",
      active: true,
    });
  });

  it("active llega como texto, y sin la columna sigue activo", () => {
    expect(FollowMapper.fromRow({ active: "FALSE" }).active).toBe(false);
    expect(FollowMapper.fromRow({ active: "true" }).active).toBe(true);
    expect(FollowMapper.fromRow({}).active).toBe(true);
    expect(FollowMapper.fromRow({}).id).toBeNull();
  });

  it("ida y vuelta", () => {
    const follow = newFollow({ id: "f2", projectId: "p3", userId: "u1" });
    expect(FollowMapper.fromRow({ _id: "f2", ...FollowMapper.toNewRow(follow) })).toEqual(follow);
  });
});
