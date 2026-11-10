import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { AppCatalogs } from "@/src/core/catalogs";
import { renderScreen } from "@/__tests__/support/renderScreen";
import ProjectFiltersScreen from "@/src/features/project/presentation/screens/ProjectFiltersScreen";

// Equivale a `project_filters_page_test.dart` y `tag_filters_test.dart`.
describe("ProjectFiltersScreen", () => {
  function setup() {
    const data = new DummyData({ latencyMs: 0 });
    const container = createLocalContainer(data);
    return renderScreen(ProjectFiltersScreen, container);
  }

  it("muestra los cuatro grupos de filtros", async () => {
    const { getByTestId } = setup();
    await waitFor(() => {
      getByTestId("grupo-habilidades");
      getByTestId("grupo-programas");
      getByTestId("grupo-etapas");
      getByTestId("grupo-categorias");
    });
  });

  it("tiene el boton 'Aplicar filtros'", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("ButtonApplyFilters"));
  });

  it("marcar una habilidad la selecciona y el boton muestra '1 filtro'", async () => {
    const { getByTestId, getByText } = setup();
    await waitFor(() => getByTestId("grupo-habilidades"));

    fireEvent.press(getByText(AppCatalogs.skillUx));

    await waitFor(() => getByText("Aplicar 1 filtro"));
  });

  it("marcar dos grupos distintos muestra '2 filtros'", async () => {
    const { getByTestId, getByText } = setup();
    await waitFor(() => getByTestId("grupo-habilidades"));

    fireEvent.press(getByText(AppCatalogs.skillUx));
    fireEvent.press(getByText(AppCatalogs.programSystems));

    await waitFor(() => getByText("Aplicar 2 filtros"));
  });

  it("desmarcar deja el boton en 'Aplicar filtros'", async () => {
    const { getByTestId, getByText } = setup();
    await waitFor(() => getByTestId("grupo-habilidades"));

    fireEvent.press(getByText(AppCatalogs.skillUx));
    fireEvent.press(getByText(AppCatalogs.skillUx));

    await waitFor(() => getByText("Aplicar filtros"));
  });

  it("muestra todas las etapas del catalogo", async () => {
    const { getAllByText, getByText } = setup();
    await waitFor(() => {
      getByText("Idea");
      getByText("Formando equipo");
      // "Investigación" aparece en habilidades y etapas, así que hay dos.
      expect(getAllByText("Investigación").length).toBeGreaterThanOrEqual(2);
      getByText("Prototipo");
      getByText("Pruebas");
      getByText("Terminado");
    });
  });
});
