import { PollMapper } from "@/src/features/poll/data/mappers/PollMapper";
import { PollResponseMapper } from "@/src/features/poll/data/mappers/PollResponseMapper";
import { isActive, newPoll } from "@/src/features/poll/domain/entities/Poll";
import { newPollResponse } from "@/src/features/poll/domain/entities/PollResponse";

// Las tablas `polls` y `poll_responses` contra los modelos de Flutter
// (`poll_model_test.dart`).
describe("PollMapper", () => {
  const poll = newPoll({
    id: "poll1",
    projectId: "p1",
    authorId: "u1",
    title: "Encuesta de satisfaccion",
    description: "Descripcion corta",
    questions: [{ text: "¿Qué te gustó?", options: ["Sí", "No", "Tal vez"] }],
    closesAt: new Date(2030, 4, 20, 10, 0),
  });

  it("toNewRow escribe exactamente lo que toJsonNoId de Flutter", () => {
    expect(PollMapper.toNewRow(poll)).toStrictEqual({
      project_id: "p1",
      author_id: "u1",
      title: "Encuesta de satisfaccion",
      description: "Descripcion corta",
      questions: '[{"text":"¿Qué te gustó?","options":["Sí","No","Tal vez"]}]',
      closes_at: "2030-05-20T10:00:00.000",
      audience_program: "",
    });
  });

  it("toNewRow con programa y sin preguntas", () => {
    expect(
      PollMapper.toNewRow(
        newPoll({ projectId: "p1", authorId: "u1", title: "T", description: "", questions: [], closesAt: new Date(2026, 11, 1, 8, 30, 5, 7), audienceProgram: "Psicología" }),
      ),
    ).toStrictEqual({
      project_id: "p1",
      author_id: "u1",
      title: "T",
      description: "",
      questions: "[]",
      closes_at: "2026-12-01T08:30:05.007",
      audience_program: "Psicología",
    });
  });

  it("fromRow con las preguntas como lista", () => {
    const p = PollMapper.fromRow({
      _id: "poll_1",
      project_id: "proj_1",
      author_id: "user_1",
      title: "Encuesta UX",
      description: "Feedback de interfaz",
      questions: [{ text: "Te gusto el diseno?", options: ["Si", "No", "Tal vez"] }],
      closes_at: "2030-05-20T10:00:00.000",
      audience_program: "Ingenieria de Sistemas",
    });
    expect(p).toEqual({
      id: "poll_1",
      projectId: "proj_1",
      authorId: "user_1",
      title: "Encuesta UX",
      description: "Feedback de interfaz",
      questions: [{ text: "Te gusto el diseno?", options: ["Si", "No", "Tal vez"] }],
      closesAt: new Date(2030, 4, 20, 10, 0),
      audienceProgram: "Ingenieria de Sistemas",
    });
  });

  it("fromRow con las preguntas como texto JSON y sin programa", () => {
    const p = PollMapper.fromRow({
      questions: '[{"text":"Pregunta codificada","options":["Opc 1","Opc 2"]}]',
      closes_at: "2030-05-20T10:00:00.000",
      audience_program: "",
    });
    expect(p.questions).toEqual([{ text: "Pregunta codificada", options: ["Opc 1", "Opc 2"] }]);
    expect(p.audienceProgram).toBeNull();
  });

  it("fromRow con datos que faltan: sin preguntas y cierra ahora", () => {
    const before = Date.now();
    const p = PollMapper.fromRow({ questions: null, closes_at: null, audience_program: "" });
    expect(p).toMatchObject({ id: null, projectId: "", authorId: "", title: "", questions: [], audienceProgram: null });
    expect(p.closesAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(PollMapper.fromRow({ questions: "no_es_json" }).questions).toEqual([]);
  });

  it("ida y vuelta", () => {
    expect(PollMapper.fromRow({ _id: "poll1", ...PollMapper.toNewRow(poll) })).toEqual(poll);
  });

  it("isActive mientras no llega el cierre", () => {
    const now = new Date(2030, 0, 1);
    expect(isActive(poll, now)).toBe(true);
    expect(isActive(poll, new Date(2031, 0, 1))).toBe(false);
  });
});

describe("PollResponseMapper", () => {
  it("toNewRow escribe exactamente lo que toJsonNoId de Flutter", () => {
    expect(PollResponseMapper.toNewRow(newPollResponse({ pollId: "poll1", respondentId: "u8", answers: [0, 2] }))).toStrictEqual({
      poll_id: "poll1",
      respondent_id: "u8",
      answers: "[0,2]",
      comment: "",
    });
    expect(PollResponseMapper.toNewRow(newPollResponse({ pollId: "poll1", respondentId: "u8", answers: [1], comment: "Muy interesante" }))).toStrictEqual({
      poll_id: "poll1",
      respondent_id: "u8",
      answers: "[1]",
      comment: "Muy interesante",
    });
  });

  it("fromRow lee las respuestas como lista o texto, y lo que no es indice es 0", () => {
    expect(PollResponseMapper.fromRow({ _id: "r1", poll_id: "poll1", respondent_id: "u8", answers: [0, 2], comment: "Muy interesante" })).toEqual({
      id: "r1",
      pollId: "poll1",
      respondentId: "u8",
      answers: [0, 2],
      comment: "Muy interesante",
    });
    // `PollResponse.fromJson` en Dart: [1, 2, 0] null.
    const r = PollResponseMapper.fromRow({ answers: '[1, "2", "x"]', comment: "" });
    expect(r.answers).toEqual([1, 2, 0]);
    expect(r.comment).toBeNull();
    expect(PollResponseMapper.fromRow({ answers: "no_es_json" }).answers).toEqual([]);
  });

  it("ida y vuelta", () => {
    const r = newPollResponse({ pollId: "poll1", respondentId: "u8", answers: [2, 0], comment: "Bien" });
    expect(PollResponseMapper.fromRow({ _id: "r2", ...PollResponseMapper.toNewRow(r) })).toEqual({ ...r, id: "r2" });
  });
});
