import { configure, fireEvent, render, screen, within } from "@testing-library/react-native";
import React from "react";

import { AppRoot } from "@/App";
import { AppCatalogs } from "@/src/core/catalogs";
import { PendingScreen } from "@/src/core/components/PendingScreen";
import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import CompleteProfileScreen from "@/src/features/auth/presentation/screens/CompleteProfileScreen";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";
import SignupScreen from "@/src/features/auth/presentation/screens/SignupScreen";

// `integration_test/crear_usuario_test.dart`, con la app entera sobre los
// datos en memoria.
//
// Diferencia con Flutter: alla la fuente falsa devolvia `false` con un correo
// repetido y salia "No se pudo crear la cuenta. Intentalo de nuevo.". La de
// memoria responde como Roble, con un 409, y sale el texto de
// `error_message.dart`.
jest.setTimeout(20000);
configure({ asyncUtilTimeout: 5000 });

// Cumple la regla de contraseñas de Roble.
const validPassword = "MiClave!1";

async function writeCredentials(email: string) {
  fireEvent.changeText(await screen.findByTestId(SignupScreen.emailFieldKey), email);
  fireEvent.changeText(screen.getByTestId(SignupScreen.passwordFieldKey), validPassword);
  fireEvent.changeText(screen.getByTestId(SignupScreen.confirmationFieldKey), validPassword);
}

describe("flujo: crear una cuenta", () => {
  it("una cuenta nueva pasa por los dos pasos, queda con su perfil y entra al inicio", async () => {
    const data = new DummyData({ latencyMs: 20 });
    render(<AppRoot container={createLocalContainer(data)} />);

    // 1. La app abre en el login y desde ahi se llega al registro.
    fireEvent.press(await screen.findByTestId(LoginScreen.createAccountButtonKey));
    expect(await screen.findByTestId(SignupScreen.key)).toBeTruthy();

    // 2. Con un correo de fuera no pasa del paso 1.
    await writeCredentials("estudiante@gmail.com");
    fireEvent.press(screen.getByTestId(SignupScreen.continueButtonKey));
    expect(screen.getByText("Usa tu correo @uninorte.edu.co")).toBeTruthy();
    expect(screen.queryByTestId(CompleteProfileScreen.key)).toBeNull();

    // 3. Con correo institucional y contraseña valida, llega al paso 2.
    const email = "nuevo.estudiante@uninorte.edu.co";
    await writeCredentials(email);
    fireEvent.press(screen.getByTestId(SignupScreen.continueButtonKey));
    expect(await screen.findByTestId(CompleteProfileScreen.key)).toBeTruthy();

    // Sin programa ni habilidades todavia no se puede crear la cuenta.
    expect(screen.getByTestId(CompleteProfileScreen.submitButtonKey)).toBeDisabled();

    // 4. Llena el perfil: nombre, programa, semestre, habilidades y bio.
    fireEvent.changeText(screen.getByTestId(CompleteProfileScreen.nameFieldKey), "Nuevo Estudiante");
    fireEvent.press(within(screen.getByTestId(CompleteProfileScreen.programFieldKey)).getByText(AppCatalogs.programSystems));
    // El semestre arranca en 1: tres toques en "+" lo dejan en 4.
    for (let i = 0; i < 3; i++) fireEvent.press(screen.getByTestId(`${CompleteProfileScreen.semesterFieldKey}-add`));
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.skillChipKey(AppCatalogs.skillWeb)));
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.skillChipKey(AppCatalogs.skillPython)));
    fireEvent.changeText(screen.getByTestId(CompleteProfileScreen.bioFieldKey), "Me interesa la movilidad sostenible.");
    expect(screen.getByTestId(CompleteProfileScreen.submitButtonKey)).not.toBeDisabled();
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.submitButtonKey));

    // 5. La cuenta queda creada, con la sesion abierta, y llega al inicio.
    expect(await screen.findByTestId(PendingScreen.keyFor("CarteleraScreen"))).toBeTruthy();
    expect(screen.queryByTestId(CompleteProfileScreen.key)).toBeNull();
    expect(screen.queryByTestId(LoginScreen.key)).toBeNull();

    const account = data.users.find((u) => u.email === email)!;
    expect(account.name).toBe("Nuevo Estudiante");
    // El mismo `extra` que manda Flutter: asi la app Flutter ve el perfil completo.
    expect(account.extra).toEqual({
      academicProgram: AppCatalogs.programSystems,
      semester: 4,
      skills: [AppCatalogs.skillWeb, AppCatalogs.skillPython],
      bio: "Me interesa la movilidad sostenible.",
    });
    expect(data.session?.userId).toBe(account.userId);
  });

  it("un correo que ya tiene cuenta no crea otra y se queda en el paso 2 con un aviso", async () => {
    const data = new DummyData({ latencyMs: 20 });
    const accounts = data.users.length;
    render(<AppRoot container={createLocalContainer(data)} />);

    fireEvent.press(await screen.findByTestId(LoginScreen.createAccountButtonKey));
    await writeCredentials("Ana.Perez@uninorte.edu.co");
    fireEvent.press(screen.getByTestId(SignupScreen.continueButtonKey));
    expect(await screen.findByTestId(CompleteProfileScreen.key)).toBeTruthy();

    fireEvent.changeText(screen.getByTestId(CompleteProfileScreen.nameFieldKey), "Otra Ana");
    fireEvent.press(within(screen.getByTestId(CompleteProfileScreen.programFieldKey)).getByText(AppCatalogs.programBusiness));
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.skillChipKey(AppCatalogs.skillData)));
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.submitButtonKey));

    // No entra a la app, avisa, y la cuenta de antes sigue siendo una sola.
    expect(await screen.findByText("Ese correo ya esta registrado. Entra con el o usa otro.")).toBeTruthy();
    expect(screen.getByTestId(CompleteProfileScreen.key)).toBeTruthy();
    expect(screen.queryByTestId(PendingScreen.keyFor("CarteleraScreen"))).toBeNull();
    expect(data.users).toHaveLength(accounts);
    expect(data.session).toBeNull();
  });
});
