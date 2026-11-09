import { Row } from "@/src/core/roble/guard";
import { dateOrNull, emptyToNull, idOf, rawListOf, textOf, toFlutterIso } from "@/src/core/roble/rowFormat";
import { Poll, PollQuestion } from "../../domain/entities/Poll";

function questionFromJson(value: unknown): PollQuestion {
  const json = value != null && typeof value === "object" ? (value as Row) : {};
  return {
    text: textOf(json.text),
    options: Array.isArray(json.options) ? json.options.map((o: unknown) => String(o)) : [],
  };
}

// La tabla `polls`, como la leen y la escriben `Poll.fromJson` y
// `Poll.toJsonNoId` de Flutter.
export const PollMapper = {
  fromRow(row: Row): Poll {
    return {
      id: idOf(row),
      projectId: textOf(row.project_id),
      authorId: textOf(row.author_id),
      title: textOf(row.title),
      description: textOf(row.description),
      // Una lista, o un texto JSON con la lista: asi la escribe Flutter.
      questions: rawListOf(row.questions).map(questionFromJson),
      // Sin fecha de cierre, ahora mismo, como Flutter. Una fecha que no se lee
      // tambien: alla `DateTime.parse` revienta, y aqui no se deja caer la lista.
      closesAt: dateOrNull(row.closes_at) ?? new Date(),
      audienceProgram: emptyToNull(row.audience_program),
    };
  },

  // Las preguntas van como texto JSON y la fecha como texto ISO 8601 en hora
  // local. Sin programa, texto vacio.
  toNewRow(p: Poll): Row {
    return {
      project_id: p.projectId,
      author_id: p.authorId,
      title: p.title,
      description: p.description,
      questions: JSON.stringify(p.questions.map((q) => ({ text: q.text, options: q.options }))),
      closes_at: toFlutterIso(p.closesAt),
      audience_program: p.audienceProgram ?? "",
    };
  },
};
