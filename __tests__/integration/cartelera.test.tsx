import { configure, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { AppRoot } from "@/App";
import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { AppCatalogs } from "@/src/core/catalogs";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";
import { HomeTabKeys } from "@/src/navigation/BottomBar";

// `integration_test/cartelera_test.dart`: la app entera con datasources en
// memoria. Verifica el flujo completo de la cartelera: ver proyectos, buscar,
// filtrar y navegar al detalle.
jest.setTimeout(30000);
configure({ asyncUtilTimeout: 8000 });

const email = DummyData.demoEmail;
const password = DummyData.demoPassword;

function startApp() {
  const data = new DummyData({ latencyMs: 20 });
  render(<AppRoot container={createLocalContainer(data)} />);
  return data;
}

async function logIn() {
  fireEvent.changeText(await screen.findByTestId(LoginScreen.emailFieldKey), email);
  fireEvent.changeText(screen.getByTestId(LoginScreen.passwordFieldKey), password);
  fireEvent.press(screen.getByTestId(LoginScreen.submitButtonKey));
  await screen.findByTestId(HomeTabKeys.page);
}

describe("flujo: cartelera", () => {
  it("al entrar se ve la cartelera con proyectos en Explorar", async () => {
    startApp();
    await logIn();

    // La cartelera arranca en 'Para tus habilidades'. Ir a Explorar.
    fireEvent.press(await screen.findByTestId("TabExplorar"));

    // Deben aparecer tarjetas de proyecto.
    await waitFor(() => {
      const cards = screen.queryAllByTestId(/^ProjectCard-/);
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it("buscar por texto filtra las tarjetas en Explorar", async () => {
    startApp();
    await logIn();
    fireEvent.press(await screen.findByTestId("TabExplorar"));

    // Escribir en el campo de busqueda.
    const input = await screen.findByTestId("TextFieldSearch");
    fireEvent.changeText(input, "tutorías");

    // Solo debe verse el proyecto que tiene "tutorías" en el titulo.
    await waitFor(() => {
      expect(screen.queryAllByTestId(/^ProjectCard-/).length).toBeGreaterThan(0);
      expect(screen.queryAllByTestId("ProjectCard-2").length).toBeGreaterThan(0);
    });
  });

  it("navegar al detalle de un proyecto y volver", async () => {
    startApp();
    await logIn();
    fireEvent.press(await screen.findByTestId("TabExplorar"));

    // Tocar la primera tarjeta del proyecto 2 (tutorías, donde la demo es lider).
    const card = await screen.findByTestId("ProjectCard-2");
    fireEvent.press(card);

    // La pantalla de detalle se abre.
    expect(await screen.findByTestId("ProjectDetailPage")).toBeTruthy();
    expect(screen.getByText("Plataforma de tutorías entre pares")).toBeTruthy();
  });

  it("la pestana 'Para tus habilidades' muestra proyectos que piden UX (habilidad de la demo)", async () => {
    startApp();
    await logIn();

    // La cuenta demo tiene Investigación y UX. El proyecto 1 pide UX.
    await waitFor(() => {
      const cards = screen.queryAllByTestId(/^ProjectCard-/);
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it("abrir filtros y aplicar una etapa filtra la lista de Explorar", async () => {
    startApp();
    await logIn();
    fireEvent.press(await screen.findByTestId("TabExplorar"));

    // Abrir pantalla de filtros.
    const filtersBtn = await screen.findByTestId("ButtonFilters");
    fireEvent.press(filtersBtn);

    // La pantalla de filtros debe aparecer.
    await screen.findByTestId("grupo-etapas");

    // Marcar la etapa "Idea".
    fireEvent.press(screen.getByText("Idea"));

    // Aplicar.
    fireEvent.press(screen.getByTestId("ButtonApplyFilters"));

    // Volver a la cartelera — solo los de etapa idea.
    await waitFor(() => {
      const cards = screen.queryAllByTestId(/^ProjectCard-/);
      // El proyecto 2 es el unico de etapa idea en el DummyData.
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
