import { fireEvent, screen, waitFor, within } from "@testing-library/react-native";

import { AppCatalogs } from "@/src/core/catalogs";
import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { SignUpData } from "@/src/features/auth/domain/entities/AppUser";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import CompleteProfileScreen from "@/src/features/auth/presentation/screens/CompleteProfileScreen";
import SignupScreen from "@/src/features/auth/presentation/screens/SignupScreen";
import { fake } from "@/__tests__/support/fake";
import { renderScreen } from "@/__tests__/support/renderScreen";

// `registro_en_dos_pasos_test.dart`.
function renderSignup() {
  const signedUp: SignUpData[] = [];
  const repo = fake<AuthRepository>({
    restoreSession: async () => null,
    onSessionExpired: () => () => {},
    signUp: async (data) => {
      signedUp.push(data);
      return { userId: "u_nuevo", email: data.email, name: data.name };
    },
  });
  const container = createLocalContainer(new DummyData({ latencyMs: 0 })).register(TOKENS.AuthRepo, repo);
  renderScreen(SignupScreen, container, { routes: { CompleteProfile: CompleteProfileScreen } });
  return { signedUp };
}

async function fillStepOne(email = "ana@uninorte.edu.co", password = "UnaClaveLarga1", confirmation = password) {
  fireEvent.changeText(await screen.findByTestId(SignupScreen.emailFieldKey), email);
  fireEvent.changeText(screen.getByTestId(SignupScreen.passwordFieldKey), password);
  fireEvent.changeText(screen.getByTestId(SignupScreen.confirmationFieldKey), confirmation);
  fireEvent.press(screen.getByTestId(SignupScreen.continueButtonKey));
}

async function fillStepTwo(bio?: string) {
  await screen.findByTestId(CompleteProfileScreen.key);
  fireEvent.changeText(screen.getByTestId(CompleteProfileScreen.nameFieldKey), "Ana García");
  fireEvent.press(within(screen.getByTestId(CompleteProfileScreen.programFieldKey)).getByText(AppCatalogs.programSystems));
  fireEvent.press(screen.getByTestId(`${CompleteProfileScreen.semesterFieldKey}-add`));
  fireEvent.press(screen.getByTestId(CompleteProfileScreen.skillChipKey(AppCatalogs.skillPython)));
  fireEvent.press(screen.getByTestId(CompleteProfileScreen.skillChipKey(AppCatalogs.skillUx)));
  if (bio != null) fireEvent.changeText(screen.getByTestId(CompleteProfileScreen.bioFieldKey), bio);
}

describe("registro en dos pasos", () => {
  it("el paso 1 solo pide credenciales", async () => {
    renderSignup();
    expect(await screen.findByText("Paso 1 de 2")).toBeTruthy();
    expect(screen.getByTestId(SignupScreen.emailFieldKey)).toBeTruthy();
    expect(screen.getByTestId(SignupScreen.passwordFieldKey)).toBeTruthy();
    expect(screen.queryByText("Nombre completo")).toBeNull();
    expect(screen.queryByText(AppCatalogs.programSystems)).toBeNull();
    expect(screen.queryByText("Sobre ti (opcional)")).toBeNull();
  });

  it("el paso 1 no crea la cuenta: solo lleva al paso 2", async () => {
    const { signedUp } = renderSignup();
    await fillStepOne();
    expect(await screen.findByText("Paso 2 de 2")).toBeTruthy();
    expect(signedUp).toEqual([]);
  });

  it("un correo de fuera no pasa del paso 1", async () => {
    renderSignup();
    await fillStepOne("ana@gmail.com");
    expect(screen.getByText("Usa tu correo @uninorte.edu.co")).toBeTruthy();
    expect(screen.queryByTestId(CompleteProfileScreen.key)).toBeNull();
  });

  it("las contraseñas que no coinciden no pasan del paso 1", async () => {
    renderSignup();
    await fillStepOne("ana@uninorte.edu.co", "UnaClaveLarga1", "OtraClaveLarga1");
    expect(screen.getByText("Las contraseñas no coinciden")).toBeTruthy();
    expect(screen.queryByTestId(CompleteProfileScreen.key)).toBeNull();
  });

  it("el registro se manda entero al terminar el paso 2", async () => {
    const { signedUp } = renderSignup();
    await fillStepOne();
    await screen.findByTestId(CompleteProfileScreen.key);
    // Sin programa ni habilidades todavia no se puede crear la cuenta.
    expect(screen.getByTestId(CompleteProfileScreen.submitButtonKey)).toBeDisabled();
    await fillStepTwo("Me interesa la movilidad urbana.");
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.submitButtonKey));
    await waitFor(() => expect(signedUp).toHaveLength(1));
    expect(signedUp[0]).toEqual({
      email: "ana@uninorte.edu.co",
      password: "UnaClaveLarga1",
      name: "Ana García",
      academicProgram: AppCatalogs.programSystems,
      semester: 2,
      skills: [AppCatalogs.skillPython, AppCatalogs.skillUx],
      bio: "Me interesa la movilidad urbana.",
    });
  });

  it("la biografia es opcional", async () => {
    const { signedUp } = renderSignup();
    await fillStepOne();
    await fillStepTwo();
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.submitButtonKey));
    await waitFor(() => expect(signedUp).toHaveLength(1));
    expect(signedUp[0].bio).toBe("");
  });

  it("sin nombre pide escribirlo", async () => {
    const { signedUp } = renderSignup();
    await fillStepOne();
    await fillStepTwo();
    fireEvent.changeText(screen.getByTestId(CompleteProfileScreen.nameFieldKey), "  ");
    fireEvent.press(screen.getByTestId(CompleteProfileScreen.submitButtonKey));
    expect(await screen.findByText("Escribe tu nombre")).toBeTruthy();
    expect(signedUp).toEqual([]);
  });
});
