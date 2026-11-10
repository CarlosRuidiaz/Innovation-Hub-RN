import { useNavigation } from "@react-navigation/native";
import { act, fireEvent, RenderResult, screen, waitFor } from "@testing-library/react-native";
import React, { useEffect } from "react";
import { RefreshControl, Text } from "react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { WorkspacePollsBlock } from "@/src/features/poll/presentation/components/WorkspacePollsBlock";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { newProgressUpdate } from "@/src/features/workspace/domain/entities/ProgressUpdate";
import { WorkspaceRepository } from "@/src/features/workspace/domain/repositories/WorkspaceRepository";
import { LeaveProjectSheet } from "@/src/features/workspace/presentation/components/LeaveProjectSheet";
import { RemoveMemberSheet } from "@/src/features/workspace/presentation/components/RemoveMemberSheet";
import { SummaryTab } from "@/src/features/workspace/presentation/components/SummaryTab";
import WorkspaceScreen from "@/src/features/workspace/presentation/screens/WorkspaceScreen";
import { renderScreen } from "@/__tests__/support/renderScreen";

// `workspace_page_test.dart`, una por una.

// El perfil de quien mira, siempre el mismo.
class PerfilFijo implements ProfileRepository {
  constructor(readonly perfil: Profile) {}

  // Mientras tenga una pausa sin resolver, pedir el perfil espera. Deja una
  // recarga "en vuelo" para poder mirar la pantalla en ese momento.
  pausa: Promise<void> | null = null;

  async getCurrentProfile() {
    await this.pausa;
    return this.perfil;
  }
}

const perfil = (id: string, fullName: string): Profile => ({
  id,
  fullName,
  academicProgram: "Ing. de Sistemas",
  semester: 5,
  skills: ["Python"],
  bio: null,
});

// El proyecto '2' lo lidera el perfil '1'. Sus postulantes de prueba son u7
// (Mariana Pérez) y u8 (Felipe Gómez), los dos pendientes: `preparar` acepta a
// quien haga falta.
const lider = perfil("1", "Carlos Ruidíaz");
const mariana = perfil("u7", "Mariana Pérez");

const aceptarAMariana = (postulaciones: ApplicationRepository) => postulaciones.decide("1", "accepted");

// La pantalla principal, de donde se llega al espacio de trabajo: como el
// `home` de la prueba de Flutter, que despues hace `Get.toNamed`.
function PantallaPrincipal({ route }: { route: { params: { project: Project } } }) {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.navigate("Workspace", { project: route.params.project });
  }, [navigation, route.params.project]);
  return <Text>pantalla principal</Text>;
}

let container: Container;

async function abrir({
  perfil: quien,
  preparar,
}: {
  perfil: Profile;
  preparar?: (postulaciones: ApplicationRepository) => Promise<void>;
}): Promise<{ perfil: PerfilFijo; view: RenderResult }> {
  const fijo = new PerfilFijo(quien);
  container = createLocalContainer(new DummyData({ latencyMs: 0 })).register(TOKENS.ProfileRepo, fijo);

  await preparar?.(container.resolve<ApplicationRepository>(TOKENS.ApplicationRepo));
  const project = await proyecto();

  const view = renderScreen(PantallaPrincipal, container, {
    params: { project },
    routes: { Workspace: WorkspaceScreen },
  });
  // Abierto del todo: ya no esta el indicador de carga.
  await screen.findByTestId(WorkspaceScreen.key);
  await waitFor(() => expect(screen.queryByTestId(WorkspaceScreen.loadingKey)).toBeNull());
  return { perfil: fijo, view };
}

const proyecto = async () =>
  (await container.resolve<ProjectRepository>(TOKENS.ProjectRepo).getProjects()).find((p) => p.id === "2")!;

const estadoDeMariana = async () =>
  (await container.resolve<ApplicationRepository>(TOKENS.ApplicationRepo).getApplicationsFor("2")).find(
    (a) => a.id === "1",
  )!.status;

const irA = (pestania: number) => fireEvent.press(screen.getByTestId(WorkspaceScreen.tabKey(pestania)));

describe("WorkspaceScreen · quien entra", () => {
  it("un visitante que no lidera ni fue aceptado no entra", async () => {
    await abrir({ perfil: perfil("visitante", "Alguien Más") });

    expect(await screen.findByText(/No tienes acceso/)).toBeTruthy();
    expect(screen.queryByText("Miembros del equipo")).toBeNull();
  });

  it("abrir el espacio de trabajo no deja el indicador de carga puesto", async () => {
    await abrir({ perfil: lider });

    expect(await screen.findByText("Miembros del equipo")).toBeTruthy();
    expect(screen.queryByTestId(WorkspaceScreen.loadingKey)).toBeNull();
  });
});

describe("WorkspaceScreen · salir del proyecto", () => {
  it('un miembro ve "Salir del proyecto" y no "Remover"', async () => {
    await abrir({ perfil: mariana, preparar: aceptarAMariana });

    expect(await screen.findByTestId(SummaryTab.leaveKey)).toBeTruthy();
    expect(screen.getByText("Salir del proyecto")).toBeTruthy();
    expect(screen.queryByText("Remover")).toBeNull();
  });

  it('el lider no tiene "Salir del proyecto"', async () => {
    await abrir({ perfil: lider, preparar: aceptarAMariana });

    await screen.findByText("Miembros del equipo");
    expect(screen.queryByText("Salir del proyecto")).toBeNull();
  });

  it('pide confirmacion, y "Quedarme" no cambia nada', async () => {
    await abrir({ perfil: mariana, preparar: aceptarAMariana });

    fireEvent.press(await screen.findByTestId(SummaryTab.leaveKey));
    expect(await screen.findByText("¿Salir del proyecto?")).toBeTruthy();

    fireEvent.press(screen.getByTestId(LeaveProjectSheet.stayKey));
    await waitFor(() => expect(screen.queryByText("¿Salir del proyecto?")).toBeNull());

    expect(await estadoDeMariana()).toBe("accepted");
    expect((await proyecto()).currentMembers).toBe(2);
    expect(screen.getByText("Miembros del equipo")).toBeTruthy();
  });

  it("al confirmar: left, el contador baja y vuelve al inicio", async () => {
    await abrir({ perfil: mariana, preparar: aceptarAMariana });

    fireEvent.press(await screen.findByTestId(SummaryTab.leaveKey));
    fireEvent.press(await screen.findByTestId(LeaveProjectSheet.confirmKey));

    await waitFor(async () => expect(await estadoDeMariana()).toBe("left"));
    await waitFor(async () => expect((await proyecto()).currentMembers).toBe(1));
    // De vuelta a la pantalla principal, no en el espacio de trabajo.
    expect(await screen.findByText("pantalla principal")).toBeTruthy();
    await waitFor(() => expect(screen.queryByText("Miembros del equipo")).toBeNull());
  });
});

describe("WorkspaceScreen · remover y cambiar la etapa", () => {
  it('el lider ve "Remover" junto al miembro y no junto a si mismo', async () => {
    await abrir({ perfil: lider, preparar: aceptarAMariana });

    await screen.findByText("Mariana Pérez");
    expect(screen.getAllByText("Remover")).toHaveLength(1);
    expect(screen.getByTestId(SummaryTab.removeKey("u7"))).toBeTruthy();
  });

  it("remover pide confirmacion y deja al miembro en removed", async () => {
    await abrir({ perfil: lider, preparar: aceptarAMariana });

    fireEvent.press(await screen.findByText("Remover"));
    expect(await screen.findByText("¿Remover a Mariana Pérez?")).toBeTruthy();

    fireEvent.press(screen.getByTestId(RemoveMemberSheet.confirmKey));

    await waitFor(async () => expect(await estadoDeMariana()).toBe("removed"));
    await waitFor(async () => expect((await proyecto()).currentMembers).toBe(1));
    // El equipo de la pantalla ya no la incluye.
    await waitFor(() => expect(screen.queryByText("Mariana Pérez")).toBeNull());
    expect(screen.queryByText("Remover")).toBeNull();
  });

  it("cancelar no remueve a nadie", async () => {
    await abrir({ perfil: lider, preparar: aceptarAMariana });

    fireEvent.press(await screen.findByText("Remover"));
    fireEvent.press(await screen.findByTestId(RemoveMemberSheet.cancelKey));
    await waitFor(() => expect(screen.queryByTestId(RemoveMemberSheet.key)).toBeNull());

    expect(await estadoDeMariana()).toBe("accepted");
    expect(screen.getByText("Mariana Pérez")).toBeTruthy();
  });

  it("el lider elige entre las seis etapas y el proyecto cambia", async () => {
    await abrir({ perfil: lider });
    await screen.findByText("Miembros del equipo");

    // Las seis etapas a la vista como pildoras.
    for (const etapa of ["Idea", "Formando equipo", "Investigación", "Prototipo", "Pruebas", "Terminado"]) {
      expect(screen.getAllByText(etapa).length).toBeGreaterThan(0);
    }

    fireEvent.press(screen.getByText("Prototipo"));

    await waitFor(async () => expect((await proyecto()).stage).toBe("prototype"));
    // La cabecera de la pantalla ya muestra la etapa nueva.
    await waitFor(() => expect(screen.getAllByText("Prototipo")).toHaveLength(2));
  });

  it("un miembro ve la etapa pero no puede cambiarla", async () => {
    await abrir({ perfil: mariana, preparar: aceptarAMariana });
    await screen.findByText("Miembros del equipo");

    // Solo la etiqueta actual (en la cabecera y en "Estado actual").
    expect(screen.getAllByText("Idea")).toHaveLength(2);
    expect(screen.queryByText("Prototipo")).toBeNull();
    expect(screen.queryByText("Terminado")).toBeNull();
  });
});

describe("WorkspaceScreen · deslizar para refrescar", () => {
  it("las tres pestañas tienen su deslizar para refrescar", async () => {
    await abrir({ perfil: lider });

    for (const pestania of [0, 1, 2]) {
      irA(pestania);
      expect(screen.UNSAFE_getAllByType(RefreshControl)).toHaveLength(1);
    }
  });

  it("refrescar no reemplaza la pantalla por el indicador de carga", async () => {
    const { perfil: fijo } = await abrir({ perfil: lider, preparar: aceptarAMariana });
    await screen.findByText("Mariana Pérez");

    // La recarga queda en vuelo, esperando el perfil.
    let soltar: () => void = () => {};
    fijo.pausa = new Promise<void>((resolve) => {
      soltar = resolve;
    });
    let refrescando: Promise<void> = Promise.resolve();
    act(() => {
      refrescando = screen.UNSAFE_getByType(RefreshControl).props.onRefresh();
    });

    // Mientras se pide, lo que ya estaba sigue a la vista y no hay indicador
    // de carga de pantalla completa: solo gira el de deslizar.
    expect(screen.UNSAFE_getByType(RefreshControl).props.refreshing).toBe(true);
    expect(screen.getByText("Miembros del equipo")).toBeTruthy();
    expect(screen.getByText("Mariana Pérez")).toBeTruthy();
    expect(screen.queryByTestId(WorkspaceScreen.loadingKey)).toBeNull();

    soltar();
    await act(async () => {
      await refrescando;
    });
    expect(screen.UNSAFE_getByType(RefreshControl).props.refreshing).toBe(false);
    expect(screen.getByText("Mariana Pérez")).toBeTruthy();
  });

  it("deslizar hacia abajo en una lista vacia tambien refresca", async () => {
    await abrir({ perfil: lider });
    irA(1);
    expect(await screen.findByText(/Todavía no hay avances/)).toBeTruthy();

    // Un avance llega "desde fuera" (otro miembro lo publica).
    await container.resolve<WorkspaceRepository>(TOKENS.WorkspaceRepo).publishUpdate(
      newProgressUpdate({
        projectId: "2",
        authorId: "u7",
        authorName: "Mariana Pérez",
        title: "Avance de otro miembro",
        description: "Lo publicó otra persona",
        createdAt: new Date(2026, 8, 23),
        completionPercentage: 0,
      }),
    );

    await act(async () => {
      await screen.UNSAFE_getByType(RefreshControl).props.onRefresh();
    });

    expect(await screen.findByText("Avance de otro miembro")).toBeTruthy();
  });
});

describe("WorkspaceScreen · encuestas en el resumen", () => {
  it('un miembro ve "Salir del proyecto" y el bloque de encuestas', async () => {
    await abrir({ perfil: mariana, preparar: aceptarAMariana });

    expect(await screen.findByTestId(SummaryTab.leaveKey)).toBeTruthy();
    expect(screen.getByTestId(WorkspacePollsBlock.key)).toBeTruthy();
  });

  it('el lider ve el bloque de encuestas pero no "Salir"', async () => {
    await abrir({ perfil: lider, preparar: aceptarAMariana });

    expect(await screen.findByTestId(WorkspacePollsBlock.key)).toBeTruthy();
    expect(screen.queryByText("Salir del proyecto")).toBeNull();
  });
});
