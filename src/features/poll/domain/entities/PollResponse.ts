// La respuesta de un estudiante a una encuesta: el `PollResponse` de
// `poll_response.dart`.
export type PollResponse = {
  id: string | null;
  pollId: string;
  respondentId: string;
  // Los indices elegidos, uno por pregunta.
  answers: number[];
  comment: string | null;
};

export function newPollResponse(
  fields: Omit<PollResponse, "id" | "comment"> & Partial<Pick<PollResponse, "id" | "comment">>,
): PollResponse {
  return { id: null, comment: null, ...fields };
}
