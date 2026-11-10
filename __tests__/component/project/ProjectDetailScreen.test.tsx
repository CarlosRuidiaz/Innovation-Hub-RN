import { waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { renderScreen } from "@/__tests__/support/renderScreen";
import ProjectDetailScreen from "@/src/features/project/presentation/screens/ProjectDetailScreen";
import { newProject } from "@/src/features/project/domain/entities/Project";
import { AppCatalogs } from "@/src/core/catalogs";

// Equivale a `project_detail_page_test.dart`.
describe("ProjectDetailScreen", () => {
  const proyecto = newProject({
    id: "1",
    title: "App de movilidad sostenible",
    problem: "Los estudiantes que viven lejos del campus pierden tiempo.",
    description: "Una app que arma rutas compartidas.",
    stage: "research",
    academicProgram: AppCatalogs.programArchitecture,
    currentMembers: 4,
    maxMembers: 6,
    skillsWanted: [AppCatalogs.skillData, AppCatalogs.skillUx],
    tags: [AppCatalogs.tagSustainability],
    leaderId: "u3",
  });

  function setup() {
    const data = new DummyData({ latencyMs: 0 });
    const container = createLocalContainer(data);
    return renderScreen(ProjectDetailScreen, container, { params: { project: proyecto } });
  }

  it("se renderiza con la testID correcta", async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId("ProjectDetailPage"));
  });

  it("muestra el titulo del proyecto", async () => {
    const { getByText } = setup();
    await waitFor(() => getByText("App de movilidad sostenible"));
  });

  it("muestra el programa academico", async () => {
    const { getByText } = setup();
    await waitFor(() => getByText(AppCatalogs.programArchitecture));
  });

  it("muestra el contador de miembros", async () => {
    const { getByText } = setup();
    await waitFor(() => getByText("4 de 6 miembros"));
  });

  it("muestra las habilidades requeridas", async () => {
    const { getByText } = setup();
    await waitFor(() => {
      getByText(AppCatalogs.skillData);
      getByText(AppCatalogs.skillUx);
    });
  });

  it("muestra la descripcion", async () => {
    const { getByText } = setup();
    await waitFor(() => getByText("Una app que arma rutas compartidas."));
  });
});
