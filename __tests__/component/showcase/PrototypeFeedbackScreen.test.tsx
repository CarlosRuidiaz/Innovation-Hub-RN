import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { TOKENS } from "@/src/core/di/tokens";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { FeedbackSheetKeys } from "@/src/features/showcase/presentation/components/FeedbackSheet";
import PrototypeFeedbackScreen, { PrototypeKeys } from "@/src/features/showcase/presentation/screens/PrototypeFeedbackScreen";
import { renderScreen } from "@/__tests__/support/renderScreen";

// El detalle del prototipo "3" de los datos en memoria, abierto por una cuenta.
async function openAs(email: string) {
  const data = new DummyData({ latencyMs: 0 });
  data.session = data.users.find((u) => u.email === email)!;
  const container = createLocalContainer(data);
  const projects = await container.resolve<ProjectRepository>(TOKENS.ProjectRepo).getProjects();
  const project = projects.find((p) => p.id === "3")!;
  renderScreen(PrototypeFeedbackScreen, container, { params: { project } });
  // El hilo sembrado: el comentario de Mariana y la respuesta del equipo.
  expect(await screen.findByText("Mariana Pérez")).toBeTruthy();
  return data;
}

describe("PrototypeFeedbackScreen", () => {
  it("un estudiante de fuera comenta y deja su retroalimentacion, que cambia los promedios", async () => {
    const data = await openAs("ana.perez@uninorte.edu.co");
    expect(screen.getByText("EQUIPO DEL PROYECTO")).toBeTruthy();
    // Quien no es del equipo no responde.
    expect(screen.queryByText("Responder")).toBeNull();
    // Antes: solo la calificacion de Felipe (4, 5, 4 y 3).
    expect(screen.getByText("Usabilidad")).toBeTruthy();
    expect(screen.getAllByText("4 de 5")).toHaveLength(2);

    // Comenta.
    fireEvent.changeText(screen.getByTestId(PrototypeKeys.commentField), "  ¿Funciona sin internet?  ");
    fireEvent.press(screen.getByTestId(PrototypeKeys.send));
    expect(await screen.findByText("¿Funciona sin internet?")).toBeTruthy();
    expect(data.comments.at(-1)).toMatchObject({ project_id: "3", text: "¿Funciona sin internet?", is_team: false });

    // Califica: usabilidad 2 y el resto en 5, el valor de entrada.
    fireEvent.press(screen.getByTestId(PrototypeKeys.giveFeedback));
    expect(await screen.findByText("Califica el prototipo en cada dimensión (1 a 5) y comparte tus sugerencias.")).toBeTruthy();
    fireEvent.press(screen.getByTestId(FeedbackSheetKeys.score("usability", 2)));
    expect(screen.getByText("2 de 5")).toBeTruthy();
    fireEvent.press(screen.getByTestId(FeedbackSheetKeys.save));

    // Despues: usabilidad (4 + 2) / 2 = 3 e innovacion (5 + 5) / 2 = 5.
    expect(await screen.findByText("Editar mi retroalimentación")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("3 de 5")).toBeTruthy());
    expect(screen.getByText("5 de 5")).toBeTruthy();
    expect(data.feedback).toHaveLength(2);
  });

  it("alguien del equipo responde un comentario y no puede calificar", async () => {
    const data = await openAs(DummyData.demoEmail);
    // Carlos es miembro aceptado del proyecto 3: no ve el boton de calificar.
    fireEvent.press(await screen.findByText("Responder"));
    expect(screen.queryByTestId(PrototypeKeys.giveFeedback)).toBeNull();
    expect(screen.getByText("Respondiendo a Mariana Pérez")).toBeTruthy();

    fireEvent.changeText(screen.getByTestId(PrototypeKeys.commentField), "Sí, guarda las lecturas en el equipo.");
    fireEvent.press(screen.getByTestId(PrototypeKeys.send));
    expect(await screen.findByText("Sí, guarda las lecturas en el equipo.")).toBeTruthy();
    expect(screen.queryByText("Respondiendo a Mariana Pérez")).toBeNull();
    expect(data.comments.at(-1)).toMatchObject({ parent_id: "c1", is_team: true });
  });
});
