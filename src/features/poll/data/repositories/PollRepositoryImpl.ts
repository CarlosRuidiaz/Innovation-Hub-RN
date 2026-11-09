import { guardRoble } from "@/src/core/roble/guard";
import { Poll } from "../../domain/entities/Poll";
import { PollResponse } from "../../domain/entities/PollResponse";
import { PollFailure } from "../../domain/PollFailure";
import { PollRepository } from "../../domain/repositories/PollRepository";
import { PollDataSource } from "../datasources/PollDataSource";
import { PollMapper } from "../mappers/PollMapper";
import { PollResponseMapper } from "../mappers/PollResponseMapper";

const failure = (m: string) => new PollFailure(m);

// Las encuestas: decide y traduce, no habla.
export class PollRepositoryImpl implements PollRepository {
  constructor(private readonly source: PollDataSource) {}

  getPollsForProject(projectId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readPolls({ project_id: projectId });
      return rows.map(PollMapper.fromRow);
    }, failure);
  }

  createPoll(poll: Poll) {
    return guardRoble(async () => PollMapper.fromRow(await this.source.createPoll(PollMapper.toNewRow(poll))), failure);
  }

  getResponsesForPoll(pollId: string) {
    return guardRoble(async () => {
      const rows = await this.source.readResponses({ poll_id: pollId });
      return rows.map(PollResponseMapper.fromRow);
    }, failure);
  }

  createResponse(response: PollResponse) {
    return guardRoble(
      async () => PollResponseMapper.fromRow(await this.source.createResponse(PollResponseMapper.toNewRow(response))),
      failure,
    );
  }
}
