// Lo que la funcionalidad entiende cuando el servidor dice que no.
export class ApplicationFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationFailure";
  }
}
