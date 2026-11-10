import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { Container } from "@/src/core/di/container";
import { DIProvider } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { AuthFailure } from "@/src/features/auth/domain/AuthFailure";
import { AppUser, isInstitutionalEmail, SignUpData } from "@/src/features/auth/domain/entities/AppUser";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { SessionProvider, useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { fake } from "@/__tests__/support/fake";

const ana: AppUser = { userId: "u1", email: "ana@uninorte.edu.co", name: "Ana García" };

// El repositorio falso de `authentication_controller_test.dart`: anota lo que
// le llega para comprobar que la validacion no sale a la red.
function fakeRepository(overrides: Partial<AuthRepository> = {}) {
  const signedUp: SignUpData[] = [];
  const logins: string[] = [];
  let expire: () => void = () => {};
  const repo = fake<AuthRepository>({
    restoreSession: async () => null,
    onSessionExpired: (listener) => {
      expire = listener;
      return () => {};
    },
    login: async (email) => {
      logins.push(email);
      return ana;
    },
    signUp: async (data) => {
      signedUp.push(data);
      return { userId: "u2", email: data.email, name: data.name };
    },
    logout: async () => {},
    ...overrides,
  });
  return { repo, signedUp, logins, expire: () => expire() };
}

function renderSession(repo: AuthRepository) {
  const container = new Container().register(TOKENS.AuthRepo, repo);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider container={container}>
      <SessionProvider>{children}</SessionProvider>
    </DIProvider>
  );
  return renderHook(() => useSession(), { wrapper });
}

const profile = { name: "Ana García", academicProgram: "Ing. de Sistemas", semester: 8, skills: ["Python", "Diseño UX"] };

describe("isInstitutionalEmail", () => {
  it("acepta el dominio de la universidad, sin distinguir mayusculas ni espacios", () => {
    expect(isInstitutionalEmail("ana@uninorte.edu.co")).toBe(true);
    expect(isInstitutionalEmail("  Ana@UniNorte.Edu.Co  ")).toBe(true);
  });

  it("rechaza cualquier otro dominio", () => {
    for (const email of ["ana@gmail.com", "ana@uninorte.edu", "ana@uninorte.edu.co.attacker.com", "ana@otrauninorte.edu.co.mx", "ana", ""]) {
      expect(isInstitutionalEmail(email)).toBe(false);
    }
  });
});

describe("SessionViewModel", () => {
  it("sin sesion guardada queda listo y fuera", async () => {
    const { result } = renderSession(fakeRepository().repo);
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.isLogged).toBe(false);
  });

  it("restaura la sesion guardada al abrir", async () => {
    const { result } = renderSession(fakeRepository({ restoreSession: async () => ana }).repo);
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.user).toEqual(ana);
  });

  it("si restaurar falla arranca sin sesion", async () => {
    const { result } = renderSession(
      fakeRepository({
        restoreSession: async () => {
          throw new AuthFailure("sin red");
        },
      }).repo,
    );
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.isLogged).toBe(false);
  });

  it("signUp con correo de fuera no sale a la red y explica por que", async () => {
    const { repo, signedUp } = fakeRepository();
    const { result } = renderSession(repo);
    let created = true;
    await act(async () => {
      created = await result.current.signUp("ana@gmail.com", "UnaClaveLarga1", profile);
    });
    expect(created).toBe(false);
    expect(signedUp).toEqual([]);
    expect(result.current.error).toContain("@uninorte.edu.co");
  });

  it("login con correo de fuera tampoco sale a la red", async () => {
    const { repo, logins } = fakeRepository();
    const { result } = renderSession(repo);
    let entered = true;
    await act(async () => {
      entered = await result.current.login("ana@gmail.com", "UnaClaveLarga1");
    });
    expect(entered).toBe(false);
    expect(logins).toEqual([]);
    expect(result.current.error).toBe("Usa tu correo institucional @uninorte.edu.co.");
  });

  it("signUp institucional manda el perfil completo al repositorio y deja la sesion abierta", async () => {
    const { repo, signedUp } = fakeRepository();
    const { result } = renderSession(repo);
    await act(async () => {
      await result.current.signUp("ana@uninorte.edu.co", "UnaClaveLarga1", profile);
    });
    expect(signedUp).toEqual([
      { email: "ana@uninorte.edu.co", password: "UnaClaveLarga1", name: "Ana García", academicProgram: "Ing. de Sistemas", semester: 8, skills: ["Python", "Diseño UX"], bio: undefined },
    ]);
    expect(result.current.isLogged).toBe(true);
  });

  it("sin nombre, la cuenta se llama como el correo", async () => {
    const { repo, signedUp } = fakeRepository();
    const { result } = renderSession(repo);
    await act(async () => {
      await result.current.signUp("ana@uninorte.edu.co", "UnaClaveLarga1", { ...profile, name: "   " });
    });
    expect(signedUp[0].name).toBe("ana@uninorte.edu.co");
  });

  it("una contraseña corta se corta antes que el dominio", async () => {
    const { repo, signedUp } = fakeRepository();
    const { result } = renderSession(repo);
    await act(async () => {
      await result.current.signUp("ana@uninorte.edu.co", "123", profile);
    });
    expect(signedUp).toEqual([]);
    expect(result.current.error).toContain("caracteres");
  });

  it("el error del repositorio llega como mensaje y lastError lo da enseguida", async () => {
    const { repo } = fakeRepository({
      login: async () => {
        throw new AuthFailure("Correo o contrasena incorrectos.");
      },
    });
    const { result } = renderSession(repo);
    await act(async () => {
      expect(await result.current.login("ana@uninorte.edu.co", "UnaClaveLarga1")).toBe(false);
      expect(result.current.lastError()).toBe("Correo o contrasena incorrectos.");
    });
    expect(result.current.error).toBe("Correo o contrasena incorrectos.");
  });

  it("logout cierra la sesion aunque el servidor falle", async () => {
    const { repo } = fakeRepository({
      restoreSession: async () => ana,
      logout: async () => {
        throw new AuthFailure("No hay conexion. Revisa tu internet e intentalo de nuevo.");
      },
    });
    const { result } = renderSession(repo);
    await waitFor(() => expect(result.current.isLogged).toBe(true));
    await act(async () => {
      expect(await result.current.logout()).toBe(false);
    });
    expect(result.current.isLogged).toBe(false);
  });

  it("si la sesion caduca sola, sale", async () => {
    const session = fakeRepository({ restoreSession: async () => ana });
    const { result } = renderSession(session.repo);
    await waitFor(() => expect(result.current.isLogged).toBe(true));
    act(() => session.expire());
    expect(result.current.isLogged).toBe(false);
  });
});
