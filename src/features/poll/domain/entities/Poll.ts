// Una pregunta de una encuesta, con sus opciones: el `PollQuestion` de `poll.dart`.
export type PollQuestion = {
  text: string;
  options: string[];
};

// Una encuesta de un proyecto: el `Poll` de `poll.dart`.
export type Poll = {
  id: string | null;
  projectId: string;
  authorId: string;
  title: string;
  description: string;
  questions: PollQuestion[];
  closesAt: Date;
  // A que programa va dirigida; `null` es a todos.
  audienceProgram: string | null;
};

export function newPoll(
  fields: Omit<Poll, "id" | "audienceProgram"> & Partial<Pick<Poll, "id" | "audienceProgram">>,
): Poll {
  return { id: null, audienceProgram: null, ...fields };
}

// Abierta mientras no llega la fecha de cierre.
export const isActive = (poll: Poll, now: Date = new Date()) => now.getTime() < poll.closesAt.getTime();
