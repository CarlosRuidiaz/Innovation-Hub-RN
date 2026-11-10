import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { AppRoot } from "@/App";
import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import MyProjectsScreen from "@/src/features/myProjects/presentation/screens/MyProjectsScreen";
import NotificationsScreen from "@/src/features/notifications/presentation/screens/NotificationsScreen";
import ProfileScreen from "@/src/features/profile/presentation/screens/ProfileScreen";
import CarteleraScreen from "@/src/features/project/presentation/screens/CarteleraScreen";
import CreateIdeaScreen from "@/src/features/project/presentation/screens/CreateIdeaScreen";
import { HomeTabKeys } from "@/src/navigation/BottomBar";

// `barra_inferior_test.dart`: la app con sesion, desde la barra inferior. Cada
// pantalla se busca por la `Key` de su pagina en Flutter, que la pantalla
// declara como `.key`: asi la prueba vale con la provisional y con la migrada.
async function startSignedIn() {
  const data = new DummyData({ latencyMs: 0 });
  data.session = data.users.find((u) => u.email === DummyData.demoEmail)!;
  render(<AppRoot container={createLocalContainer(data)} />);
  await screen.findByTestId(CarteleraScreen.key);
}

const isSelected = (key: string) => screen.getByTestId(key).props.accessibilityState?.selected === true;

describe("barra inferior", () => {
  it("arranca en la cartelera", async () => {
    await startSignedIn();
    expect(isSelected(HomeTabKeys.home)).toBe(true);
  });

  it("los cinco destinos estan visibles", async () => {
    await startSignedIn();
    for (const label of ["Inicio", "Mis proyectos", "Crear", "Notificaciones", "Perfil"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("cada pestaña abre su pantalla y queda marcada", async () => {
    await startSignedIn();
    fireEvent.press(screen.getByTestId(HomeTabKeys.myProjects));
    expect(await screen.findByTestId(MyProjectsScreen.key)).toBeTruthy();
    expect(isSelected(HomeTabKeys.myProjects)).toBe(true);
    expect(isSelected(HomeTabKeys.home)).toBe(false);

    fireEvent.press(screen.getByTestId(HomeTabKeys.notifications));
    expect(await screen.findByTestId(NotificationsScreen.key)).toBeTruthy();
    expect(screen.getByText("Todavía no tienes notificaciones")).toBeTruthy();

    fireEvent.press(screen.getByTestId(HomeTabKeys.profile));
    expect(await screen.findByTestId(ProfileScreen.key)).toBeTruthy();
  });

  it("Crear abre la nueva idea encima y no cambia de pestaña", async () => {
    await startSignedIn();
    fireEvent.press(screen.getByTestId(HomeTabKeys.create));
    expect(await screen.findByTestId(CreateIdeaScreen.key)).toBeTruthy();
    fireEvent.press(screen.getByTestId("BackButton"));
    expect(await screen.findByTestId(CarteleraScreen.key)).toBeTruthy();
    expect(isSelected(HomeTabKeys.home)).toBe(true);
  });

  it("al ir y volver, la pestaña sigue montada", async () => {
    await startSignedIn();
    fireEvent.press(screen.getByTestId(HomeTabKeys.myProjects));
    await screen.findByTestId(MyProjectsScreen.key);
    fireEvent.press(screen.getByTestId(HomeTabKeys.profile));
    await screen.findByTestId(ProfileScreen.key);
    // Las pestañas visitadas siguen montadas, como el IndexedStack de Flutter.
    expect(screen.getByTestId(MyProjectsScreen.key, { includeHiddenElements: true })).toBeTruthy();
  });
});
