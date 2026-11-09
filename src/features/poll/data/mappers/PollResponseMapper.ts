import { Row } from "@/src/core/roble/guard";
import { emptyToNull, idOf, intOf, rawListOf, textOf } from "@/src/core/roble/rowFormat";
import { PollResponse } from "../../domain/entities/PollResponse";

// La tabla `poll_responses`, como la leen y la escriben `PollResponse.fromJson`
// y `PollResponse.toJsonNoId` de Flutter.
export const PollResponseMapper = {
  fromRow(row: Row): PollResponse {
    return {
      id: idOf(row),
      pollId: textOf(row.poll_id),
      respondentId: textOf(row.respondent_id),
      // Un indice que no es entero cuenta como 0, como `int.tryParse(...) ?? 0`.
      answers: rawListOf(row.answers).map((a) => intOf(a)),
      comment: emptyToNull(row.comment),
    };
  },

  // Las respuestas van como texto JSON; sin comentario, texto vacio.
  toNewRow(r: PollResponse): Row {
    return {
      poll_id: r.pollId,
      respondent_id: r.respondentId,
      answers: JSON.stringify(r.answers),
      comment: r.comment ?? "",
    };
  },
};
