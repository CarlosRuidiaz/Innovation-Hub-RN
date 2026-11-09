import { DummyData } from "@/src/core/data/dummyData";
import { ProfileDataSource } from "@/src/features/profile/data/datasources/ProfileDataSource";
import { ProfileInMemoryDataSource } from "@/src/features/profile/data/datasources/ProfileInMemoryDataSource";
import { ProfileRepositoryImpl } from "@/src/features/profile/data/repositories/ProfileRepositoryImpl";
import { isComplete } from "@/src/features/profile/domain/entities/Profile";
import { ProfileFailure } from "@/src/features/profile/domain/ProfileFailure";
import { fake } from "@/__tests__/support/fake";

// `roble_profile_source_test.dart` y `local_profile_source_test.dart`.
describe("ProfileRepository", () => {
  it("sin sesion lanza en vez de devolver un perfil vacio", async () => {
    const repo = new ProfileRepositoryImpl(fake<ProfileDataSource>({ isLoggedIn: false }));
    await expect(repo.getCurrentProfile()).rejects.toBeInstanceOf(ProfileFailure);
  });

  it("con sesion devuelve el perfil de la sesion, con el userId como id", async () => {
    const repo = new ProfileRepositoryImpl(
      fake<ProfileDataSource>({
        isLoggedIn: true,
        currentUser: async () => ({ id: "fila_9", userId: "u_123", name: "Ana", extra: { academicProgram: "Psicología", semester: 2, skills: ["Gestión"] } }),
      }),
    );
    expect(await repo.getCurrentProfile()).toEqual({
      id: "u_123",
      fullName: "Ana",
      academicProgram: "Psicología",
      semester: 2,
      skills: ["Gestión"],
      bio: null,
    });
  });

  it("en memoria, el perfil de la cuenta de la demo esta completo", async () => {
    const data = new DummyData({ latencyMs: 0 });
    data.session = data.users.find((u) => u.email === DummyData.demoEmail)!;
    const profile = await new ProfileRepositoryImpl(new ProfileInMemoryDataSource(data)).getCurrentProfile();
    expect(profile).toMatchObject({ id: "1", fullName: "Carlos Ruidíaz", academicProgram: "Ing. de Sistemas", semester: 8 });
    expect(profile.skills.length).toBeGreaterThan(0);
    expect(isComplete(profile)).toBe(true);
  });
});
