import { fireEvent, screen } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { ShowcaseProjectCard } from "@/src/features/showcase/presentation/components/ShowcaseProjectCard";
import PrototypeFeedbackScreen from "@/src/features/showcase/presentation/screens/PrototypeFeedbackScreen";
import ShowcaseScreen from "@/src/features/showcase/presentation/screens/ShowcaseScreen";
import { renderScreen } from "@/__tests__/support/renderScreen";

// La vitrina con los datos en memoria y la cuenta de la demo.
function start() {
  const data = new DummyData({ latencyMs: 0 });
  data.session = data.users.find((u) => u.email === DummyData.demoEmail)!;
  renderScreen(ShowcaseScreen, createLocalContainer(data), { routes: { PrototypeDetail: PrototypeFeedbackScreen } });
  return data;
}

describe("ShowcaseScreen", () => {
  it("muestra solo los proyectos en etapa Prototype, con sus comentarios y su promedio", async () => {
    const data = start();
    expect(await screen.findByTestId(ShowcaseProjectCard.keyFor("3"))).toBeTruthy();
    expect(screen.getByText("Vitrina de prototipos")).toBeTruthy();
    // Dos comentarios (uno es respuesta) y una calificacion de 4, 5, 4 y 3.
    expect(await screen.findByText("2 comentarios · 4.0 ★")).toBeTruthy();

    const others = data.projects.filter((p) => p.stage !== "prototype");
    expect(others.length).toBeGreaterThan(0);
    for (const p of others) {
      expect(screen.queryByTestId(ShowcaseProjectCard.keyFor(String(p._id)))).toBeNull();
      expect(screen.queryByText(String(p.title))).toBeNull();
    }
  });

  it("sin prototipos muestra el vacio de Flutter", async () => {
    const data = new DummyData({ latencyMs: 0 });
    data.session = data.users.find((u) => u.email === DummyData.demoEmail)!;
    data.projects = data.projects.filter((p) => p.stage !== "prototype");
    renderScreen(ShowcaseScreen, createLocalContainer(data));
    expect(await screen.findByText("No hay prototipos en vitrina")).toBeTruthy();
    expect(screen.getByText("Por ahora ningún proyecto se encuentra en la etapa Prototype.")).toBeTruthy();
  });

  it("tocar un prototipo abre su detalle", async () => {
    start();
    fireEvent.press(await screen.findByTestId(ShowcaseProjectCard.keyFor("3")));
    expect(await screen.findByTestId(PrototypeFeedbackScreen.key)).toBeTruthy();
  });
});
