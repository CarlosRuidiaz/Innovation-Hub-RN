// Lo que la funcionalidad entiende cuando el servidor dice que no.
export class FollowFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FollowFailure";
  }
}
