import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { AppRoot } from "@/App";
import { PendingScreen } from "@/src/core/components/PendingScreen";
import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import NotificationsScreen from "@/src/features/notifications/presentation/screens/NotificationsScreen";
import ProfileScreen from "@/src/features/profile/presentation/screens/ProfileScreen";
import { HomeTabKeys } from "@/src/navigation/BottomBar";

// `barra_inferior_test.dart`: la app con sesion, desde la barra inferior.
async function startSignedIn() {
  const data = new DummyData({ latencyMs: 0 });
  data.session = data.users.find((u) => u.email === DummyData.demoEmail)!;
  render(<AppRoot container={createLocalContainer(data)} />);
  await screen.findByTestId(PendingScreen.keyFor("CarteleraScreen"));
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
    expect(await screen.findByTestId(PendingScreen.keyFor("MyProjectsScreen"))).toBeTruthy();
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
    expect(await screen.findByTestId(PendingScreen.keyFor("CreateIdeaScreen"))).toBeTruthy();
    fireEvent.press(screen.getByTestId("BackButton"));
    expect(await screen.findByTestId(PendingScreen.keyFor("CarteleraScreen"))).toBeTruthy();
    expect(isSelected(HomeTabKeys.home)).toBe(true);
  });

  it("al ir y volver, la pestaña sigue montada", async () => {
    await startSignedIn();
    fireEvent.press(screen.getByTestId(HomeTabKeys.myProjects));
    await screen.findByTestId(PendingScreen.keyFor("MyProjectsScreen"));
    fireEvent.press(screen.getByTestId(HomeTabKeys.profile));
    await screen.findByTestId(ProfileScreen.key);
    // Las pestañas visitadas siguen montadas, como el IndexedStack de Flutter.
    expect(screen.getByTestId(PendingScreen.keyFor("MyProjectsScreen"), { includeHiddenElements: true })).toBeTruthy();
  });
});
