import { configure, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { AppRoot } from "@/App";
import { PendingScreen } from "@/src/core/components/PendingScreen";
import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";
import ProfileScreen from "@/src/features/profile/presentation/screens/ProfileScreen";
import { HomeTabKeys } from "@/src/navigation/BottomBar";

// `integration_test/login_test.dart`: la app entera (navegacion, pantallas,
// sesion y repositorios de verdad) con una sola cosa cambiada: los
// datasources, que son los de memoria. Corre en Jest, sin red ni cuenta.
//
// Diferencia con Flutter: alla la fuente falsa devolvia `false` con una
// contraseña mala y salia "No se pudo entrar. Revisa tus datos.". La de memoria
// responde como Roble, con un 401, y sale el texto de `error_message.dart`.
jest.setTimeout(20000);
configure({ asyncUtilTimeout: 5000 });

const email = "ana.perez@uninorte.edu.co";
const password = DummyData.demoPassword;

function startApp() {
  // Cada prueba con su propio backend en memoria: la sesion de una no se cuela
  // en la siguiente.
  const data = new DummyData({ latencyMs: 20 });
  render(<AppRoot container={createLocalContainer(data)} />);
  return data;
}

async function logIn(withPassword: string) {
  fireEvent.changeText(await screen.findByTestId(LoginScreen.emailFieldKey), email);
  fireEvent.changeText(screen.getByTestId(LoginScreen.passwordFieldKey), withPassword);
  fireEvent.press(screen.getByTestId(LoginScreen.submitButtonKey));
}

describe("flujo: login y cierre de sesion", () => {
  it("una contraseña incorrecta se queda en el login con un aviso, y la correcta entra al inicio", async () => {
    const data = startApp();
    expect(await screen.findByTestId(LoginScreen.key)).toBeTruthy();

    // 1. Contraseña incorrecta: no entra y avisa.
    await logIn("Otra!Clave9");
    expect(await screen.findByText("Correo o contrasena incorrectos.")).toBeTruthy();
    expect(screen.getByTestId(LoginScreen.key)).toBeTruthy();
    expect(data.session).toBeNull();

    // 2. Contraseña correcta: entra al inicio.
    await logIn(password);
    expect(await screen.findByTestId(PendingScreen.keyFor("CarteleraScreen"))).toBeTruthy();
    expect(screen.queryByTestId(LoginScreen.key)).toBeNull();
    expect(data.session?.email).toBe(email);
  });

  it("el perfil muestra a quien entro y cerrar sesion devuelve al login", async () => {
    const data = startApp();
    await logIn(password);
    await screen.findByTestId(PendingScreen.keyFor("CarteleraScreen"));

    // 3. El perfil es el de la cuenta que inicio sesion.
    fireEvent.press(screen.getByTestId(HomeTabKeys.profile));
    expect(await screen.findByTestId(ProfileScreen.key)).toBeTruthy();
    expect(await screen.findByText("Ana Pérez")).toBeTruthy();
    expect(screen.getByText("Ing. de Sistemas")).toBeTruthy();

    // 4. Cerrar sesion pide confirmacion y luego vuelve al login.
    fireEvent.press(screen.getByTestId(ProfileScreen.logoutButtonKey));
    fireEvent.press(await screen.findByTestId(ProfileScreen.logoutConfirmButtonKey));
    expect(await screen.findByTestId(LoginScreen.key)).toBeTruthy();
    expect(data.session).toBeNull();
  });
});
