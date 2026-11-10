import { fireEvent, waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { renderScreen } from "@/__tests__/support/renderScreen";
import CarteleraScreen from "@/src/features/project/presentation/screens/CarteleraScreen";

// Equivale a `home_page_test.dart`.
describe("CarteleraScreen", () => {
  function setup() {
    const data = new DummyData({ latencyMs: 0 });
    const container = createLocalContainer(data);
    return renderScreen(CarteleraScreen, container);
  }

  it("se renderiza con la testID correcta", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("CarteleraView"));
  });

  it("muestra las dos pestanas", async () => {
    const { getByTestId } = setup();
    await waitFor(() => {
      getByTestId("TabParaTusHabilidades");
      getByTestId("TabExplorar");
    });
  });

  it("la pestana 'Explorar' muestra los proyectos", async () => {
    const { getByTestId, getAllByTestId } = setup();

    // Cambiar a la pestana Explorar.
    await waitFor(() => getByTestId("TabExplorar"));
    fireEvent.press(getByTestId("TabExplorar"));

    // Deben aparecer tarjetas de proyecto.
    await waitFor(() => {
      const cards = getAllByTestId(/^ProjectCard-/);
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it("la fila de busqueda aparece en Explorar", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("TabExplorar"));
    fireEvent.press(getByTestId("TabExplorar"));
    await waitFor(() => getByTestId("TextFieldSearch"));
  });

  it("el boton de filtros aparece en Explorar", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("TabExplorar"));
    fireEvent.press(getByTestId("TabExplorar"));
    await waitFor(() => getByTestId("ButtonFilters"));
  });

  it("la pestana 'Para tus habilidades' muestra estado vacio sin sesion", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("TabParaTusHabilidades"));
    // Por defecto esta en 'Para tus habilidades' — sin sesion el vacio aparece.
    await waitFor(() => getByTestId("EmptyParaTusHabilidades"));
  });
});
