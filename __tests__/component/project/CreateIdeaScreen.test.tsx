import { waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { AppCatalogs } from "@/src/core/catalogs";
import { renderScreen } from "@/__tests__/support/renderScreen";
import CreateIdeaScreen from "@/src/features/project/presentation/screens/CreateIdeaScreen";
import IdeaPublishedScreen from "@/src/features/project/presentation/screens/IdeaPublishedScreen";

// Equivale a `create_idea_page_test.dart`.
describe("CreateIdeaScreen", () => {
  function setup() {
    const data = new DummyData({ latencyMs: 0 });
    const container = createLocalContainer(data);
    return renderScreen(CreateIdeaScreen, container, {
      routes: { IdeaPublished: IdeaPublishedScreen },
    });
  }

  it("se renderiza con la testID correcta", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("CreateIdeaPage"));
  });

  it("el boton Publicar esta deshabilitado al entrar", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("ButtonIdeaPublish"));
    const btn = getByTestId("ButtonIdeaPublish");
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it("muestra las tres secciones del formulario", async () => {
    const { getByText } = setup();
    await waitFor(() => {
      getByText("01 · Lo esencial");
      getByText("02 · El equipo que buscas");
      getByText("03 · Dale contexto · opcional");
    });
  });

  it("muestra el campo de titulo", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("TextFormFieldIdeaTitle"));
  });

  it("muestra el campo de problema", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("TextFormFieldIdeaProblem"));
  });

  it("muestra el campo de descripcion", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("TextFormFieldIdeaDescription"));
  });

  it("muestra el stepper de miembros", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("FieldIdeaMaxMembers"));
  });

  it("muestra todas las habilidades del catalogo como chips", async () => {
    const { getByTestId } = setup();
    await waitFor(() => {
      getByTestId(`ChipIdeaSkill-${AppCatalogs.skillUx}`);
      getByTestId(`ChipIdeaSkill-${AppCatalogs.skillWeb}`);
      getByTestId(`ChipIdeaSkill-${AppCatalogs.skillData}`);
    });
  });

  it("muestra todas las etapas como chips de seleccion", async () => {
    const { getByTestId } = setup();
    await waitFor(() => {
      getByTestId("ChipIdeaStage-idea");
      getByTestId("ChipIdeaStage-teamFormation");
      getByTestId("ChipIdeaStage-research");
    });
  });

  it("el contador de progreso empieza en 0 de 6", async () => {
    const { getByText } = setup();
    await waitFor(() => getByText("0 de 6 campos obligatorios"));
  });
});
