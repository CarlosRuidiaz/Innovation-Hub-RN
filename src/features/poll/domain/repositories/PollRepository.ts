import { Poll } from "../entities/Poll";
import { PollResponse } from "../entities/PollResponse";

// `IPollRepository` de Flutter.
export interface PollRepository {
  getPollsForProject(projectId: string): Promise<Poll[]>;

  createPoll(poll: Poll): Promise<Poll>;

  getResponsesForPoll(pollId: string): Promise<PollResponse[]>;

  createResponse(response: PollResponse): Promise<PollResponse>;
}
