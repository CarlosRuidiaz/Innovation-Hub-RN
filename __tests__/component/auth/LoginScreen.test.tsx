import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";
import SignupScreen from "@/src/features/auth/presentation/screens/SignupScreen";
import { fake } from "@/__tests__/support/fake";
import { renderScreen } from "@/__tests__/support/renderScreen";

// `login_page_test.dart`.
function renderLogin() {
  const logins: [string, string][] = [];
  const repo = fake<AuthRepository>({
    restoreSession: async () => null,
    onSessionExpired: () => () => {},
    login: async (email, password) => {
      logins.push([email, password]);
      return { userId: "u1", email, name: "Ana" };
    },
  });
  const container = createLocalContainer(new DummyData({ latencyMs: 0 })).register(TOKENS.AuthRepo, repo);
  renderScreen(LoginScreen, container, { routes: { Signup: SignupScreen } });
  return { logins };
}

describe("LoginScreen", () => {
  it("los campos y los botones son visibles", async () => {
    renderLogin();
    expect(await screen.findByTestId(LoginScreen.key)).toBeTruthy();
    expect(screen.getByText("Innovation Hub")).toBeTruthy();
    expect(screen.getByTestId(LoginScreen.emailFieldKey)).toBeTruthy();
    expect(screen.getByTestId(LoginScreen.passwordFieldKey)).toBeTruthy();
    expect(screen.getByText("Entrar")).toBeTruthy();
    expect(screen.getByText("Crear cuenta")).toBeTruthy();
  });

  it("un correo que no es de uninorte muestra error de validacion", async () => {
    const { logins } = renderLogin();
    fireEvent.changeText(await screen.findByTestId(LoginScreen.emailFieldKey), "ana@gmail.com");
    fireEvent.changeText(screen.getByTestId(LoginScreen.passwordFieldKey), "UnaClaveLarga1");
    fireEvent.press(screen.getByTestId(LoginScreen.submitButtonKey));
    expect(screen.getByText("Usa tu correo @uninorte.edu.co")).toBeTruthy();
    expect(logins).toEqual([]);
  });

  it("una contraseña de menos de 7 caracteres muestra error", async () => {
    renderLogin();
    fireEvent.changeText(await screen.findByTestId(LoginScreen.emailFieldKey), "ana@uninorte.edu.co");
    fireEvent.changeText(screen.getByTestId(LoginScreen.passwordFieldKey), "123456");
    fireEvent.press(screen.getByTestId(LoginScreen.submitButtonKey));
    expect(screen.getByText("Debe tener al menos 7 caracteres")).toBeTruthy();
  });

  it("el formulario vacio muestra los errores de los dos campos", async () => {
    renderLogin();
    fireEvent.press(await screen.findByTestId(LoginScreen.submitButtonKey));
    expect(screen.getByText("Escribe tu correo")).toBeTruthy();
    expect(screen.getByText("Debe tener al menos 7 caracteres")).toBeTruthy();
  });

  it("con datos validos, Entrar llama al login", async () => {
    const { logins } = renderLogin();
    fireEvent.changeText(await screen.findByTestId(LoginScreen.emailFieldKey), "ana@uninorte.edu.co");
    fireEvent.changeText(screen.getByTestId(LoginScreen.passwordFieldKey), "UnaClaveLarga1");
    fireEvent.press(screen.getByTestId(LoginScreen.submitButtonKey));
    await waitFor(() => expect(logins).toEqual([["ana@uninorte.edu.co", "UnaClaveLarga1"]]));
  });

  it("Crear cuenta lleva al paso 1 del registro", async () => {
    renderLogin();
    fireEvent.press(await screen.findByTestId(LoginScreen.createAccountButtonKey));
    expect(await screen.findByTestId(SignupScreen.key)).toBeTruthy();
  });
});
