import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { AppCatalogs } from "@/src/core/catalogs";
import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { CommunityBanner } from "@/src/features/project/presentation/components/CommunityBanner";
import { CommunityStats } from "@/src/features/project/presentation/components/CommunityStats";
import { ExploreSearchRow } from "@/src/features/project/presentation/components/ExploreSearchRow";
import { InnovationTypeChip } from "@/src/features/project/presentation/components/InnovationTypeChip";
import CarteleraScreen from "@/src/features/project/presentation/screens/CarteleraScreen";
import CreateIdeaScreen from "@/src/features/project/presentation/screens/CreateIdeaScreen";
import IdeaPublishedScreen from "@/src/features/project/presentation/screens/IdeaPublishedScreen";
import ProjectDetailScreen from "@/src/features/project/presentation/screens/ProjectDetailScreen";
import { renderScreen } from "@/__tests__/support/renderScreen";

// Kora en la cartelera, crear idea y el detalle, con los datos en memoria y la
// cuenta de la demo.
function signedIn() {
  const data = new DummyData({ latencyMs: 0 });
  data.session = data.users.find((u) => u.email === DummyData.demoEmail)!;
  return data;
}

describe("la frase de la comunidad", () => {
  it("sale en Para tus habilidades y no en Explorar", async () => {
    renderScreen(CarteleraScreen, createLocalContainer(signedIn()));
    expect(await screen.findByTestId(CommunityBanner.key)).toBeTruthy();
    expect(screen.getByText("Conectamos ideas, personas y soluciones")).toBeTruthy();
    fireEvent.press(screen.getByTestId(CarteleraScreen.exploreTabKey));
    await screen.findByTestId(CommunityStats.key);
    expect(screen.queryByTestId(CommunityBanner.key)).toBeNull();
  });
});

describe("las cifras en Explorar", () => {
  it("tocar Ideas filtra la lista y cuenta en el boton de filtros", async () => {
    const data = signedIn();
    renderScreen(CarteleraScreen, createLocalContainer(data));
    fireEvent.press(await screen.findByTestId(CarteleraScreen.exploreTabKey));
    const ideas = data.projects.filter((p) => p.stage === "idea").length;
    const idea = await screen.findByTestId(CommunityStats.ideasKey);
    expect(idea.props.accessibilityLabel).toBe(`${ideas} ${ideas === 1 ? "idea" : "ideas"}. Toca para ver solo las ideas`);
    fireEvent.press(idea);
    await waitFor(() => expect(screen.getAllByTestId(/^ProjectCard-/)).toHaveLength(ideas));
    expect(screen.getByText("Filtros (1)")).toBeTruthy();
    fireEvent.press(screen.getByTestId(CommunityStats.projectsKey));
    await waitFor(() => expect(screen.getAllByTestId(/^ProjectCard-/)).toHaveLength(data.projects.length));
    expect(screen.getByTestId(ExploreSearchRow.filtersButtonKey)).toBeTruthy();
    expect(screen.queryByText("Filtros (1)")).toBeNull();
  });
});

async function fillIdea() {
  fireEvent.changeText(await screen.findByTestId(CreateIdeaScreen.titleFieldKey), "Huerta en la terraza");
  fireEvent.changeText(screen.getByTestId(CreateIdeaScreen.problemFieldKey), "No hay zonas verdes");
  fireEvent.changeText(screen.getByTestId(CreateIdeaScreen.descriptionFieldKey), "Una huerta comunitaria");
  fireEvent.press(screen.getByTestId(`ChipIdeaSkill-${AppCatalogs.skillPython}`));
  fireEvent.press(screen.getByTestId("ChipIdeaStage-idea"));
  // El programa sale del perfil: espera a que cargue.
  await screen.findByText("6 de 7 campos obligatorios");
}

const publishDisabled = () => screen.getByTestId(CreateIdeaScreen.publishButtonKey).props.accessibilityState?.disabled;

describe("crear idea con tipo de innovacion", () => {
  it("no deja publicar sin tipo, y con tipo escribe su fila en project_types", async () => {
    const data = signedIn();
    renderScreen(CreateIdeaScreen, createLocalContainer(data), { routes: { IdeaPublished: IdeaPublishedScreen } });
    await fillIdea();
    expect(publishDisabled()).toBe(true);

    fireEvent.press(screen.getByTestId(InnovationTypeChip.keyFor("ChipIdeaType", "ambiental")));
    expect(await screen.findByText("7 de 7 campos obligatorios")).toBeTruthy();
    expect(publishDisabled()).toBe(false);
    fireEvent.press(screen.getByTestId(CreateIdeaScreen.publishButtonKey));

    expect(await screen.findByTestId(IdeaPublishedScreen.key)).toBeTruthy();
    const row = data.projects.find((p) => p.title === "Huerta en la terraza")!;
    expect(row).not.toHaveProperty("innovation_type");
    expect(data.projectTypes.at(-1)).toMatchObject({ project_id: row._id, innovation_type: "ambiental" });
  });

  it("si el tipo no se guarda, la idea se publica y se avisa", async () => {
    const container = createLocalContainer(signedIn());
    const real = container.resolve<ProjectRepository>(TOKENS.ProjectRepo);
    container.register<ProjectRepository>(TOKENS.ProjectRepo, {
      ...real,
      getProjects: () => real.getProjects(),
      createProject: async (p) => ({ ...(await real.createProject({ ...p, innovationType: null })), innovationType: null }),
    } as ProjectRepository);
    renderScreen(CreateIdeaScreen, container, { routes: { IdeaPublished: IdeaPublishedScreen } });
    await fillIdea();
    fireEvent.press(screen.getByTestId(InnovationTypeChip.keyFor("ChipIdeaType", "social")));
    fireEvent.press(screen.getByTestId(CreateIdeaScreen.publishButtonKey));
    expect(await screen.findByText("La idea se publicó, pero no se guardó su tipo.")).toBeTruthy();
    expect(await screen.findByTestId(IdeaPublishedScreen.key)).toBeTruthy();
  });
});

describe("el tipo en el detalle", () => {
  it("muestra la etiqueta con el tipo del proyecto", async () => {
    const container = createLocalContainer(signedIn());
    const projects = await container.resolve<ProjectRepository>(TOKENS.ProjectRepo).getProjects();
    const withType = projects.find((p) => p.innovationType === "tecnologica")!;
    renderScreen(ProjectDetailScreen, container, { params: { project: withType } });
    const chip = await screen.findByTestId(ProjectDetailScreen.typeChipKey);
    expect(chip.props.accessibilityLabel).toBe("Tipo de innovación: Tecnológica");
  });
});
