import { ProfileMapper } from "@/src/features/profile/data/mappers/ProfileMapper";
import { isComplete } from "@/src/features/profile/domain/entities/Profile";

// Lo que devuelve `currentUser()` de Roble contra `Profile.fromJson` de
// Flutter (`profile_from_json_test.dart`).
const user = {
  id: "fila_del_perfil",
  userId: "u_123",
  email: "ana.perez@uninorte.edu.co",
  name: "Ana Pérez",
  role: "user",
  extra: { academicProgram: "Ing. de Sistemas", semester: 5, skills: ["Desarrollo web", "Python"] },
};

describe("ProfileMapper", () => {
  it("toma userId y no id", () => {
    expect(ProfileMapper.fromRow(user).id).toBe("u_123");
  });

  it("lee nombre, programa, semestre y habilidades del extra", () => {
    expect(ProfileMapper.fromRow(user)).toEqual({
      id: "u_123",
      fullName: "Ana Pérez",
      academicProgram: "Ing. de Sistemas",
      semester: 5,
      skills: ["Desarrollo web", "Python"],
      bio: null,
    });
  });

  it("la bio es opcional: sin ella el perfil sigue completo", () => {
    expect(isComplete(ProfileMapper.fromRow(user))).toBe(true);
  });

  it("una bio vacia o de espacios se lee como que no hay, y se guarda recortada", () => {
    expect(ProfileMapper.fromRow({ ...user, extra: { ...user.extra, bio: "   " } }).bio).toBeNull();
    expect(ProfileMapper.fromRow({ ...user, extra: { ...user.extra, bio: "  Hola  " } }).bio).toBe("Hola");
  });

  it("un extra vacio, o sin extra, no revienta: deja el perfil incompleto", () => {
    for (const extra of [{}, null, undefined]) {
      const p = ProfileMapper.fromRow({ ...user, extra });
      expect(p).toMatchObject({ academicProgram: "", semester: 0, skills: [], bio: null });
      expect(isComplete(p)).toBe(false);
    }
  });

  it("el semestre llega como texto y se lee igual", () => {
    expect(ProfileMapper.fromRow({ ...user, extra: { ...user.extra, semester: "7" } }).semester).toBe(7);
  });

  it("role en null no es un error", () => {
    expect(ProfileMapper.fromRow({ ...user, role: null }).fullName).toBe("Ana Pérez");
  });
});
