import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { newPoll, Poll } from "@/src/features/poll/domain/entities/Poll";
import { newPollResponse, PollResponse } from "@/src/features/poll/domain/entities/PollResponse";
import { PollRepository } from "@/src/features/poll/domain/repositories/PollRepository";
import CreatePollScreen from "@/src/features/poll/presentation/screens/CreatePollScreen";
import PollResultsScreen from "@/src/features/poll/presentation/screens/PollResultsScreen";
import RespondPollScreen from "@/src/features/poll/presentation/screens/RespondPollScreen";
import { newProject } from "@/src/features/project/domain/entities/Project";
import { renderScreen } from "@/__tests__/support/renderScreen";

// `poll_test.dart`, una por una.

const DAY = 24 * 3600_000;

// ─── Encuestas de prueba ────────────────────────────────────────────────────

const encuestaActiva = (): Poll =>
  newPoll({
    id: "poll1",
    projectId: "p1",
    authorId: "u1",
    title: "Encuesta de prueba",
    description: "Descripción de prueba",
    closesAt: new Date(Date.now() + 7 * DAY),
    questions: [
      { text: "¿Pregunta 1?", options: ["Opción A", "Opción B", "Opción C"] },
      { text: "¿Pregunta 2?", options: ["Sí", "No"] },
    ],
  });

const encuestaCerrada = (): Poll =>
  newPoll({
    id: "poll2",
    projectId: "p1",
    authorId: "u1",
    title: "Encuesta cerrada",
    description: "",
    closesAt: new Date(Date.now() - DAY),
    questions: [{ text: "¿Algo?", options: ["A", "B"] }],
  });

// Los datos en memoria, sin las respuestas sembradas: la encuesta sembrada
// tambien se llama "poll1" y sus respuestas se contarian aqui.
function contenedor(): Container {
  const data = new DummyData({ latencyMs: 0 });
  data.pollResponses = [];
  return createLocalContainer(data);
}

// ─── CreatePollScreen ──────────────────────────────────────────────────────

describe("CreatePollScreen", () => {
  function abrirCrearEncuesta() {
    const proyecto = newProject({
      id: "p1",
      title: "Mi proyecto",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "Ing. de Sistemas",
      currentMembers: 1,
      maxMembers: 3,
      skillsWanted: [],
      leaderId: "u1",
    });
    renderScreen(CreatePollScreen, contenedor(), { params: { project: proyecto } });
  }

  it("muestra el formulario con sus campos principales", async () => {
    abrirCrearEncuesta();

    // El titulo "Crear Encuesta" es de la barra de arriba, que pone la
    // navegacion de la app: aqui se mira la pantalla.
    expect(await screen.findByTestId(CreatePollScreen.key)).toBeTruthy();
    expect(screen.getByTestId(CreatePollScreen.titleFieldKey)).toBeTruthy();
    expect(screen.getByTestId(CreatePollScreen.descriptionFieldKey)).toBeTruthy();
    expect(screen.getByText("Fecha de cierre")).toBeTruthy();
    expect(screen.getByTestId(CreatePollScreen.questionFieldKey(0))).toBeTruthy();
    expect(screen.getByText("Publicar")).toBeTruthy();
  });

  it("sin titulo la validacion impide publicar", async () => {
    abrirCrearEncuesta();

    // Intentar publicar sin llenar nada.
    fireEvent.press(await screen.findByTestId(CreatePollScreen.submitKey));

    // El mensaje del campo titulo debe aparecer.
    expect(await screen.findAllByText("Requerido")).not.toHaveLength(0);
    // La pantalla sigue siendo la de creacion.
    expect(screen.getByTestId(CreatePollScreen.key)).toBeTruthy();
  });

  it("sin fecha de cierre muestra aviso y no publica", async () => {
    abrirCrearEncuesta();

    fireEvent.changeText(await screen.findByTestId(CreatePollScreen.titleFieldKey), "Encuesta de prueba");
    fireEvent.changeText(screen.getByTestId(CreatePollScreen.descriptionFieldKey), "Descripción de prueba");
    fireEvent.changeText(screen.getByTestId(CreatePollScreen.questionFieldKey(0)), "¿Algo?");
    fireEvent.press(screen.getByTestId(CreatePollScreen.submitKey));

    // En Flutter esta prueba se quedaba sin comprobar nada; aqui se mira el aviso.
    expect(await screen.findByText("Debes seleccionar una fecha de cierre")).toBeTruthy();
    expect(screen.getByTestId(CreatePollScreen.key)).toBeTruthy();
  });

  it("propiedad: el botón Publicar responde mientras no está enviando", async () => {
    abrirCrearEncuesta();

    const boton = await screen.findByTestId(CreatePollScreen.submitKey);
    // Mientras no se esta enviando, el boton esta activo.
    expect(boton.props.accessibilityState?.disabled).toBe(false);
  });

  it("el boton Añadir pregunta agrega una nueva tarjeta de pregunta", async () => {
    abrirCrearEncuesta();

    // Al inicio hay 1 pregunta.
    expect(await screen.findByTestId(CreatePollScreen.questionFieldKey(0))).toBeTruthy();
    expect(screen.queryByTestId(CreatePollScreen.questionFieldKey(1))).toBeNull();

    fireEvent.press(screen.getByTestId(CreatePollScreen.addQuestionKey));

    // Ahora hay 2 preguntas.
    expect(screen.getByTestId(CreatePollScreen.questionFieldKey(0))).toBeTruthy();
    expect(screen.getByTestId(CreatePollScreen.questionFieldKey(1))).toBeTruthy();
  });
});

// ─── RespondPollScreen ─────────────────────────────────────────────────────

describe("RespondPollScreen", () => {
  const abrirResponder = (poll: Poll) => renderScreen(RespondPollScreen, contenedor(), { params: { poll } });

  it("muestra las preguntas y opciones de la encuesta", async () => {
    abrirResponder(encuestaActiva());

    // El titulo va en la barra de arriba, que pone la navegacion de la app.
    expect(await screen.findByText("Descripción de prueba")).toBeTruthy();
    expect(screen.getByText("1. ¿Pregunta 1?")).toBeTruthy();
    expect(screen.getByText("2. ¿Pregunta 2?")).toBeTruthy();
    for (const opcion of ["Opción A", "Opción B", "Opción C", "Sí", "No"]) {
      expect(screen.getByText(opcion)).toBeTruthy();
    }
  });

  it("el boton Enviar esta visible", async () => {
    abrirResponder(encuestaActiva());

    expect(await screen.findByTestId(RespondPollScreen.submitKey)).toBeTruthy();
    expect(screen.getByText("Enviar")).toBeTruthy();
  });

  it("propiedad: el boton Enviar responde antes de responder", async () => {
    abrirResponder(encuestaActiva());

    const boton = await screen.findByTestId(RespondPollScreen.submitKey);
    // Responde: el aviso aparecera si se pulsa sin elegir opciones.
    expect(boton.props.accessibilityState?.disabled).toBe(false);
  });

  it("las opciones son radios que se pueden seleccionar", async () => {
    abrirResponder(encuestaActiva());

    // Elegir la primera opcion de la pregunta 1.
    fireEvent.press(await screen.findByText("Opción A"));
    // Elegir la primera opcion de la pregunta 2.
    fireEvent.press(screen.getByText("Sí"));

    expect(screen.getByTestId(RespondPollScreen.optionKey(0, 0)).props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.getByTestId(RespondPollScreen.optionKey(1, 0)).props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.getByTestId(RespondPollScreen.optionKey(0, 1)).props.accessibilityState).toMatchObject({ checked: false });
  });

  it("sin elegir todas las opciones avisa y no envia", async () => {
    abrirResponder(encuestaActiva());

    fireEvent.press(await screen.findByText("Opción A"));
    fireEvent.press(screen.getByTestId(RespondPollScreen.submitKey));

    expect(await screen.findByText("Debes responder todas las preguntas")).toBeTruthy();
  });

  it("campo de comentario opcional es visible", async () => {
    abrirResponder(encuestaActiva());

    expect(await screen.findByTestId(RespondPollScreen.commentFieldKey)).toBeTruthy();
    expect(screen.getAllByText("¿Por qué elegiste estas opciones? (Opcional)").length).toBeGreaterThan(0);
  });
});

// ─── PollResultsScreen ─────────────────────────────────────────────────────

describe("PollResultsScreen", () => {
  async function abrirResultados(poll: Poll, respuestas: PollResponse[] = []) {
    const container = contenedor();
    // Las respuestas van al repositorio: la pantalla las pide al abrirse.
    for (const r of respuestas) {
      await container.resolve<PollRepository>(TOKENS.PollRepo).createResponse(r);
    }
    renderScreen(PollResultsScreen, container, { params: { poll } });
    await screen.findByTestId(PollResultsScreen.key);
  }

  const respuesta = (respondentId: string, answers: number[], comment: string | null = null) =>
    newPollResponse({ pollId: "poll1", respondentId, answers, comment });

  it("muestra el titulo de la encuesta y sus preguntas", async () => {
    await abrirResultados(encuestaActiva());

    expect(screen.getByText("Encuesta de prueba")).toBeTruthy();
    expect(screen.getByText("1. ¿Pregunta 1?")).toBeTruthy();
    expect(screen.getByText("2. ¿Pregunta 2?")).toBeTruthy();
    expect(screen.getByText("Opción A")).toBeTruthy();
    expect(screen.getByText("Opción B")).toBeTruthy();
  });

  it("sin respuestas muestra 0 (0.0%) para cada opcion", async () => {
    await abrirResultados(encuestaActiva());

    // Con cero respuestas todas las opciones muestran "0 (0.0%)".
    expect(screen.getAllByText("0 (0.0%)")).toHaveLength(5);
  });

  it("con respuestas calcula el conteo y el porcentaje correctamente", async () => {
    // 2 eligen A (indice 0) en la pregunta 1, 1 elige B (indice 1).
    await abrirResultados(encuestaActiva(), [respuesta("u2", [0, 0]), respuesta("u3", [0, 1]), respuesta("u4", [1, 0])]);

    // Opcion A: 2 de 3 = 66.7%. En la pregunta 2, "Sí" tambien recibe 2 de 3
    // (las respuestas [0, 1, 0]), asi que el mismo texto sale dos veces.
    expect(await screen.findAllByText("2 (66.7%)")).toHaveLength(2);
    // Opcion B: 1 de 3 = 33.3%.
    expect(screen.getAllByText("1 (33.3%)").length).toBeGreaterThan(0);
  });

  it("con respuestas con ceros el calculo es 0 (0.0%) para opciones no elegidas", async () => {
    // Todos eligen A en la pregunta 1, ninguno elige C.
    await abrirResultados(encuestaActiva(), [respuesta("u2", [0, 0])]);

    // Solo hay 1 respuesta: A = 1 (100%), C = 0 (0.0%). La pregunta 2 tambien
    // recibe su unica respuesta en "Sí": 1 (100.0%) sale dos veces.
    expect(await screen.findAllByText("1 (100.0%)")).toHaveLength(2);
    expect(screen.getAllByText("0 (0.0%)").length).toBeGreaterThan(0);
  });

  it("encuesta activa muestra el texto de fecha de cierre", async () => {
    await abrirResultados(encuestaActiva());

    expect(screen.getAllByText(/Abierta hasta/)).toHaveLength(1);
  });

  it("encuesta cerrada no muestra la fecha de cierre como activa", async () => {
    await abrirResultados(encuestaCerrada());

    // Una encuesta cerrada no tiene el "Abierta hasta...".
    expect(screen.queryByText(/Abierta hasta/)).toBeNull();
  });

  it("sin comentarios muestra el texto de estado vacío", async () => {
    await abrirResultados(encuestaActiva());

    expect(screen.getByText("No hay comentarios.")).toBeTruthy();
  });

  it("con comentarios los muestra en tarjetas", async () => {
    await abrirResultados(encuestaActiva(), [respuesta("u2", [0, 0], "Este es mi comentario")]);

    expect(await screen.findByText("Este es mi comentario")).toBeTruthy();
    expect(screen.queryByText("No hay comentarios.")).toBeNull();
  });

  it("propiedad: la barra refleja el porcentaje", async () => {
    // 1 de 2 elige la opcion A = 50%.
    await abrirResultados(encuestaActiva(), [respuesta("u2", [0, 0]), respuesta("u3", [1, 1])]);

    await waitFor(() =>
      expect(screen.getByTestId(PollResultsScreen.barKey(0, 0)).props.accessibilityValue).toMatchObject({ now: 50 }),
    );
  });
});
