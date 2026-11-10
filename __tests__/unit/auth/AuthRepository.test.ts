import { RobleApiAuthException, RobleApiHttpException, RobleApiNetworkException } from "roble-client";

import { DummyData } from "@/src/core/data/dummyData";
import { errorMessage } from "@/src/core/roble/errorMessage";
import { Row } from "@/src/core/roble/guard";
import { AuthDataSource } from "@/src/features/auth/data/datasources/AuthDataSource";
import { AuthInMemoryDataSource, robleAcceptsPassword } from "@/src/features/auth/data/datasources/AuthInMemoryDataSource";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { AuthFailure } from "@/src/features/auth/domain/AuthFailure";
import { fake } from "@/__tests__/support/fake";

const signUp = {
  email: " ana@uninorte.edu.co ",
  password: "UnaClave!1",
  name: " Ana García ",
  academicProgram: "Ing. de Sistemas",
  semester: 8,
  skills: ["Python", "Diseño UX"],
};

// `roble_authentication_source_test.dart`: lo que el repositorio le manda a la fuente.
describe("AuthRepository con una fuente falsa", () => {
  it("signUp manda el perfil en el extra, con los nombres que lee Flutter", async () => {
    const sent: Row[] = [];
    const repo = new AuthRepositoryImpl(
      fake<AuthDataSource>({
        register: async (params) => {
          sent.push(params);
          return { userId: "u_nuevo", email: params.email, name: params.name };
        },
      }),
    );
    const user = await repo.signUp({ ...signUp, bio: "  Me interesa la movilidad.  " });
    expect(sent).toEqual([
      {
        email: "ana@uninorte.edu.co",
        password: "UnaClave!1",
        name: "Ana García",
        extra: { academicProgram: "Ing. de Sistemas", semester: 8, skills: ["Python", "Diseño UX"], bio: "Me interesa la movilidad." },
      },
    ]);
    expect(user).toEqual({ userId: "u_nuevo", email: "ana@uninorte.edu.co", name: "Ana García" });
  });

  it("sin bio, o con una de espacios, el extra no la lleva", async () => {
    const extras: Row[] = [];
    const repo = new AuthRepositoryImpl(
      fake<AuthDataSource>({
        register: async (params) => {
          extras.push(params.extra);
          return { userId: "u" };
        },
      }),
    );
    await repo.signUp(signUp);
    await repo.signUp({ ...signUp, bio: "   " });
    expect(extras).toEqual([
      { academicProgram: "Ing. de Sistemas", semester: 8, skills: ["Python", "Diseño UX"] },
      { academicProgram: "Ing. de Sistemas", semester: 8, skills: ["Python", "Diseño UX"] },
    ]);
  });

  it("login manda el correo limpio y toma userId para el usuario", async () => {
    const logins: string[] = [];
    const repo = new AuthRepositoryImpl(
      fake<AuthDataSource>({
        login: async (email) => {
          logins.push(email);
          return { id: "fila_del_perfil", userId: "u_123", email, name: "Ana" };
        },
      }),
    );
    expect(await repo.login("  ana@uninorte.edu.co ", "x")).toEqual({ userId: "u_123", email: "ana@uninorte.edu.co", name: "Ana" });
    expect(logins).toEqual(["ana@uninorte.edu.co"]);
  });

  it("restoreSession sin sesion en Roble devuelve null", async () => {
    const repo = new AuthRepositoryImpl(fake<AuthDataSource>({ restoreSession: async () => false }));
    expect(await repo.restoreSession()).toBeNull();
  });

  it("cuando Roble rechaza, sale un AuthFailure con el texto de error_message.dart", async () => {
    const repo = new AuthRepositoryImpl(
      fake<AuthDataSource>({
        login: async () => {
          throw new RobleApiHttpException(401, "Unauthorized");
        },
      }),
    );
    await expect(repo.login("ana@uninorte.edu.co", "x")).rejects.toEqual(new AuthFailure("Correo o contrasena incorrectos."));
  });
});

describe("errorMessage", () => {
  it("traduce cada excepcion con los textos de Flutter", () => {
    expect(errorMessage(new RobleApiNetworkException("x"))).toBe("No hay conexion. Revisa tu internet e intentalo de nuevo.");
    expect(errorMessage(new RobleApiAuthException("x"))).toBe("Tu sesion expiro. Vuelve a entrar.");
    expect(errorMessage(new RobleApiHttpException(409, "x"))).toBe("Ese correo ya esta registrado. Entra con el o usa otro.");
    expect(errorMessage(new RobleApiHttpException(503, "x"))).toBe("El servidor tuvo un problema. Intentalo mas tarde.");
    expect(errorMessage(new RobleApiHttpException(418, "x"))).toBe("No se pudo completar la operacion. Intentalo de nuevo.");
    expect(errorMessage(new Error("x"))).toBe("Ocurrio un error inesperado. Intentalo de nuevo.");
    expect(errorMessage(new Error("x"), "Otro")).toBe("Otro");
  });
});

// La fuente en memoria imita a Roble, con sus mismos errores.
describe("AuthRepository en memoria", () => {
  let data: DummyData;
  let repo: AuthRepositoryImpl;

  beforeEach(() => {
    data = new DummyData({ latencyMs: 0 });
    repo = new AuthRepositoryImpl(new AuthInMemoryDataSource(data));
  });

  it("entra con la cuenta de la demo, y la sesion se restaura en la misma corrida", async () => {
    expect((await repo.login(DummyData.demoEmail, DummyData.demoPassword)).userId).toBe("1");
    expect((await repo.restoreSession())?.name).toBe("Carlos Ruidíaz");
    await repo.logout();
    expect(await repo.restoreSession()).toBeNull();
  });

  it("una contraseña mala es un 401", async () => {
    await expect(repo.login(DummyData.demoEmail, "Otra!Clave9")).rejects.toEqual(new AuthFailure("Correo o contrasena incorrectos."));
  });

  it("registrar crea la cuenta con su extra y deja la sesion abierta", async () => {
    const user = await repo.signUp(signUp);
    expect(data.session?.userId).toBe(user.userId);
    expect(data.session?.extra).toEqual({ academicProgram: "Ing. de Sistemas", semester: 8, skills: ["Python", "Diseño UX"] });
  });

  it("un correo que ya tiene cuenta es un 409, sin distinguir mayusculas", async () => {
    await expect(repo.signUp({ ...signUp, email: "Ana.Perez@uninorte.edu.co" })).rejects.toEqual(
      new AuthFailure("Ese correo ya esta registrado. Entra con el o usa otro."),
    );
    expect(data.session).toBeNull();
  });

  it("una contraseña que Roble no acepta es un 400", async () => {
    await expect(repo.signUp({ ...signUp, password: "solominusculas" })).rejects.toBeInstanceOf(AuthFailure);
    expect(robleAcceptsPassword("MiClave!1")).toBe(true);
    for (const weak of ["MiClave1", "miclave!1", "MICLAVE!1", "MiClave!", "Mi!1"]) expect(robleAcceptsPassword(weak)).toBe(false);
  });
});
