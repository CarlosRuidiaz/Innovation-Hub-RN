// Lo que la funcionalidad entiende cuando el servidor dice que no.
export class ShowcaseFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowcaseFailure";
  }
}
